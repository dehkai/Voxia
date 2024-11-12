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

class ActionOfferRestart(Action):
    """Action to offer conversation restart after flight search"""
    
    def name(self) -> Text:
        return "action_offer_restart"
        
    async def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:
        # Offer restart with buttons
        dispatcher.utter_message(
            text="Would you like to start a new search?",
            buttons=[
                {"title": "Yes, start new search", "payload": "/restart_conversation"},
                {"title": "No, end chat", "payload": "/goodbye"}
            ]
        )
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
        # Get the trip type from the intent name
        if tracker.get_intent_of_latest_message() == "single_trip":
            trip_type = "single"
        else:
            trip_type = "round"
            
        return [SlotSet("trip_type", trip_type)]
class ActionSearchFlights(Action):
    def name(self) -> Text:
        return "action_search_flights"
        
    def validate_flight_params(self, origin: str, destination: str, departure_date: str, return_date: str = None, trip_type: str = "single") -> bool:
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

    def format_flight_details(self, offer: Dict[str, Any],carriers: Dict[str, str]) -> str:
        """Format flight offer details for display"""
        try:
            price = offer['price']['total']
            itinerary = offer['itineraries'][0]
            segment = itinerary['segments'][0]

            carrier_code = segment['carrierCode']
            airline_name = carriers.get(carrier_code, carrier_code)
            
            departure_time = datetime.fromisoformat(segment['departure']['at'].replace('Z', '')).strftime('%Y-%m-%d %H:%M')
            arrival_time = datetime.fromisoformat(segment['arrival']['at'].replace('Z', '')).strftime('%Y-%m-%d %H:%M')

            formatted_duration = self.format_duration(itinerary['duration'])
            
            return (
                f"🛩️ Airline: {airline_name}\n"
                f"🛫 Flight: {segment['carrierCode']}{segment['number']}\n"
                f"💰 Price: RM {price}\n"
                f"⏱️ Duration: {formatted_duration}\n"
                f"🛫 Departure: {departure_time}\n"
                f"🛬 Arrival: {arrival_time}\n"
                f"📍 From: {segment['departure']['iataCode']} to {segment['arrival']['iataCode']}"
            )
        except Exception as e:
            logger.error(f"Error formatting flight details: {str(e)}")
            return "Error formatting flight details"

    async def search_flights(self, amadeus, origin: str, destination: str, date: str) -> List[str]:
        """Search flights for a given route and format the results"""
        try:
            response = amadeus.shopping.flight_offers_search.get(
                originLocationCode=origin,
                destinationLocationCode=destination,
                departureDate=date,
                adults=1,
                max=3,
                currencyCode="MYR"
            )
            
            if response.data:
                carriers = response.result['dictionaries']['carriers']
                return [self.format_flight_details(offer, carriers) for offer in response.data[:3]]
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
        
        # Log the received values
        logger.info(f"Received values - Trip Type: {trip_type}, Origin: {origin}, Destination: {destination}, "
                   f"Departure: {departure_date}, Return: {return_date}")
        
        # Validate parameters
        if not self.validate_flight_params(origin, destination, departure_date, return_date, trip_type):
            dispatcher.utter_message(
                text="Please provide valid flight details."
            )
            return [SlotSet("flights_found", False)]
            
        try:
            logger.info(f"Searching {trip_type} trip flights: {origin} -> {destination} on {departure_date}")
            
            amadeus = AmadeusClient().amadeus
            
            # Search outbound flights
            outbound_details = await self.search_flights(amadeus, origin, destination, departure_date)
            
            if outbound_details:
                # For single trip, just show outbound flights
                if trip_type == "single":
                    message = f"✈️ Outbound flights from {origin} to {destination}:\n\n"
                    message += "\n\n".join(outbound_details)
                    dispatcher.utter_message(text=message)
                    return [
                        SlotSet("flights_found", True),
                        ActionExecuted("action_offer_restart")
                    ]                

                # For round trip, search and show both outbound and return flights
                elif trip_type == "round" and return_date:
                    # Search return flights
                    return_details = await self.search_flights(amadeus, destination, origin, return_date)
                    
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
            # dispatcher.utter_message(
            #     text="Sorry, there was an error searching for flights. Please try again later."
            # )
            return [
                    SlotSet("flights_found", False),
                    ActionExecuted("action_offer_restart")
                ]
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            # dispatcher.utter_message(
            #     text="An unexpected error occurred. Please try again later."
            # )
            return [
                    SlotSet("flights_found", False),
                    ActionExecuted("action_offer_restart")
                ]
    
