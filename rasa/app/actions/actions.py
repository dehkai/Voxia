import re
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from amadeus import Client, ResponseError
from datetime import datetime
import logging
from rasa_sdk.forms import FormValidationAction
from rasa_sdk.types import DomainDict
from dotenv import load_dotenv
import os
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.collection import Collection
import requests
from rasa_sdk.events import AllSlotsReset, Restarted, SlotSet, ActionExecuted, UserUtteranceReverted

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
                "hotel_search_completed"
            ]

            # Create SlotSet events for each slot
            reset_events = [SlotSet(slot_name, None) for slot_name in hotel_slots]

            # Set hotel_search_completed to False
            reset_events.append(SlotSet("hotel_search_completed", False))

            logger.info("Successfully reset hotel form slots")
            return reset_events

        except Exception as e:
            logger.error(f"Error resetting hotel form slots: {str(e)}")
            # In case of error, reset all slots as a fallback
            return [AllSlotsReset()]

class ActionSaveTravelRequest(Action):
    def name(self) -> Text:
        return "action_save_travel_request"

    async def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:
        # Check if both flight and hotel searches are completed
        flight_search_done = tracker.get_slot("flight_search_completed")
        hotel_search_done = tracker.get_slot("hotel_search_completed")
        
        if not (flight_search_done and hotel_search_done):
            missing_searches = []
            if not flight_search_done:
                missing_searches.append("flight")
            if not hotel_search_done:
                missing_searches.append("hotel")
            
            dispatcher.utter_message(
                text=f"Please complete your {' and '.join(missing_searches)} search first."
            )
            return []

        try:
            # Get MongoDB client
            db_client = MongoDBClient()
            travel_requests = db_client.database["travel_requests"]
            
            # Get user authentication details
            auth_token = tracker.get_slot("auth_token")
            user_email = tracker.get_slot("user_email")
            
            if not auth_token or not user_email:
                dispatcher.utter_message(text="Please log in first to save your travel request.")
                return []

            # Get flight details
            flight_details = {
                "trip_type": tracker.get_slot("trip_type"),
                "origin": tracker.get_slot("origin"),
                "destination": tracker.get_slot("destination"),
                "departure_date": tracker.get_slot("departure_date"),
                "return_date": tracker.get_slot("return_date"),
                "cabin_class": tracker.get_slot("cabin_class")
            }

            # Get hotel details
            hotel_details = {
                "city": tracker.get_slot("city"),
                "check_in": tracker.get_slot("check_in"),
                "check_out": tracker.get_slot("check_out"),
                "hotel_rating": tracker.get_slot("hotel_rating")
            }

            # Create travel request document
            travel_request = {
                "user_email": user_email,
                "auth_token": auth_token,
                "flight_details": flight_details,
                "hotel_details": hotel_details,
                "status": "pending",
                "created_at": datetime.utcnow(),
                "last_updated": datetime.utcnow()
            }

            # Insert into MongoDB
            result = travel_requests.insert_one(travel_request)
            
            if result.inserted_id:
                # Format the confirmation message with details
                confirmation_message = (
                    f"✅ Travel Request Saved Successfully!\n\n"
                    f"📋 Request ID: {result.inserted_id}\n\n"
                    f"Flight Details:\n"
                    f"✈️ From: {flight_details['origin']} To: {flight_details['destination']}\n"
                    f"📅 Departure: {flight_details['departure_date']}\n"
                    f"🔄 Return: {flight_details['return_date'] if flight_details['return_date'] else 'N/A'}\n"
                    f"💺 Cabin: {flight_details['cabin_class']}\n\n"
                    f"Hotel Details:\n"
                    f"🏨 City: {hotel_details['city']}\n"
                    f"📅 Check-in: {hotel_details['check_in']}\n"
                    f"📅 Check-out: {hotel_details['check_out']}\n"
                    f"⭐ Rating: {hotel_details['hotel_rating']}"
                )
                
                dispatcher.utter_message(text=confirmation_message)
                
                # Reset the completion flags and return the request ID
                return [
                    SlotSet("travel_request_id", str(result.inserted_id)),
                    SlotSet("flight_search_completed", False),
                    SlotSet("hotel_search_completed", False)
                ]
            else:
                dispatcher.utter_message(
                    text="There was an issue saving your travel request. Please try again."
                )
                return []

        except Exception as e:
            dispatcher.utter_message(
                text=f"An error occurred while saving your travel request: {str(e)}"
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
        # Check if flight search is also completed
        if tracker.get_slot("flight_search_completed"):
            dispatcher.utter_message(
                text="Great! Both flight and hotel searches are complete. Would you like to save your travel request?",
                buttons=[
                    {"title": "Yes, save it", "payload": "/save_travel_request"},
                    {"title": "No, thanks", "payload": "/deny"}
                ]
            )
        return [SlotSet("hotel_search_completed", True)]

class ActionFetchUserPreferences(Action):
    def name(self) -> str:
        return "action_fetch_user_preferences"

    async def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: dict):
        # Fetch the token from the tracker
        token = tracker.get_slot("auth_token")
        
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


