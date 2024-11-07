const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { userRoutes } = require('./modules/user/userModule');
const { chatbotRoutes } = require('./modules/chatbot/ChatbotModule');
require('dotenv').config();

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // Your React app's URL
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