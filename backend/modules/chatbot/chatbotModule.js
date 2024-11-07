const express = require('express');
const router = express.Router();
const { 
    createChatbotHandler,
    getAllChatbotsHandler,
    getChatbotByIdHandler,
    updateChatbotHandler,
    deleteChatbotHandler
} = require('../chatbot/controllers/ChatbotController');
const authMiddleware = require('../../middlewares/authMiddleware');

// Define CRUD routes for Chatbot
router.post('/chatbots',authMiddleware, createChatbotHandler);            // Create a new chatbot
router.get('/chatbots', getAllChatbotsHandler);            // Get all chatbots
router.get('/chatbots/:id', getChatbotByIdHandler);        // Get a single chatbot by ID
router.put('/chatbots/:id', updateChatbotHandler);         // Update a chatbot by ID
router.delete('/chatbots/:id', deleteChatbotHandler);      // Delete a chatbot by ID

module.exports = {
    chatbotRoutes: router
};