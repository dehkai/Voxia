const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { userRoutes } = require('./modules/user/userModule');
const { chatbotRoutes } = require('./modules/chatbot/chatbotModule');
const { emailRoutes } = require('./modules/email/emailModule');
require('dotenv').config();

const app = express();

const allowedOrigins = [
  'http://localhost:3000',   // React app local
  'http://localhost:5005',   // Rasa local
  'http://frontend:3000',    // React app in Docker
  'http://rasa:5005',        // Rasa in Docker
  'https://voxia.my',        // Voxia production 
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

mongoose.connect(`${process.env.MONGODB_ATLAS_URI}`, {
  dbName: 'Voxia',
})
.then(() => console.log('Connected to MongoDB - Database: Voxia'))
.catch(err => console.error('MongoDB connection error:', err));

// User routes - this matches the frontend fetch URL
app.use('/api/auth', userRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/email', emailRoutes);

// Rate limiter configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiter to all routes
app.use(limiter);

// Create specific limiters for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // start blocking after 5 requests
  message: {
    error: 'Too many login attempts from this IP, please try again after an hour'
  }
});

// Apply stricter rate limiting to authentication routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Increase timeout
app.timeout = 30000; // 30 seconds

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.code === 'ECONNRESET') {
    return res.status(503).json({
      message: 'Service temporarily unavailable. Please try again.'
    });
  }

  res.status(500).json({
    message: 'Internal server error'
  });
});