# class ActionOfferRestart(Action):
#     """Action to offer conversation restart after flight search"""
    
#     def name(self) -> Text:
#         return "action_offer_restart"
        
#     async def run(
#         self,
#         dispatcher: CollectingDispatcher,
#         tracker: Tracker,
#         domain: Dict[Text, Any]
#     ) -> List[Dict[Text, Any]]:
#         # Offer restart with buttons
#         dispatcher.utter_message(
#             text="Would you like to start a new search?",
#             buttons=[
#                 {"title": "Yes, start new search", "payload": "/restart_conversation"},
#                 {"title": "No, end chat", "payload": "/goodbye"}
#             ]
#         )
#         return []

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
                
                # Initialize client
                cls._instance.client = MongoClient(mongodb_uri)
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
                # For single trip, just show outbound flights
                if trip_type == "single":
                    # Display options message once
                    dispatcher.utter_message(text="Here are your flight options. Please select one by saying 'select flight 1', 'select flight 2', or 'select flight 3':")
                    
                    # Display numbered options
                    for idx, flight in enumerate(outbound_details, 1):
                        dispatcher.utter_message(text=f"Option {idx}:\n{flight}")
                    
                    return [
                        SlotSet("flights_found", True),
                        SlotSet("flight_options", outbound_details)
                    ]

                # For round trip, search and show both outbound and return flights
                elif trip_type == "round" and return_date:
                    # Search return flights
                    return_details = await self.search_flights(amadeus, destination, origin, return_date, cabin_class)
                    
                    if return_details:
                        # First show outbound options
                        message = f"✈️ Outbound Options ({departure_date}):\n\n"
                        message += "\n\n".join(outbound_details)
                        dispatcher.utter_message(text=message)
                        
                        # Then show return options
                        message = f"\n🔄 Return Options ({return_date}):\n\n"
                        message += "\n\n".join(return_details)
                        dispatcher.utter_message(text=message)
                        
                        # Display total combinations available
                        total_combinations = len(outbound_details) * len(return_details)
                        message = (f"\n📊 Total {total_combinations} combinations available. "
                                 "Please let me know which outbound and return flights you prefer.")
                        dispatcher.utter_message(text=message)
                        return [
                            SlotSet("flights_found", True),
                            ActionExecuted("action_offer_restart")
                        ]
                    else:
                        dispatcher.utter_message(
                            text=f"Sorry, no return flights found for {return_date}."
                        )
                        return [
                            SlotSet("flights_found", False),
                            ActionExecuted("action_offer_restart")
                        ]
            else:
                dispatcher.utter_message(
                    text=f"Sorry, no outbound flights found for {departure_date}."
                )
                return [
                    SlotSet("flights_found", False),
                    ActionExecuted("action_offer_restart")
                ]
                
        except ResponseError as error:
            logger.error(f"Amadeus API error: [{error.response.status_code}] {error.response.body}")
            return [
                    SlotSet("flights_found", False),
                    ActionExecuted("action_offer_restart")
                ]
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return [
                    SlotSet("flights_found", False),
                    ActionExecuted("action_offer_restart")
                ]

    
