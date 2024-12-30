const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/authMiddleware');
const { 
    createChatbotHandler,
    getAllChatbotsHandler,
    getChatbotByIdHandler,
    updateChatbotHandler,
    deleteChatbotHandler,
} = require('../chatbot/controllers/ChatbotController');
const { 
    createPDFHandler, 
    downloadPDFHandler,
    createCustomPDFHandler,
    downloadTemporeryPDF,
    createTempoCustomPDFHandler,
} = require('./controllers/pdfController');


// Define CRUD routes for Chatbot
router.post('/chatbots',authMiddleware, createChatbotHandler);            // Create a new chatbot
router.get('/chatbots', getAllChatbotsHandler);            // Get all chatbots
router.get('/chatbots/:id', getChatbotByIdHandler);        // Get a single chatbot by ID
router.put('/chatbots/:id', updateChatbotHandler);         // Update a chatbot by ID
router.delete('/chatbots/:id', deleteChatbotHandler);      // Delete a chatbot by ID


// PDF generation route
router.post('/chatbots/generate-pdf', createPDFHandler);
router.get('/chatbots/generate-pdf/download/:fileId', downloadPDFHandler);
router.get('/chatbots/generate-pdf/downloadTempo/:fileId', downloadTemporeryPDF);
router.post('/chatbots/generate-custom', createCustomPDFHandler);
router.post('/chatbots/generate-tempo-custom', createTempoCustomPDFHandler);

module.exports = {
    chatbotRoutes: router
};