from typing import Dict, Text, Any
from pathlib import Path
import os
from dotenv import load_dotenv
import yaml
import re

class RasaCredentialsLoader:
    """Utility class to load and process Rasa credentials with environment variables"""
    
    def __init__(self, env_path: str = None, credentials_path: str = None):
        # Dynamically find the Voxia root directory by going up the folder structure
        current_dir = Path(__file__).resolve().parent  # Current file directory (actions folder)
        root_dir = current_dir.parents[2]  # Assume the root (Voxia) is two levels up
        
        # Set the paths dynamically based on the detected root
        self.env_path = Path(env_path) if env_path else root_dir / '.env'
        self.credentials_path = Path(credentials_path) if credentials_path else root_dir / 'rasa' / 'app' / 'credentials.yml'
        
        # Debug statements to confirm paths
        print(f"Attempting to load .env file from: {self.env_path}")
        print(f"Attempting to load credentials.yml file from: {self.credentials_path}")

        # Check if .env file exists
        if not self.env_path.exists():
            print(f"Warning: .env file not found at {self.env_path}")
        else:
            print(f".env file found at {self.env_path}")

        # Check if credentials.yml file exists
        if not self.credentials_path.exists():
            print(f"Warning: credentials.yml file not found at {self.credentials_path}")
        else:
            print(f"credentials.yml file found at {self.credentials_path}")

    def load_env_variables(self) -> None:
        """Load environment variables from .env file"""
        
        if not self.env_path.exists():
            raise FileNotFoundError(f".env file not found at {self.env_path}")
        load_dotenv(self.env_path)
        print("Environment variables loaded from .env")
        print(f"AMADEUS_CLIENT_ID: {os.getenv('AMADEUS_CLIENT_ID')}")
        print(f"AMADEUS_CLIENT_SECRET: {os.getenv('AMADEUS_CLIENT_SECRET')}")

    def replace_env_variables(self, value: Any) -> Any:
        """Recursively replace environment variables in the config"""
        if isinstance(value, str):
            # Find all ${VARIABLE} patterns
            pattern = r'\${([^}^{]+)}'
            matches = re.finditer(pattern, value)
            
            # Replace each match with its environment variable value
            for match in matches:
                env_var = match.group(1)
                env_value = os.getenv(env_var)
                if env_value is None:
                    raise ValueError(f"Environment variable {env_var} not found")
                value = value.replace(f"${{{env_var}}}", env_value)
            return value
        
        elif isinstance(value, dict):
            return {k: self.replace_env_variables(v) for k, v in value.items()}
        elif isinstance(value, list):
            return [self.replace_env_variables(item) for item in value]
        return value
    
    def process_credentials(self) -> Dict[Text, Any]:
        """Load and process credentials file with environment variables"""
        # First load environment variables
        self.load_env_variables()
        
        # Read the credentials file
        if not self.credentials_path.exists():
            raise FileNotFoundError(f"Credentials file not found at {self.credentials_path}")
            
        with open(self.credentials_path, 'r') as f:
            credentials = yaml.safe_load(f)
        
        # Replace environment variables in the credentials
        processed_credentials = self.replace_env_variables(credentials)
        print("Processed credentials with environment variables replaced:", processed_credentials)
        
        return processed_credentials
    
def setup_credentials():
    """Utility function to set up credentials"""
    loader = RasaCredentialsLoader()
    return loader.process_credentials()