class ActionSearchHotels(Action):
    """Rasa action for searching hotels using Amadeus API"""

    def name(self) -> Text:
        return "action_search_hotels"

    def validate_hotel_params(self, city: str, check_in: str, check_out: str, hotel_rating: str) -> bool:
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

    def format_hotel_details(self, hotel: Dict[Text, Any], rating: str) -> str:
        """Format hotel offer details for display, with safeguards for list structures."""
        try:
            offers = hotel.get('offers', [])
            if not offers or not isinstance(offers, list):
                return "No offers available for this hotel."

            offer = offers[0]
            hotel_data = hotel.get('hotel', {})

            hotel_name = hotel_data.get('name', 'N/A')
            price_total = offer.get('price', {}).get('total', 'N/A')
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
                for hotel_offer in hotel_offers[:3]:
                    hotel_id = hotel_offer['hotel']['hotelId']
                    hotel_info = hotel_info_map.get(hotel_id, {})
                    rating = hotel_ratings_map.get(hotel_id, 'N/A')
                    formatted_details = self.format_hotel_details(hotel_offer, rating)
                    hotel_details.append(formatted_details)

                dispatcher.utter_message(
                    text=(
                        f"🏨 Found {len(hotel_offers)} available hotels in {city_code}.\n"
                        f"Here are the top options:\n\n" + "\n\n".join(hotel_details)
                    )
                )
            else:
                dispatcher.utter_message(text=f"Sorry, no available hotels found in {city_code} for your dates.")

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
        token = tracker.get_slot("auth_token")
        # Define the URL for the backend PDF generation endpoint
        backend_url = "http://localhost:5000/api/chatbot/chatbots/generate-pdf"
        
        # Sample data to send to the PDF generation API
        data = {
            "text": "This is a sample text to include in the PDF."
        }

        # Make a request to the backend to generate the PDF
        try:
            response = requests.post(backend_url, json=data)
            response.raise_for_status()

            # Construct download link
            download_link = f"{backend_url}/download"
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
        # Extract the provided email entity from user input
        email = next(tracker.get_latest_entity_values("email"), None)
        
        # Ensure email slot is set
        if email:
            # Call your backend API to get the token
            url = "http://localhost:5000/api/auth/fetch-token"
            headers = {"Content-Type": "application/json"}
            response = requests.post(url, json={"email": email}, headers=headers)

            if response.status_code == 200:
                token = response.json().get("token")
                if token:
                    dispatcher.utter_message(text=f"Token fetched successfully: {token}")
                    return [SlotSet("auth_token", token), SlotSet("user_email", email)]
                else:
                    dispatcher.utter_message(text="Sorry, we couldn't retrieve your token.")
                    return []
            else:
                dispatcher.utter_message(text="There was an issue fetching your token. Please try again later.")
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
        # Get the message text to extract the flight option number
        message = tracker.latest_message.get('text', '').lower()
        flight_number = None
        
        # Extract the flight number from the message
        if '1' in message or 'first' in message:
            flight_number = 0
        elif '2' in message or 'second' in message:
            flight_number = 1
        elif '3' in message or 'third' in message:
            flight_number = 2

        # Get stored flight details from previous search
        flight_options = tracker.get_slot("flight_options")
        
        if not flight_options or flight_number is None:
            dispatcher.utter_message(text="Sorry, I couldn't find the flight option you're referring to.")
            return []

        try:
            selected_flight = flight_options[flight_number]
            
            # Format confirmation message
            confirmation_message = (
                f"✈️ You've selected this flight:\n\n"
                f"{selected_flight}\n\n"
                f"Would you like to confirm this selection?"
            )
            
            dispatcher.utter_message(
                text=confirmation_message,
                buttons=[
                    {"title": "Yes, confirm", "payload": "/confirm_flight"},
                    {"title": "No, choose different flight", "payload": "/deny"}
                ]
            )
            
            return [SlotSet("selected_flight", selected_flight)]
            
        except (IndexError, TypeError):
            dispatcher.utter_message(text="Sorry, that flight option is not available.")
            return []
