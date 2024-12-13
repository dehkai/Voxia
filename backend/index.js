const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { userRoutes } = require('./modules/user/userModule');
const { chatbotRoutes } = require('./modules/chatbot/ChatbotModule');
require('dotenv').config();

const app = express();

const allowedOrigins = [
  'http://localhost:3000',   // React app local
  'http://localhost:5005',   // Rasa local
  'http://frontend:3000',    // React app in Docker
  'http://rasa:5005'        // Rasa in Docker
];

// Enhanced CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

mongoose.connect(`mongodb+srv://dehkai:${process.env.DB_PASSWORD}@voxia.bkbvl.mongodb.net/voxia?retryWrites=true&w=majority&appName=Voxia`, {
  dbName: 'Voxia',
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB - Database: Voxia'))
.catch(err => console.error('MongoDB connection error:', err));

// User routes - this matches the frontend fetch URL
app.use('/api/auth', userRoutes);
app.use('/api/chatbot', chatbotRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));