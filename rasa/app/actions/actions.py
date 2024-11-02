from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from amadeus import Client, ResponseError
from datetime import datetime
import logging
from .env_loader import setup_credentials  
from rasa_sdk.forms import FormValidationAction
from rasa_sdk.types import DomainDict

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AmadeusClient:
    """Singleton class for Amadeus API client"""
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            # Get credentials from processed credentials file
            credentials = setup_credentials()  # Keep using existing setup_credentials
            amadeus_creds = credentials.get('amadeus', {})
            
            # Initialize with test environment
            cls._instance.client = Client(
                client_id=amadeus_creds['client_id'],
                client_secret=amadeus_creds['client_secret'],
                hostname='test'  # Add test environment
            )
            logger.info("Initialized Amadeus client in test environment")
        return cls._instance

    @property
    def amadeus(self):
        return self.client

class ActionSearchFlights(Action):
    """Rasa action for searching flights using Amadeus API"""
    
    def name(self) -> Text:
        return "action_search_flights"
    
    def validate_flight_params(self, origin: str, destination: str, departure_date: str) -> bool:
        """Validate flight search parameters"""
        if not all([origin, destination, departure_date]):
            return False
            
        try:
            datetime.strptime(departure_date, '%Y-%m-%d')
            return True
        except ValueError:
            return False

    def format_flight_details(self, offer: Dict[str, Any]) -> str:
        """Format flight offer details for display"""
        try:
            price = offer['price']['total']
            itinerary = offer['itineraries'][0]
            segment = itinerary['segments'][0]
            
            departure_time = datetime.fromisoformat(segment['departure']['at'].replace('Z', '')).strftime('%Y-%m-%d %H:%M')
            arrival_time = datetime.fromisoformat(segment['arrival']['at'].replace('Z', '')).strftime('%Y-%m-%d %H:%M')
            
            return (
                f"🛩️ Flight: {segment['carrierCode']} {segment['number']}\n"
                f"💰 Price: {price} EUR\n"
                f"⏱️ Duration: {itinerary['duration']}\n"
                f"🛫 Departure: {departure_time}\n"
                f"🛬 Arrival: {arrival_time}\n"
                f"📍 From: {segment['departure']['iataCode']} to {segment['arrival']['iataCode']}"
            )
        except Exception as e:
            logger.error(f"Error formatting flight details: {str(e)}")
            return "Error formatting flight details"

    async def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:
        
        # Get slots
        origin = tracker.get_slot("origin")
        destination = tracker.get_slot("destination")
        departure_date = tracker.get_slot("departure_date")
        
        # Validate parameters
        if not self.validate_flight_params(origin, destination, departure_date):
            dispatcher.utter_message(
                text="Please provide valid origin, destination, and departure date."
            )
            return []
            
        try:
            logger.info(f"Searching flights: {origin} -> {destination} on {departure_date}")
            
            amadeus = AmadeusClient().amadeus
            response = amadeus.shopping.flight_offers_search.get(
                originLocationCode=origin,
                destinationLocationCode=destination,
                departureDate=departure_date,
                adults=1,
                max=5,  # Limit to top 5 results
                currencyCode="EUR"
            )
            
            if response.data:
                flight_details = [
                    self.format_flight_details(offer)
                    for offer in response.data[:3]
                ]
                
                dispatcher.utter_message(
                    text=(
                        f"✈️ Found {len(response.data)} flights from {origin} to {destination}.\n"
                        f"Here are the top options:\n\n" +
                        "\n\n".join(flight_details)
                    )
                )
            else:
                dispatcher.utter_message(
                    text=f"Sorry, no flights found from {origin} to {destination} on {departure_date}."
                )
                
        except ResponseError as error:
            logger.error(f"Amadeus API error: [{error.response.status_code}] {error.response.body}")
            dispatcher.utter_message(
                text="Sorry, there was an error searching for flights. Please try again later."
            )
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            dispatcher.utter_message(
                text="An unexpected error occurred. Please try again later."
            )
            
        return []

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

    def format_hotel_details(self, hotel: Dict[str, Any]) -> str:
        """Format hotel offer details for display"""
        offer = hotel['offers'][0]
        hotel_data = hotel['hotel']
        
        return (
            f"🏨 Hotel: {hotel_data['name']}\n"
            f"💰 Price: {offer['price']['total']} {offer['price']['currency']}\n"
            f"⭐ Rating: {hotel_data.get('rating', 'N/A')}\n"
            f"📍 Address: {hotel_data['address']['lines'][0]}, {hotel_data['address'].get('cityName', '')}\n"
            f"📝 Description: {hotel_data.get('description', {}).get('text', 'N/A')[:100]}..."
        )

    async def run(
        self,
        dispatcher: CollectingDispatcher,
        tracker: Tracker,
        domain: Dict[Text, Any]
    ) -> List[Dict[Text, Any]]:
        
        city_code = tracker.get_slot("city")
        check_in = tracker.get_slot("check_in")
        check_out = tracker.get_slot("check_out")
        
        if not self.validate_hotel_params(city_code, check_in, check_out):
            dispatcher.utter_message(
                text="Please provide valid city, check-in, and check-out dates."
            )
            return []
            
        try:
            logger.info(f"Searching hotels in {city_code} from {check_in} to {check_out}")
            
            amadeus = AmadeusClient().amadeus
            response = amadeus.shopping.hotel_offers.get(
                cityCode=city_code,
                checkInDate=check_in,
                checkOutDate=check_out,
                adults=1,
                radius=5,
                radiusUnit='KM',
                paymentPolicy='NONE',
                includeClosed=False,
                bestRateOnly=True
            )
            
            if response.data:
                hotel_details = [
                    self.format_hotel_details(hotel)
                    for hotel in response.data[:3]
                ]
                
                dispatcher.utter_message(
                    text=(
                        f"🏨 Found {len(response.data)} hotels in {city_code}.\n"
                        f"Here are the top options:\n\n" +
                        "\n\n".join(hotel_details)
                    )
                )
            else:
                dispatcher.utter_message(
                    text=f"Sorry, no hotels found in {city_code} for your dates."
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