class ActionSearchHotels(Action):
    """Rasa action for searching hotels using Amadeus API"""

    def name(self) -> Text:
        return "action_search_hotels"

    def validate_hotel_params(self, city: str, check_in: str, check_out: str) -> bool:
        """Validate hotel search parameters"""
        if not all([city, check_in, check_out]):
            return False

        try:
            check_in_date = datetime.strptime(check_in, '%Y-%m-%d')
            check_out_date = datetime.strptime(check_out, '%Y-%m-%d')
            return check_out_date > check_in_date
        except ValueError:
            return False

    def get_hotels_by_city(self, amadeus: Client, city_code: str) -> List[Dict[str, Any]]:
        """
        Get list of hotels in a city using Amadeus API

        Args:
            amadeus: Amadeus client instance
            city_code: IATA city code (e.g., 'KUL' for Kuala Lumpur)

        Returns:
            List of hotel information including hotelIds
        """
        try:
            # The correct API path for hotel search by city
            response = amadeus.get('/v1/reference-data/locations/hotels/by-city',
                                 cityCode=city_code)

            if response.data:
                logger.info(f"Found {len(response.data)} hotels in {city_code}")
                return response.data
            return []

        except ResponseError as error:
            logger.error(f"Error fetching hotels by city: [{error.response.status_code}] {error.response.body}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in get_hotels_by_city: {str(e)}")
            raise

    def get_hotel_offers(self, amadeus: Client, hotel_ids: List[str], check_in: str, check_out: str) -> List[Dict[str, Any]]:
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
        try:
            # Convert list of hotel IDs to comma-separated string
            hotel_ids_str = ','.join(hotel_ids)

            # Using direct API path for hotel offers
            response = amadeus.get('/v3/shopping/hotel-offers',
                                 hotelIds=hotel_ids_str,
                                 adults='1',
                                 checkInDate=check_in,
                                 checkOutDate=check_out,
                                 currency="MYR")

            if response.data:
                logger.info(f"Found offers for {len(response.data)} hotels")
                return response.data
            return []

        except ResponseError as error:
            logger.error(f"Error fetching hotel offers: [{error.response.status_code}] {error.response.body}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in get_hotel_offers: {str(e)}")
            raise

    def format_hotel_details(self, hotel: Dict[str, Any]) -> str:
        """Format hotel offer details for display, with safeguards for list structures."""
        try:
            # Ensure 'offers' is a list and access the first element
            offers = hotel.get('offers', [])
            if not offers or not isinstance(offers, list):
                return "No offers available for this hotel."

            # Access the first offer safely
            offer = offers[0]

            # Access hotel data
            hotel_data = hotel.get('hotel', {})

            # Safely access fields with default values if missing
            hotel_name = hotel_data.get('name', 'N/A')
            price_total = offer.get('price', {}).get('total', 'N/A')
            #currency = offer.get('price', {}).get('currency', 'N/A')
            rating = hotel_data.get('rating', 'N/A')
            description_text = hotel_data.get('description', {}).get('text', 'N/A')[:100]

            return (
                f"🏨 Hotel: {hotel_name}\n"
                f"💰 Price: RM {price_total} \n"
                f"⭐ Rating: {rating}\n"
                f"📝 Description: {description_text}..."
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
        # Get slots
        city_code = tracker.get_slot("city")
        check_in = tracker.get_slot("check_in")
        check_out = tracker.get_slot("check_out")

        if not self.validate_hotel_params(city_code, check_in, check_out):
            dispatcher.utter_message(
                text="Please provide valid city, check-in, and check-out dates."
            )
            return []

        try:
            logger.info(f"Starting hotel search in {city_code} from {check_in} to {check_out}")

            # Initialize Amadeus Client
            amadeus = AmadeusClient().amadeus

            # Step 1: Get list of hotels in the city
            hotels_in_city = self.get_hotels_by_city(amadeus, city_code)

            if not hotels_in_city:
                dispatcher.utter_message(
                    text=f"Sorry, no hotels found in {city_code}."
                )
                return []

            # Create a mapping of hotel IDs to hotel info for later use
            hotel_info_map = {hotel['hotelId']: hotel for hotel in hotels_in_city}

            # Get first 10 hotel IDs (can adjust this number as needed)
            hotel_ids = [hotel['hotelId'] for hotel in hotels_in_city[:10]]

            # Step 2: Get hotel offers for these hotels
            hotel_offers = self.get_hotel_offers(
                amadeus,
                hotel_ids,
                check_in,
                check_out
            )

            if hotel_offers:
                # Format hotel details combining data from both APIs
                hotel_details = []
                for hotel_offer in hotel_offers[:3]:  # Show top 3 offers
                    hotel_id = hotel_offer['hotel']['hotelId']
                    hotel_info = hotel_info_map.get(hotel_id, {})
                    formatted_details = self.format_hotel_details(hotel_offer)
                    hotel_details.append(formatted_details)

                # Send message with hotel options
                dispatcher.utter_message(
                    text=(
                        f"🏨 Found {len(hotel_offers)} available hotels in {city_code}.\n"
                        f"Here are the top options:\n\n" +
                        "\n\n".join(hotel_details)
                    )
                )
            else:
                dispatcher.utter_message(
                    text=f"Sorry, no available hotels found in {city_code} for your dates."
                )
                
        except ResponseError as error:
            logger.error(f"Amadeus API error: [{error.response.status_code}] {error.response.body}")
            dispatcher.utter_message(
                text="Sorry, there was an error searching for hotels. Please try again later."
            )
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            dispatcher.utter_message(
                text="An unexpected error occurred. Please try again later."
            )
            
        return []

class ValidateFlightSearchForm(FormValidationAction):
    def name(self) -> Text:
        return "validate_flight_search_form"

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