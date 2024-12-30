import re
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from amadeus import Client, ResponseError
from datetime import datetime, timezone, timedelta
import logging
from rasa_sdk.forms import FormValidationAction
from rasa_sdk.types import DomainDict
from dotenv import load_dotenv
import os
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.collection import Collection
import requests
from rasa_sdk.events import AllSlotsReset, Restarted, SlotSet, ActionExecuted, UserUtteranceReverted, FollowupAction
import random
import webbrowser

# Load environment variables
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..", ".env"))
load_dotenv(dotenv_path=env_path)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ActionResetHotelForm(Action):
    """Custom action to reset hotel-related slots before starting a new hotel search."""

    def name(self) -> Text:
        """Return the action's name."""
        return "action_reset_hotel_form"

    def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        """Execute the action to reset hotel-related slots.
        
        Args:
            dispatcher: The dispatcher which is used to send messages back to the user.
            tracker: The state tracker for the current user.
            domain: The bot's domain.

        Returns:
            A list of events to reset specific slots.
        """
        try:
            logger.info("Resetting hotel form slots")
            
            # List of hotel-related slots to reset
            hotel_slots = [
                "city",
                "check_in",
                "check_out",
                "hotel_search_completed",
                "selected_hotel"
            ]

            # Create SlotSet events for each slot
            reset_events = [SlotSet(slot_name, None) for slot_name in hotel_slots]

            # Set hotel_search_completed to False
            reset_events.append(SlotSet("hotel_search_completed", False))

            # Clear flight date slots to prevent interference
            reset_events.append(SlotSet("departure_date", None))
            reset_events.append(SlotSet("return_date", None))

            logger.info("Successfully reset hotel form slots")
            return reset_events

        except Exception as e:
            logger.error(f"Error resetting hotel form slots: {str(e)}")
            # In case of error, reset all slots as a fallback
            return [AllSlotsReset()]

class ActionResetFlightForm(Action):
    def name(self) -> Text:
        return "action_reset_flight_form"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        logger.info("Action 'action_reset_flight_form' started.")
        return [
            SlotSet("origin", None),
            SlotSet("destination", None),
            SlotSet("departure_date", None),
            SlotSet("return_date", None),
            SlotSet("trip_type", None),
            # Clear hotel date slots to prevent interference
            SlotSet("check_in", None),
            SlotSet("check_out", None)
        ]

class ActionSaveTravelRequest(Action):
    def name(self) -> Text:
        return "action_save_travel_request"

    def _generate_request_number(self) -> str:
        """Generate a unique request number"""
        tz = timezone(timedelta(hours=8))  # UTC+8
        timestamp = datetime.now(tz)
        return f"TR-{timestamp.strftime('%Y%m')}-{random.randint(1000, 9999)}"

    async def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:
        try:
            logger.info("Action 'action_save_travel_request' started.")
            tz = timezone(timedelta(hours=8))
            # Get the preview data
            travel_request_preview = tracker.get_slot("travel_request_preview")
            data = travel_request_preview.get("pdfData")
            logger.info("this is pdfData", data)
            if not travel_request_preview:
                dispatcher.utter_message(
                    text="No travel request preview found. Please start over."
                )
                return []

            # Create the final travel request document
            travel_request = {
                "request_number": self._generate_request_number(),
                "user_id": None,  # Will be set after user lookup
                "user_email": travel_request_preview.get("user_email"),
                "status": "pending",
                "trip_type": travel_request_preview["flight_details"]["trip_type"],
                "total_cost": travel_request_preview["total_cost"],
                "flight_details": {
                    "trip_type": travel_request_preview["flight_details"]["trip_type"],
                    "origin": travel_request_preview["flight_details"]["origin"],
                    "destination": travel_request_preview["flight_details"]["destination"],
                    "outbound_flight": travel_request_preview["flight_details"]["outbound_flight"],
                },
                "hotel_details": travel_request_preview["hotel_details"],
                "approval": {
                    "status": "pending",
                },
                "timestamps": {
                    "created_at": datetime.now(tz),
                    "updated_at": datetime.now(tz)
                },
                "documents": [],
                "notes": []
            }

            # Add return flight details if it's a round trip
            if travel_request_preview["flight_details"]["trip_type"] == "round":
                travel_request["flight_details"]["return_flight"] = (
                    travel_request_preview["flight_details"]["return_flight"]
                )

            # Save to MongoDB
            db_client = MongoDBClient()
            result = db_client.database["travel_requests"].insert_one(travel_request)

            # generate pdf and save in mongoDb
            token = tracker.get_slot("auth_token")
            # Define the URL for the backend PDF generation endpoint
            backend_url = os.getenv('BACKEND_URL', 'http://localhost:5000')
            backend_url_pdf = f"{backend_url}/api/chatbot/chatbots/generate-custom"
            backend_url_download = f"{backend_url}/api/chatbot/chatbots/generate-pdf/download"

            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }

            # Make a request to the backend to generate the PDF
            try:
                response = requests.post(backend_url_pdf, json=data, headers=headers)
                response.raise_for_status()
                
                response_data = response.json()
                file_id = response_data.get("fileId")

                # # Construct download link
                download_link = f"{backend_url_download}/{file_id}"
                dispatcher.utter_message(
                    text=f"Your PDF has been generated successfully! Click the link to download: {download_link}",
                )

            except requests.exceptions.RequestException as e:
                dispatcher.utter_message(text="Sorry, an error occurred while generating the PDF.")
                print(f"Error generating PDF: {e}")

            if result.inserted_id:
                # Create a more detailed confirmation message based on trip type
                trip_type = travel_request["trip_type"]
                total_cost = travel_request["total_cost"]
                
                confirmation_message = (
                    f"✅ Travel Request Saved Successfully!\n\n"
                    f"📋 Request Number: {travel_request['request_number']}\n"
                    f"✈️ Trip Type: {trip_type.title()}\n"
                    f"💰 Total Cost: RM {total_cost:.2f}\n"
                    f"🔍 Status: Pending Approval\n\n"
                    f"Your request has been submitted and is pending approval.\n"
                    f"You will be notified once it's reviewed."
                )

                dispatcher.utter_message(text=confirmation_message)

                # Clear the preview and reset completion flags
                return [
                    SlotSet("travel_request_id", str(result.inserted_id)),
                    SlotSet("travel_request_preview", None),
                    SlotSet("flight_search_completed", False),
                    SlotSet("hotel_search_completed", False)
                ]

        except Exception as e:
            logger.error(f"Error saving travel request: {str(e)}")
            dispatcher.utter_message(
                text="Sorry, there was an error saving your travel request. Please try again."
            )
            return []

