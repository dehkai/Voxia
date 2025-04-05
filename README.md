[![Netlify Status](https://api.netlify.com/api/v1/badges/9f088439-ba88-4872-9a28-c0b48d00ef52/deploy-status)](https://app.netlify.com/sites/harmonious-bunny-f39d71/deploys)
# Voxia - AI Smart Assistant

Voxia is an intelligent AI assistant platform that specializes in travel-related tasks and document automation. Built with modern technologies, it offers a seamless experience for flight and hotel searches, travel request generation, and PDF form auto-filling.

## Features

- **AI-Powered Travel Search**: Intelligent flight and hotel search capabilities
- **Natural Language Processing**: Built with Rasa for advanced conversational AI
- **Document Automation**: Automated PDF form filling and processing
- **Multi-language Support**: Handles multiple languages including English, Simplified Chinese, Traditional Chinese and Japanese for global accessibility
- **Secure Authentication**: Rate-limited API with robust user authentication
- **Admin Dashboard**: Comprehensive admin interface for system management

## Tech Stack

### Backend
- Node.js/Express
- MongoDB Atlas
- Rasa (NLP Engine)
- Docker

### Frontend
- React.js
- Material-UI

### AI/ML Components
- Rasa NLP
- Duckling (Entity Extraction)
- FastText
- Transformers

## Development Setup

### Prerequisites
- Docker and Docker Compose
- Node.js
- Python 3.9.10

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Voxia.git
cd Voxia
```

2. Set up environment variables:
- Create `.env` file in the root directory
- Create `.env` in the frontend directory
- Create `.backend.env` in the backend directory

3. Start the development environment:
```bash
docker-compose --profile dev up
```

### Production Deployment

```bash
docker-compose --profile prod up
```

## Architecture

Voxia follows a microservices architecture:
- Frontend (React) - Port 3000
- Backend (Node.js) - Port 5000
- Rasa Server - Port 5005
- Action Server - Port 5055
- Duckling Server - Port 8000

## Security Features

- Rate limiting for API endpoints
- CORS protection
- Enhanced authentication security
- MongoDB Atlas secure connection

## License

This project is proprietary software. All rights reserved.