class ActionMarkFlightSearchComplete(Action):
    def name(self) -> Text:
        return "action_mark_flight_search_complete"

    async def run(
        self, 
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:
        # Check if flight is selected
        selected_flight = tracker.get_slot("selected_flight")
        if not selected_flight:
            return []  # Don't mark as complete if no flight is selected
            
        # Check if hotel search is already completed
        hotel_search_completed = tracker.get_slot("hotel_search_completed")
        
        if hotel_search_completed:
            dispatcher.utter_message(
                text="Great! Both flight and hotel selections are complete. Would you like to save your travel request?",
                buttons=[
                    {"title": "Yes, save it", "payload": "/save_travel_request"},
                    {"title": "No, thanks", "payload": "/deny"}
                ]
            )
        else:
            dispatcher.utter_message(
                text="Flight selection completed! Would you like to proceed with hotel search?",
                buttons=[
                    {"title": "Yes, search hotels", "payload": "/search_hotels"},
                    {"title": "No, thanks", "payload": "/deny"}
                ]
            )
        
        return [SlotSet("flight_search_completed", True)]

class ActionMarkHotelSearchComplete(Action):
    def name(self) -> Text:
        return "action_mark_hotel_search_complete"

    async def run(
        self, 
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:
        logger.info("Action 'action_mark_hotel_search_complete' started.")
        selected_hotel = tracker.get_slot("selected_hotel")
        if not selected_hotel:
            return []  
            
        events = [SlotSet("hotel_search_completed", True)]
            
        flight_search_completed = tracker.get_slot("flight_search_completed")
        selected_flight = tracker.get_slot("selected_flight")
        
        if flight_search_completed and selected_flight:
            dispatcher.utter_message(
                text="Great! Both flight and hotel selections are complete. Would you like to generate your travel request?",
                buttons=[
                    {"title": "Yes, please", "payload": "/save_travel_request"},
                    {"title": "No, thanks", "payload": "/deny"}
                ]
            )
        else:
            dispatcher.utter_message(
                text="Hotel selection completed! Would you like to proceed with flight search?",
                buttons=[
                    {"title": "Yes, search flights", "payload": "/search_flights"},
                    {"title": "No, thanks", "payload": "/deny"}
                ]
            )
        
        return events

class ActionFetchUserPreferences(Action):
    def name(self) -> str:
        return "action_fetch_user_preferences"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        # Fetch the token from the tracker
        token = tracker.get_slot("auth_token")
        logger.info("Action 'action_fetch_user_preferences' started.")
        if not token:
            dispatcher.utter_message(text="No valid token found. Please log in again.")
            return []

        try:
            # Get the database instance from the MongoDBClient singleton
            db_client = MongoDBClient()
            user_collection = db_client.database["users"]  # Assuming the collection is named 'user'

            # Query the user collection using the token
            user_data = user_collection.find_one({"token": token})

            if user_data:
                # Extract preferences from the nested object
                preferences = user_data.get("preferences", {})
                cabin_class = preferences.get("cabinClass", "No cabin class preference set.")
                hotel_rating = preferences.get("hotelRating", "No hotel rating preference set.")

                return [
                    SlotSet("cabin_class", cabin_class),
                    SlotSet("hotel_rating", hotel_rating),
                ]
            else:
                dispatcher.utter_message(text="No preferences found for the provided token.")
                return []
        except Exception as e:
            dispatcher.utter_message(text=f"An error occurred while fetching preferences: {str(e)}")
            return []


class ActionRestartConversation(Action):
    """Action to handle conversation restart"""
    
    def name(self) -> Text:
        return "action_restart_conversation"
        
    async def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:
        logger.info("Action 'action_restart_conversation' started.")
        # Clear all slots
        events = [AllSlotsReset()]
        
        # Keep authentication-related slots if they exist
        auth_token = tracker.get_slot("auth_token")
        user_email = tracker.get_slot("user_email")
        
        if auth_token:
            events.append(SlotSet("auth_token", auth_token))
        if user_email:
            events.append(SlotSet("user_email", user_email))
            
        # Add Restarted event
        events.append(Restarted())
        
        # Confirm restart
        dispatcher.utter_message(response="utter_confirm_restart")
        
        return events

class MongoDBClient:
    """Singleton class for MongoDB client"""
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            try:
                # Get MongoDB connection string from environment variables
                mongodb_uri = os.getenv("MONGODB_ATLAS_URI")
                db_name = "Voxia"
                
                if not mongodb_uri:
                    logger.error("MongoDB connection string not found in environment variables")
                    raise ValueError("MongoDB connection string not found in environment variables")
                
                # Initialize client with timezone aware settings
                cls._instance.client = MongoClient(
                    mongodb_uri,
                    tz_aware=True,  # Enable timezone awareness
                    tzinfo=timezone(timedelta(hours=8))  # Set UTC+8 timezone
                )
                cls._instance.db = cls._instance.client[db_name]
                logger.info(f"Successfully connected to MongoDB database: {db_name}")
                
            except Exception as e:
                logger.error(f"Failed to initialize MongoDB client: {str(e)}")
                raise
        return cls._instance

    @property
    def database(self) -> Database:
        return self.db
class AmadeusClient:
    """Singleton class for Amadeus API client"""
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            try:
                # Get credentials from environment variables
                client_id = os.getenv("AMADEUS_CLIENT_ID")
                client_secret = os.getenv("AMADEUS_CLIENT_SECRET")
                
                if not client_id or not client_secret:
                    logger.error("Amadeus credentials not found in environment variables")
                    raise ValueError("Amadeus credentials not found in environment variables")
                
                # Log credential presence (safely)
                logger.info("Amadeus credentials found:")
                logger.info(f"client_id length: {len(client_id)}")
                logger.info(f"client_secret length: {len(client_secret)}")
                
                # Initialize client
                cls._instance.client = Client(
                    client_id=client_id,
                    client_secret=client_secret,
                    hostname='test'
                )
                logger.info("Successfully initialized Amadeus client")
            except Exception as e:
                logger.error(f"Failed to initialize Amadeus client: {str(e)}")
                raise
        return cls._instance

    @property
    def amadeus(self):
        return self.client

class ActionSetTripType(Action):
    def name(self) -> Text:
        return "action_set_trip_type"

    async def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        logger.info("Action 'action_set_trip_type' started.")
        intent = tracker.latest_message.get('intent', {}).get('name')
        
        if intent == "single_trip":
            trip_type = "single"
        elif intent == "round_trip":
            trip_type = "round"
        else:
            return []
        
        # Set the trip type and move to next slot
        return [
            SlotSet("trip_type", trip_type),
            SlotSet("requested_slot", "origin")  # Move to asking for origin
        ]

class ActionSearchFlights(Action):
    def name(self) -> Text:
        return "action_search_flights"
        
    def validate_flight_params(self, origin: str, destination: str, departure_date: str, return_date: str = None, trip_type: str = "single", cabin_class: str = None) -> bool:
        """Validate flight search parameters"""
        logger.info("Action 'action_search_flights' started.")
        if not all([origin, destination, departure_date]):
            return False
            
        try:
            # Convert to datetime objects and strip time component
            departure = datetime.strptime(departure_date, '%Y-%m-%d').date()
            current_date = datetime.now().date()
            
            if return_date and trip_type == "round":
                return_d = datetime.strptime(return_date, '%Y-%m-%d').date()
                return return_d > departure and departure >= current_date
            
            return departure >= current_date
        except ValueError:
            return False

    @staticmethod
    def format_duration(duration: str) -> str:
        """Convert ISO 8601 duration (e.g., 'PT4H55M') to a readable format like '4 hours 55 minutes'."""
        hours = minutes = 0
        match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?', duration)
        if match:
            if match.group(1):
                hours = int(match.group(1))
            if match.group(2):
                minutes = int(match.group(2))
        
        formatted_duration = []
        if hours > 0:
            formatted_duration.append(f"{hours} hour{'s' if hours > 1 else ''}")
        if minutes > 0:
            formatted_duration.append(f"{minutes} minute{'s' if minutes > 1 else ''}")
        
        return ' '.join(formatted_duration)

    def format_flight_details(self, offer: Dict[Text, Any], carriers: Dict[Text, str]) -> str:
        """Format flight offer details for display"""
        try:
            price = offer['price']['total']
            itinerary = offer['itineraries'][0]
            segments = itinerary['segments']
            
            # Get first segment and last segment for proper origin/destination display
            first_segment = segments[0]
            last_segment = segments[-1]

            carrier_code = first_segment['carrierCode']
            airline_name = carriers.get(carrier_code, carrier_code)
            
            departure_time = datetime.fromisoformat(first_segment['departure']['at'].replace('Z', '')).strftime('%Y-%m-%d %H:%M')
            final_arrival_time = datetime.fromisoformat(last_segment['arrival']['at'].replace('Z', '')).strftime('%Y-%m-%d %H:%M')

            formatted_duration = self.format_duration(itinerary['duration'])

            traveler_pricings = offer.get("travelerPricings", [])
            cabin_class = (
                traveler_pricings[0]['fareDetailsBySegment'][0]['cabin']
                if traveler_pricings else "N/A"
            )
            
            # Format layover information if there are multiple segments
            layover_info = ""
            if len(segments) > 1:
                layovers = []
                for i in range(len(segments) - 1):
                    current_arrival = datetime.fromisoformat(segments[i]['arrival']['at'].replace('Z', ''))
                    next_departure = datetime.fromisoformat(segments[i + 1]['departure']['at'].replace('Z', ''))
                    layover_duration = next_departure - current_arrival
                    layover_hours = int(layover_duration.total_seconds() // 3600)
                    layover_minutes = int((layover_duration.total_seconds() % 3600) // 60)
                    
                    layovers.append(f"{segments[i]['arrival']['iataCode']} ({layover_hours}h {layover_minutes}m)")
                
                layover_info = f"\n🔄 Layovers: {' → '.join(layovers)}"
            
            return (
                f"🛩️ Airline: {airline_name}\n"
                f"💺 Cabin Class: {cabin_class.capitalize()}\n"
                f"🛫 Flight: {first_segment['carrierCode']}{first_segment['number']}\n"
                f"💰 Price: RM {price}\n"
                f"⏱️ Duration: {formatted_duration}\n"
                f"🛫 Departure: {departure_time}\n"
                f"🛬 Arrival: {final_arrival_time}\n"
                f"📍 From: {first_segment['departure']['iataCode']} to {last_segment['arrival']['iataCode']}"
                f"{layover_info}"
            )
        except Exception as e:
            logger.error(f"Error formatting flight details: {str(e)}")
            return "Error formatting flight details"


    async def search_flights(self, amadeus, origin: str, destination: str, date: str, cabin_class: str) -> List[str]:
        """Search flights for a given route and format the results"""
        try:
            response = amadeus.shopping.flight_offers_search.get(
                originLocationCode=origin,
                destinationLocationCode=destination,
                departureDate=date,
                adults=1,
                max=3,
                currencyCode="MYR",
                travelClass=cabin_class.upper()
            )
            
            if response.data:
                carriers = response.result['dictionaries']['carriers']
                flight_details = [self.format_flight_details(offer, carriers) for offer in response.data[:3]]
                return flight_details
            return []

        except Exception as e:
            logger.error(f"Error searching flights: {str(e)}")
            return []

    async def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:
        # Get slots
        trip_type = tracker.get_slot("trip_type")
        origin = tracker.get_slot("origin")
        destination = tracker.get_slot("destination")
        departure_date = tracker.get_slot("departure_date")
        return_date = tracker.get_slot("return_date") if trip_type == "round" else None
        cabin_class = tracker.get_slot("cabin_class")
        
        # Log the received values
        logger.info(f"Received values - Trip Type: {trip_type}, Origin: {origin}, Destination: {destination}, "
                   f"Departure: {departure_date}, Return: {return_date}, Cabin Class: {cabin_class}")
        
        # Validate parameters
        if not self.validate_flight_params(origin, destination, departure_date, return_date, trip_type, cabin_class):
            dispatcher.utter_message(
                text="Please provide valid flight details."
            )
            return [SlotSet("flights_found", False)]
            
        try:
            logger.info(f"Searching {trip_type} trip flights: {origin} -> {destination} on {departure_date}")
            
            amadeus = AmadeusClient().amadeus
            
            # Search outbound flights
            outbound_details = await self.search_flights(amadeus, origin, destination, departure_date, cabin_class)
            
            if outbound_details:
                if trip_type == "single":
                    dispatcher.utter_message(text="Here are your flight options:")
                    
                    # Create buttons for each flight option
                    buttons = []
                    for idx, flight in enumerate(outbound_details, 1):
                        dispatcher.utter_message(text=f"Option {idx}:\n{flight}")
                        buttons.append({
                            "title": f"Select Flight {idx}",
                            "payload": f"/select_flight{{\"flight_number\": \"{idx-1}\"}}"
                        })
                    
                    # Display selection buttons in a separate message
                    dispatcher.utter_message(text="Please select your flight:", buttons=buttons)
                    
                    return [
                        SlotSet("flights_found", True),
                        SlotSet("flight_options", outbound_details)
                    ]

                elif trip_type == "round" and return_date:
                    return_details = await self.search_flights(amadeus, destination, origin, return_date, cabin_class)
                    
                    if return_details:
                        # Show outbound options
                        dispatcher.utter_message(text=f"✈️ Outbound Options ({departure_date}):")
                        buttons = []
                        for idx, flight in enumerate(outbound_details, 1):
                            dispatcher.utter_message(text=f"Option {idx}:\n{flight}")
                            buttons.append({
                                "title": f"Select Outbound Flight {idx}",
                                "payload": f"/select_flight{{\"flight_number\": \"{idx-1}\"}}"
                            })
                        
                        dispatcher.utter_message(text="Please select your outbound flight:", buttons=buttons)
                        
                        return [
                            SlotSet("flights_found", True),
                            SlotSet("outbound_options", outbound_details),
                            SlotSet("return_options", return_details),
                            SlotSet("flight_options", outbound_details)  # Initially set to outbound options
                        ]
                    else:
                        dispatcher.utter_message(
                            text=f"Sorry, no return flights found for {return_date}."
                        )
                        return [
                            SlotSet("flights_found", False),
                        ]
            else:
                dispatcher.utter_message(
                    text=f"Sorry, no outbound flights found for {departure_date}."
                )
                return [
                    SlotSet("flights_found", False),
                ]
                
        except ResponseError as error:
            logger.error(f"Amadeus API error: [{error.response.status_code}] {error.response.body}")
            return [
                    SlotSet("flights_found", False),
                ]
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return [
                    SlotSet("flights_found", False),
                ]

    
class ActionSearchHotels(Action):
    """Rasa action for searching hotels using Amadeus API"""

    def name(self) -> Text:
        return "action_search_hotels"

    def validate_hotel_params(self, city: str, check_in: str, check_out: str, hotel_rating: str) -> bool:
        logger.info("Action 'action_search_hotels' started.")
        """Validate hotel search parameters"""
        if not all([city, check_in, check_out]):
            return False

        try:
            check_in_date = datetime.strptime(check_in, '%Y-%m-%d')
            check_out_date = datetime.strptime(check_out, '%Y-%m-%d')
            return check_out_date > check_in_date
        except ValueError:
            return False

    def get_hotels_by_city(self, amadeus: Client, city_code: str, hotel_rating: str) -> List[Dict[Text, Any]]:
        """
        Get list of hotels in a city using Amadeus API

        Args:
            amadeus: Amadeus client instance
            city_code: IATA city code (e.g., 'KUL' for Kuala Lumpur)

        Returns:
            List of hotel information including hotelIds and ratings
        """
        try:
            response = amadeus.get(
                '/v1/reference-data/locations/hotels/by-city',
                cityCode=city_code,
                radius=20,
                radiusUnit='KM',
                ratings=hotel_rating
            )

            if response.data:
                logger.info(f"Found {len(response.data)} hotels in {city_code} with rating {hotel_rating}")
                return response.data
            return []

        except ResponseError as error:
            logger.error(f"Error fetching hotels by city: [{error.response.status_code}] {error.response.body}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in get_hotels_by_city: {str(e)}")
            raise

    def get_hotel_offers(self, amadeus: Client, hotel_ids: List[str], check_in: str, check_out: str) -> List[Dict[Text, Any]]:
        """
        Get hotel offers for specified hotels

        Args:
            amadeus: Amadeus client instance
            hotel_ids: List of hotel IDs to search for
            check_in: Check-in date (YYYY-MM-DD)
            check_out: Check-out date (YYYY-MM-DD)

        Returns:
            List of hotel offers with pricing and availability
        """
        valid_offers = []
        for hotel_id in hotel_ids:
            try:
                response = amadeus.get(
                    '/v3/shopping/hotel-offers',
                    hotelIds=hotel_id,
                    adults='1',
                    checkInDate=check_in,
                    checkOutDate=check_out,
                    currency="MYR"
                )

                if response.data:
                    valid_offers.extend(response.data)
                    logger.info(f"Found offers for hotel {hotel_id}")
            except ResponseError as error:
                logger.error(f"Error fetching offers for hotel {hotel_id}: [{error.response.status_code}] {error.response.body}")
                continue
            except Exception as e:
                logger.error(f"Unexpected error in get_hotel_offers for hotel {hotel_id}: {str(e)}")
                continue

        return valid_offers

    def format_hotel_details(self, hotel: Dict[Text, Any], rating: str, currency_conversion: Dict[Text, Any] = None) -> str:
        """Format hotel offer details for display, with currency conversion support."""
        try:
            offers = hotel.get('offers', [])
            if not offers or not isinstance(offers, list):
                return "No offers available for this hotel."

            offer = offers[0]
            hotel_data = hotel.get('hotel', {})

            hotel_name = hotel_data.get('name', 'N/A')
            price_data = offer.get('price', {})
            original_currency = price_data.get('currency', 'EUR')
            price_total = price_data.get('total', 'N/A')

            # Convert price if currency conversion data is available
            if currency_conversion and price_total != 'N/A':
                conversion_rate = currency_conversion.get(original_currency, {}).get('rate')
                if conversion_rate:
                    try:
                        price_total = float(price_total) * float(conversion_rate)
                        price_total = f"{price_total:.2f}"
                    except ValueError:
                        logger.error(f"Error converting price: {price_total} with rate {conversion_rate}")

            description_text = offer.get('room', {}).get('description', {}).get('text', 'N/A')[:100]
            check_in_date = offer.get('checkInDate', 'N/A')
            check_out_date = offer.get('checkOutDate', 'N/A')
            room_category = offer.get('room', {}).get('typeEstimated', {}).get('category', 'N/A')

            return (
                f"🏨 Hotel: {hotel_name}\n"
                f"📅 Check-in: {check_in_date}\n"
                f"📅 Check-out: {check_out_date}\n"
                f"🏢 Room Category: {room_category}\n"
                f"💰 Price: RM {price_total}\n"
                f"⭐ Rating: {rating} Star\n"
                f"📝 Description: {description_text}"
            )
        except Exception as e:
            logger.error(f"Error formatting hotel details: {str(e)}")
            return "Error formatting hotel details"

    async def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:
        city_code = tracker.get_slot("city")
        check_in = tracker.get_slot("check_in")
        check_out = tracker.get_slot("check_out")
        hotel_rating = tracker.get_slot("hotel_rating") or "3,4,5"

        if not self.validate_hotel_params(city_code, check_in, check_out, hotel_rating):
            dispatcher.utter_message(text="Please provide valid city, check-in, and check-out dates.")
            return []

        try:
            logger.info(f"Starting hotel search in {city_code} from {check_in} to {check_out}")
            amadeus = AmadeusClient().amadeus

            hotels_in_city = self.get_hotels_by_city(amadeus, city_code, hotel_rating)
            if not hotels_in_city:
                dispatcher.utter_message(text=f"Sorry, no hotels found in {city_code}.")
                return []

            hotel_info_map = {hotel['hotelId']: hotel for hotel in hotels_in_city}
            hotel_ratings_map = {hotel['hotelId']: hotel.get('rating', 'N/A') for hotel in hotels_in_city}
            hotel_ids = [hotel['hotelId'] for hotel in hotels_in_city[:5]]

            hotel_offers = self.get_hotel_offers(amadeus, hotel_ids, check_in, check_out)

            if hotel_offers:
                hotel_details = []
                # Get currency conversion rates from the hotel_offers response
                currency_conversion = amadeus.get(
                    '/v3/shopping/hotel-offers',
                    hotelIds=hotel_ids[0],  # Use first hotel to get conversion rates
                    adults='1',
                    checkInDate=check_in,
                    checkOutDate=check_out,
                    currency="MYR"
                ).result.get('dictionaries', {}).get('currencyConversionLookupRates', {})
                
                for idx, hotel_offer in enumerate(hotel_offers[:3], 1):
                    hotel_id = hotel_offer['hotel']['hotelId']
                    hotel_info = hotel_info_map.get(hotel_id, {})
                    rating = hotel_ratings_map.get(hotel_id, 'N/A')
                    formatted_details = self.format_hotel_details(
                        hotel_offer, 
                        rating,
                        currency_conversion
                    )
                    hotel_details.append(formatted_details)

                # First display the instruction message
                dispatcher.utter_message(
                    text=f"🏨 Found {len(hotel_offers)} available hotels in {city_code}."
                )

                # Display each hotel option
                buttons = []
                for idx, hotel in enumerate(hotel_details, 1):
                    dispatcher.utter_message(text=f"Option {idx}:\n{hotel}")
                    buttons.append({
                        "title": f"Select Hotel {idx}",
                        "payload": f"/select_hotel{{\"hotel_number\": \"{idx-1}\"}}"
                    })
                
                # Display selection buttons in a separate message
                dispatcher.utter_message(text="Please select your hotel:", buttons=buttons)

                return [
                    SlotSet("hotel_options", hotel_details),
                    SlotSet("hotel_search_completed", True)
                ]
            else:
                dispatcher.utter_message(text=f"Sorry, no available hotels found in {city_code} for your dates.")
                return []

        except ResponseError as error:
            logger.error(f"Amadeus API error: [{error.response.status_code}] {error.response.body}")
            dispatcher.utter_message(text="Sorry, there was an error searching for hotels. Please try again later.")
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            dispatcher.utter_message(text="An unexpected error occurred. Please try again later.")

        return []


class ValidateFlightSearchForm(FormValidationAction):
    def name(self) -> Text:
        return "validate_flight_search_form"

    async def validate_trip_type(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:
        logger.info("Action 'validate_flight_search_form' started.")
        intent = tracker.latest_message['intent'].get('name')
        if intent == "single_trip":
            return {"trip_type": "single"}
        elif intent == "round_trip":
            return {"trip_type": "round"}
        return {"trip_type": None}

    def validate_origin(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:
        """Validate origin airport code"""
        if tracker.get_latest_entity_values("airport_code"):
            return {"origin": slot_value}
        else:
            dispatcher.utter_message(text="Please provide a valid airport code for the origin.")
            return {"origin": None}

    def validate_destination(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:
        """Validate destination airport code"""
        if tracker.get_latest_entity_values("airport_code"):
            origin = tracker.get_slot("origin")
            if origin and slot_value.upper() == origin.upper():
                dispatcher.utter_message(text="Destination cannot be the same as origin.")
                return {"destination": None}
            return {"destination": slot_value}
        else:
            dispatcher.utter_message(text="Please provide a valid airport code for the destination.")
            return {"destination": None}

    def validate_departure_date(
        self,
        slot_value: Any,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: DomainDict,
    ) -> Dict[Text, Any]:
        """Validate departure date"""
        try:
            departure_date = datetime.strptime(slot_value, '%Y-%m-%d')
            if departure_date < datetime.now():
                dispatcher.utter_message(text="Please provide a future date for departure.")
                return {"departure_date": None}
            return {"departure_date": slot_value}
        except ValueError:
            dispatcher.utter_message(text="Please provide a valid date in YYYY-MM-DD format.")
            return {"departure_date": None}
        
    
class ActionGeneratePDF(Action):
    def name(self) -> str:
        return "action_generate_pdf"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: DomainDict):
        logger.info("Action 'action_generate_pdf' started.")
        token = tracker.get_slot("auth_token")
        # Define the URL for the backend PDF generation endpoint
        backend_url = os.getenv('BACKEND_URL', 'http://localhost:5000')
        backend_url_pdf = f"{backend_url}/api/chatbot/chatbots/generate-pdf"
        
        # Sample data to send to the PDF generation API
        data = {
            "text": "This is a sample text to include in the PDF."
        }

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        # Make a request to the backend to generate the PDF
        try:
            response = requests.post(backend_url_pdf, json=data, headers=headers)
            response.raise_for_status()

            # Construct download link
            download_link = f"{backend_url_pdf}/download"
            dispatcher.utter_message(text="Your PDF has been generated! Click the link to download: " + download_link)

        except requests.exceptions.RequestException as e:
            dispatcher.utter_message(text="Sorry, an error occurred while generating the PDF.")
            print(f"Error generating PDF: {e}")

        return []
    
# class ActionFetchAuthToken(Action):
#     def name(self) -> str:
#         return "action_fetch_auth_token"

#     async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: DomainDict) -> List[Dict[Text, Any]]:
#         email = tracker.get_slot("email")

#         if not email:
#             dispatcher.utter_message(text="Please provide a valid email to fetch your token.")
#             return []

#         try:
#             # Assume `fetch_token_from_api` is a function that fetches the token
#             token = await fetch_token_from_api(email)
#             if token:
#                 dispatcher.utter_message(text="Your authentication token has been successfully fetched and stored.")
#             else:
#                 dispatcher.utter_message(text="There was an issue fetching your token. Please try again later.")
        
#         except Exception as e:
#             dispatcher.utter_message(text="An error occurred while fetching your token.")
#             print(f"Error fetching token: {e}")

#         return []
class ActionFetchAuthToken(Action):
    def name(self) -> str:
        return "action_fetch_auth_token"

    def run(self, dispatcher: CollectingDispatcher, tracker, domain):
        logger.info("Action 'action_fetch_auth_token' started.")
        # First check if token already exists
        existing_token = tracker.get_slot("auth_token")
        existing_email = tracker.get_slot("user_email")
        
        if existing_token and existing_email:
            logger.info(f"Token already exists for user: {existing_email}")
            dispatcher.utter_message(text="You're already authenticated!")
            return []
            
        # Extract the provided email entity from user input
        email = next(tracker.get_latest_entity_values("email"), None)
        
        # Get backend URL from environment variable, with fallback
        backend_url = os.getenv('BACKEND_URL', 'http://localhost:5000')
        url = f"{backend_url}/api/auth/fetch-token"
        
        logger.info(f"Attempting to fetch token for email: {email} from URL: {url}")
        
        # Ensure email slot is set
        if email:
            # Call your backend API to get the token
            headers = {"Content-Type": "application/json"}
            try:
                response = requests.post(url, json={"email": email}, headers=headers)
                logger.info(f"Token fetch response status: {response.status_code}")
                
                if response.status_code == 200:
                    token = response.json().get("token")
                    if token:
                        dispatcher.utter_message(text="Authentication successful!")
                        return [SlotSet("auth_token", token), SlotSet("user_email", email)]
                    else:
                        dispatcher.utter_message(text="Sorry, we couldn't retrieve your token.")
                        return []
                else:
                    dispatcher.utter_message(text="There was an issue fetching your token. Please try again later.")
                    logger.error(f"Failed to fetch token. Status code: {response.status_code}")
                    return []
                    
            except requests.exceptions.ConnectionError as e:
                dispatcher.utter_message(text="Unable to connect to the authentication service. Please try again later.")
                logger.error(f"Failed to connect to backend at {url}. Error: {str(e)}")
                return []
        else:
            dispatcher.utter_message(text="Please provide a valid email address.")
            return []
    
class ActionCheckTokenStatus(Action):
    def name(self) -> str:
        return "action_check_token_status"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: DomainDict):
        # Retrieve token from the 'auth_token' slot
        token = tracker.get_slot("auth_token")
        logger.info("Action 'action_check_token_status' started.")
        if token:
            # Send token status if it exists
            dispatcher.utter_message(text=f"Your authentication token is: {token}")
        else:
            # Send a message if no token is available
            dispatcher.utter_message(text="No authentication token is available.")
        
        return []

class ActionSelectFlight(Action):
    def name(self) -> Text:
        return "action_select_flight"

    async def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any],
    ) -> List[Dict[Text, Any]]:
        message = tracker.latest_message.get('text', '').lower()
        flight_number = None
        trip_type = tracker.get_slot("trip_type")
        
        # Extract the flight number from the message or payload
        logger.info("Action 'action_select_flight' started.")
        if message.startswith('/select_flight'):
            # Handle button payload
            import json
            try:
                json_str = message.replace('/select_flight', '')
                payload_data = json.loads(json_str)
                flight_number = int(payload_data.get('flight_number', 0))
            except (json.JSONDecodeError, ValueError) as e:
                logger.error(f"Error parsing flight selection payload: {str(e)}")
                dispatcher.utter_message(text="Invalid flight selection format.")
                return []
        else:
            # Handle text input
            if '1' in message or 'first' in message:
                flight_number = 0
            elif '2' in message or 'second' in message:
                flight_number = 1
            elif '3' in message or 'third' in message:
                flight_number = 2

        try:
            if trip_type == "single":
                flight_options = tracker.get_slot("flight_options")
                if not flight_options or flight_number is None:
                    dispatcher.utter_message(text="Sorry, I couldn't find the flight option you're referring to.")
                    return []
                    
                selected_flight = flight_options[flight_number]
                confirmation_message = (
                    f"✈️ You've selected this flight:\n\n"
                    f"{selected_flight}\n\n"
                )
                dispatcher.utter_message(text=confirmation_message)
                return [SlotSet("selected_flight", selected_flight)]
                
            elif trip_type == "round":
                selected_outbound = tracker.get_slot("selected_outbound")
                outbound_options = tracker.get_slot("outbound_options")
                return_options = tracker.get_slot("return_options")
                
                if not selected_outbound:
                    # Selecting outbound flight
                    if not outbound_options or flight_number is None:
                        dispatcher.utter_message(text="Sorry, I couldn't find the outbound flight option you're referring to.")
                        return []
                        
                    selected_flight = outbound_options[flight_number]
                    
                    # Create buttons for return flight selection
                    buttons = []
                    dispatcher.utter_message(text="✈️ Here are your return flight options:")
                    for idx, flight in enumerate(return_options, 1):
                        dispatcher.utter_message(text=f"Option {idx}:\n{flight}")
                        buttons.append({
                            "title": f"Select Return Flight {idx}",
                            "payload": f"/select_flight{{\"flight_number\": \"{idx-1}\"}}"
                        })
                    
                    confirmation_message = (
                        f"✈️ You've selected this outbound flight:\n\n"
                        f"{selected_flight}\n\n"
                        f"Now, please select your return flight:"
                    )
                    dispatcher.utter_message(text=confirmation_message, buttons=buttons)
                    
                    # Switch flight_options to return options for next selection
                    return [
                        SlotSet("selected_outbound", selected_flight),
                        SlotSet("flight_options", return_options)
                    ]
                else:
                    # Selecting return flight
                    if not return_options or flight_number is None:
                        dispatcher.utter_message(text="Sorry, I couldn't find the return flight option you're referring to.")
                        return []
                        
                    selected_return = return_options[flight_number]
                    confirmation_message = (
                        f"🎉 Perfect! Here's your round trip selection:\n\n"
                        f"OUTBOUND:\n{selected_outbound}\n\n"
                        f"RETURN:\n{selected_return}\n\n"
                    )
                    dispatcher.utter_message(text=confirmation_message)
                    return [
                        SlotSet("selected_return", selected_return),
                        SlotSet("selected_flight", f"{selected_outbound}\n\nRETURN:\n{selected_return}")
                    ]
            
        except (IndexError, TypeError) as e:
            logger.error(f"Error selecting flight: {str(e)}")
            dispatcher.utter_message(text="Sorry, that flight option is not available.")
            return []

class ActionSelectHotel(Action):
    def name(self) -> Text:
        return "action_select_hotel"

    async def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:
        try:
            logger.info("Action 'action_select_hotel' started.")
            # First try to get hotel_number from entities
            entities = tracker.latest_message.get('entities', [])
            hotel_number = next(
                (e['value'] for e in entities if e['entity'] == 'hotel_number'),
                None
            )
            
            if hotel_number is not None:
                index = int(hotel_number)
            else:
                # Fallback to text parsing
                selection_text = tracker.latest_message.get('text', '')
                # Handle both button payload and text input
                if selection_text.startswith('/select_hotel'):
                    # Extract number from payload like '/select_hotel{"hotel_number": "0"}'
                    import json
                    try:
                        # Extract the JSON part from the payload
                        json_str = selection_text.replace('/select_hotel', '')
                        payload_data = json.loads(json_str)
                        index = int(payload_data.get('hotel_number', 0))
                    except json.JSONDecodeError:
                        dispatcher.utter_message(text="Invalid hotel selection format.")
                        return []
                else:
                    # Handle text input like "select hotel 1"
                    index = int(selection_text.lower().replace('select hotel ', '').strip()) - 1
            
            hotel_options = tracker.get_slot("hotel_options")
            if not hotel_options:
                dispatcher.utter_message(text="No hotel options available. Please search for hotels first.")
                return []
                
            if index < 0 or index >= len(hotel_options):
                dispatcher.utter_message(text="Invalid hotel selection. Please choose from the available options.")
                return []
                
            selected_hotel = hotel_options[index]
            
            dispatcher.utter_message(text=f"🏨 You've selected this hotel:\n\n{selected_hotel}")
            
            return [
                SlotSet("selected_hotel", selected_hotel),
                SlotSet("hotel_search_completed", True)
            ]
            
        except Exception as e:
            logger.error(f"Error selecting hotel: {str(e)}")
            dispatcher.utter_message(text="Error processing hotel selection. Please try again.")
            return []

# class ActionConfirmHotelBooking(Action):
#     def name(self) -> Text:
#         return "action_confirm_hotel_booking"

#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
#         selected_hotel = tracker.get_slot('selected_hotel')

#         dispatcher.utter_message(
#             text=f"Perfect! This is your hotel selection:\n\n"
#                  f"Hotel Details:\n{selected_hotel}\n\n"
#                  f"Your choice has been saved "
#         )
        
#         return []

class ActionGenerateTravelRequest(Action):
    def name(self) -> Text:
        return "action_generate_travel_request"
    
    async def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:
        try:
            logger.info("Action 'action_generate_travel_request' started.")
            # Get selected flight and hotel
            selected_flight = tracker.get_slot("selected_flight")
            selected_hotel = tracker.get_slot("selected_hotel")
            user_email = tracker.get_slot("user_email")
            
            if not selected_flight or not selected_hotel:
                dispatcher.utter_message(
                    text="Please complete both flight and hotel selection first."
                )
                return []

            # Parse flight details
            flight_lines = selected_flight.split('\n')
            trip_type = tracker.get_slot("trip_type")

            if trip_type == "round":
                # Split the combined flight string into outbound and return sections
                outbound_section = selected_flight.split('\n\nRETURN:\n')[0]
                return_section = selected_flight.split('\n\nRETURN:\n')[1]
                
                outbound_lines = outbound_section.split('\n')
                return_lines = return_section.split('\n')
                
                # Parse route info for both flights
                outbound_route = outbound_lines[7].replace('📍 From: ', '').split(' to ')
                return_route = return_lines[7].replace('📍 From: ', '').split(' to ')
                
                flight_details = {
                    "trip_type": "round",
                    "origin": {
                        "airport_code": outbound_route[0],
                        "city": tracker.get_slot("origin"),
                        "country": ""
                    },
                    "destination": {
                        "airport_code": outbound_route[1],
                        "city": tracker.get_slot("destination"),
                        "country": ""
                    },
                    "outbound_flight": {
                        "airline": outbound_lines[0].replace('🛩️ Airline: ', ''),
                        "flight_number": outbound_lines[2].replace('🛫 Flight: ', ''),
                        "cabin_class": outbound_lines[1].replace('💺 Cabin Class: ', ''),
                        "departure_datetime": outbound_lines[5].replace('🛫 Departure: ', ''),
                        "arrival_datetime": outbound_lines[6].replace('🛬 Arrival: ', ''),
                        "duration": outbound_lines[4].replace('⏱️ Duration: ', ''),
                        "price": float(outbound_lines[3].replace('💰 Price: RM ', '').replace(',', '')),
                        "layovers": []
                    },
                    "return_flight": {
                        "airline": return_lines[0].replace('🛩️ Airline: ', ''),
                        "flight_number": return_lines[2].replace('🛫 Flight: ', ''),
                        "cabin_class": return_lines[1].replace('💺 Cabin Class: ', ''),
                        "departure_datetime": return_lines[5].replace('🛫 Departure: ', ''),
                        "arrival_datetime": return_lines[6].replace('🛬 Arrival: ', ''),
                        "duration": return_lines[4].replace('⏱️ Duration: ', ''),
                        "price": float(return_lines[3].replace('💰 Price: RM ', '').replace(',', '')),
                        "layovers": []
                    }
                }
            else:
                # Existing single trip parsing logic
                route_info = flight_lines[7].replace('📍 From: ', '').split(' to ')
                flight_details = {
                    "trip_type": "single",
                    "origin": {
                        "airport_code": route_info[0],
                        "city": tracker.get_slot("origin"),
                        "country": ""
                    },
                    "destination": {
                        "airport_code": route_info[1],
                        "city": tracker.get_slot("destination"),
                        "country": ""
                    },
                    "outbound_flight": {
                        "airline": flight_lines[0].replace('🛩️ Airline: ', ''),
                        "flight_number": flight_lines[2].replace('🛫 Flight: ', ''),
                        "cabin_class": flight_lines[1].replace('💺 Cabin Class: ', ''),
                        "departure_datetime": flight_lines[5].replace('🛫 Departure: ', ''),
                        "arrival_datetime": flight_lines[6].replace('🛬 Arrival: ', ''),
                        "duration": flight_lines[4].replace('⏱️ Duration: ', ''),
                        "price": float(flight_lines[3].replace('💰 Price: RM ', '').replace(',', '')),
                        "layovers": []
                    }
                }

            # Parse hotel details
            hotel_lines = selected_hotel.split('\n')
            check_in = hotel_lines[1].replace('📅 Check-in: ', '').strip()
            check_out = hotel_lines[2].replace('📅 Check-out: ', '').strip()
            price = float(hotel_lines[4].replace('💰 Price: RM ', '').replace(',', ''))
            
            # Calculate nights
            try:
                check_in_date = datetime.strptime(check_in, '%Y-%m-%d')
                check_out_date = datetime.strptime(check_out, '%Y-%m-%d')
                nights = (check_out_date - check_in_date).days
            except ValueError as e:
                logger.error(f"Date parsing error: {str(e)}")
                dispatcher.utter_message(text="Error processing hotel dates. Please try again.")
                return []

            hotel_details = {
                "city": tracker.get_slot("city"),
                "country": "",  
                "hotel_name": hotel_lines[0].replace('🏨 Hotel: ', '').strip(),
                "room_type": hotel_lines[3].replace('🏢 Room Category: ', '').strip(),
                "check_in": check_in,
                "check_out": check_out,
                "nights": nights,
                "price_per_night": price / nights if nights > 0 else price,
                "total_price": price,
                "rating": int(''.join(filter(str.isdigit, hotel_lines[5]))),
                "amenities": []
            }

            # Calculate total cost based on trip type
            total_cost = flight_details["outbound_flight"]["price"]
            if trip_type == "round":
                total_cost += flight_details["return_flight"]["price"]
            total_cost += hotel_details["total_price"]

            # Helper function to extract layovers
            def extract_layovers(flight_text: str) -> List[Dict[str, Any]]:
                layovers = []
                layover_lines = [line for line in flight_text.split('\n') if '🔄 Layovers:' in line]
                if layover_lines:
                    layover_info = layover_lines[0].replace('🔄 Layovers: ', '').split(' → ')
                    for layover in layover_info:
                        # Parse layover info: "XXX (2h 30m)" format
                        airport_code = layover.split(' (')[0]
                        duration = layover.split(' (')[1].replace(')', '')
                        layovers.append({
                            "airport": airport_code,
                            "duration": duration
                        })
                return layovers

            if trip_type == "round":
                # Update outbound and return flight details with layovers
                outbound_layovers = extract_layovers(outbound_section)
                return_layovers = extract_layovers(return_section)
                
                flight_details["outbound_flight"]["layovers"] = outbound_layovers
                flight_details["return_flight"]["layovers"] = return_layovers
            else:
                # Update single flight details with layovers
                flight_details["outbound_flight"]["layovers"] = extract_layovers(selected_flight)

            # Update preview message to include layover information
            def format_layover_info(layovers: List[Dict[str, Any]]) -> str:
                if not layovers:
                    return "• No layovers\n"
                layover_text = "• Layovers:\n"
                for layover in layovers:
                    layover_text += f"  - {layover['airport']} ({layover['duration']})\n"
                return layover_text

            preview_message = (
                f"📋 Travel Request Preview\n\n"
                f"✈️ Flight Details:\n"
                f"• Trip Type: {flight_details['trip_type'].title()}\n"
                f"• Route: {flight_details['origin']['airport_code']} → {flight_details['destination']['airport_code']}\n\n"
                f"Outbound Flight:\n"
                f"• Airline: {flight_details['outbound_flight']['airline']}\n"
                f"• Flight: {flight_details['outbound_flight']['flight_number']}\n"
                f"• Class: {flight_details['outbound_flight']['cabin_class']}\n"
                f"• Departure: {flight_details['outbound_flight']['departure_datetime']}\n"
                f"• Arrival: {flight_details['outbound_flight']['arrival_datetime']}\n"
                f"• Duration: {flight_details['outbound_flight']['duration']}\n"
                f"• Cost: RM {flight_details['outbound_flight']['price']:.2f}\n"
                f"{format_layover_info(flight_details['outbound_flight']['layovers'])}"
            )

            if trip_type == "round":
                cabinClass = flight_details['return_flight']['cabin_class']
                flightPrice = flight_details['return_flight']['price']
                preview_message += (
                    f"\nReturn Flight:\n"
                    f"• Airline: {flight_details['return_flight']['airline']}\n"
                    f"• Flight: {flight_details['return_flight']['flight_number']}\n"
                    f"• Class: {flight_details['return_flight']['cabin_class']}\n"
                    f"• Departure: {flight_details['return_flight']['departure_datetime']}\n"
                    f"• Arrival: {flight_details['return_flight']['arrival_datetime']}\n"
                    f"• Duration: {flight_details['return_flight']['duration']}\n"
                    f"• Cost: RM {flight_details['return_flight']['price']:.2f}\n"
                    f"{format_layover_info(flight_details['return_flight']['layovers'])}"
                )
            
            airLineName = flight_details['outbound_flight']['airline']
            origin = flight_details['origin']['airport_code']
            destination = flight_details['destination']['airport_code']
            tripType = flight_details['trip_type'].title()
            cabinClass = flight_details['outbound_flight']['cabin_class']
            flightCode = flight_details['outbound_flight']['flight_number']
            flightPrice = flight_details['outbound_flight']['price']
            

            hotelName = hotel_details['hotel_name']
            hotelCheckIn = hotel_details['check_in']
            hotelCheckOut = hotel_details['check_out']
            hotelRating = hotel_details['rating']
            hotelRoomCategory = hotel_details['room_type']
            hotelTotalPrice = hotel_details['total_price']


            # generate pdf

            token = tracker.get_slot("auth_token")
            # Define the URL for the backend PDF generation endpoint
            backend_url = os.getenv('BACKEND_URL', 'http://localhost:5000')
            # backend_url_pdf = f"{backend_url}/api/chatbot/chatbots/generate-custom"
            backend_url_pdf = f"{backend_url}/api/chatbot/chatbots/generate-tempo-custom"
            backend_url_download = f"{backend_url}/api/chatbot/chatbots/generate-pdf/downloadTempo"
            

            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }

            preview_message += (
                f"\n🏨 Hotel Details:\n"
                f"• Hotel: {hotel_details['hotel_name']}\n"
                f"• Room: {hotel_details['room_type']}\n"
                f"• Check-in: {hotel_details['check_in']}\n"
                f"• Check-out: {hotel_details['check_out']}\n"
                f"• Nights: {hotel_details['nights']}\n"
                f"• Price per Night: RM {hotel_details['price_per_night']:.2f}\n"
                f"• Total Hotel Cost: RM {hotel_details['total_price']:.2f}\n"
                f"• Rating: {hotel_details['rating']} Star\n\n"
                f"💰 Total Trip Cost: RM {total_cost:.2f}\n\n"
                f"Would you like to confirm and save this travel request?"
            )
            
            # Sample data to send to the PDF generation API
            data = {
                "basicInfo": {
                    "username": "TanCheesen",
                    "email": tracker.get_slot("user_email"),
                    "current_date": "TESTING!!!!!",
                    "department": "HR Department",
                    "employeeId": "1234567",
                    "phoneNum": "01743268489",
                },
                "flight": {
                    "airLineName": airLineName,
                    "origin": origin,
                    "destination": destination,
                    "departureDate": tracker.get_slot("departure_date"),
                    "returnDate": tracker.get_slot("return_date"),
                    "tripType": tripType,
                    "cabinClass": cabinClass,
                    "flightCode": flightCode,
                    "flightPrice": flightPrice
                },
                "hotel": {
                    "hotelName": hotelName,
                    "city": tracker.get_slot("city"),
                    "check_in_date": hotelCheckIn,
                    "check_out_date": hotelCheckOut,
                    "hotelRating": hotelRating,
                    "roomCategory": hotelRoomCategory,
                    "hotelPrice": hotelTotalPrice,
                }
            }
            # Create the complete travel request object
            travel_request = {
                "flight_details": flight_details,
                "hotel_details": hotel_details,
                "total_cost": total_cost,
                "user_email": user_email,
                "pdfData" : data,
                "preview_message": preview_message
            }

            # Show preview with confirmation buttons
            dispatcher.utter_message(
                text=preview_message,
                buttons=[
                    {"title": "✅ Yes, save it", "payload": "/confirm_save_request"},
                    {"title": "❌ No, cancel", "payload": "/deny"}
                ]
            )

            # Make a request to the backend to generate the PDF
            try:
                response = requests.post(backend_url_pdf, json=data, headers=headers)
                response.raise_for_status()
                
                response_data = response.json()
                # file_id = response_data.get("fileId")

                # # Construct download link
                download_link = f"{backend_url_download}/12345"
                dispatcher.utter_message(
                    text=f"Your PDF has been generated successfully! Click the link to download: {download_link}",
                    buttons=[
                        {
                            "title": "Download it",
                            "payload": f"/open_link{{\"link\": \"{download_link}\"}}"
                        }
                    ]
                )

            except requests.exceptions.RequestException as e:
                dispatcher.utter_message(text="Sorry, an error occurred while generating the PDF.")
                print(f"Error generating PDF: {e}")

            return [SlotSet("travel_request_preview", travel_request)]

        except Exception as e:
            dispatcher.utter_message(
                text=f"Error generating travel request preview: {str(e)}"
            )
            return []
class ActionOpenLink(Action):
    def name(self) -> str:
        return "action_open_link"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        logger.info("Action 'action_open_link' started.")
        link = tracker.get_slot('link')
        if link:
            # Open the link in the user's default browser (or perform any other action you need)
            try:
                webbrowser.open(link)
                dispatcher.utter_message(text="Opening the link...")
            except Exception as e:
                dispatcher.utter_message(text=f"Failed to open the link: {e}")
        else:
            error_message = "The 'link' slot is empty. Cannot open the link."
            dispatcher.utter_message(text=error_message)
            # Optionally, log the error or take other actions
            print(error_message)  # Logs to the console for debugging

        return []
class ActionInitializeAuth(Action):
    def name(self) -> Text:
        return "action_initialize_auth"

    async def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:
        # Get metadata from the request
        metadata = tracker.latest_message.get('metadata', {})
        auth_token = metadata.get('auth_token')
        
        if not auth_token:
            dispatcher.utter_message(text="No authentication token found.")
            return []
            
        try:
            # Get the database instance
            db_client = MongoDBClient()
            user_collection = db_client.database["users"]
            
            # Verify token and get user data
            user = user_collection.find_one({"token": auth_token})
            
            if user:
                # Set both auth_token and user_email slots
                return [
                    SlotSet("auth_token", auth_token),
                    SlotSet("user_email", user.get("email")),
                    SlotSet("cabin_class", user.get("preferences", {}).get("cabinClass")),
                    SlotSet("hotel_rating", user.get("preferences", {}).get("hotelRating"))
                ]
            else:
                dispatcher.utter_message(text="Invalid authentication token.")
                return []
                
        except Exception as e:
            logger.error(f"Error initializing auth: {str(e)}")
            return []