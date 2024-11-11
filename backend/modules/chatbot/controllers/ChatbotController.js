require('dotenv').config({ path: '.backend.env' });
const { createChatbot, getAllChatbots, getChatbotById, updateChatbot, deleteChatbot } = require('../services/ChatbotService');

const createChatbotHandler = async (req, res) => {
    try {
        const chatbotData = req.body;
        const chatbot = await createChatbot(chatbotData);
        res.status(201).json({ message: 'Chatbot created successfully', chatbot });
    } catch (error) {
        res.status(500).json({ message: 'Error creating chatbot', error: error.message });
    }
};

const getAllChatbotsHandler = async (req, res) => {
    try {
        const chatbots = await getAllChatbots();
        res.status(200).json({ chatbots });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving chatbots', error: error.message });
    }
};

const getChatbotByIdHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const chatbot = await getChatbotById(id);
        if (!chatbot) {
            return res.status(404).json({ message: 'Chatbot not found' });
        }
        res.status(200).json({ chatbot });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving chatbot', error: error.message });
    }
};

const updateChatbotHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const chatbotData = req.body;
        const updatedChatbot = await updateChatbot(id, chatbotData);
        if (!updatedChatbot) {
            return res.status(404).json({ message: 'Chatbot not found' });
        }
        res.status(200).json({ message: 'Chatbot updated successfully', chatbot: updatedChatbot });
    } catch (error) {
        res.status(500).json({ message: 'Error updating chatbot', error: error.message });
    }
};

const deleteChatbotHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedChatbot = await deleteChatbot(id);
        if (!deletedChatbot) {
            return res.status(404).json({ message: 'Chatbot not found' });
        }
        res.status(200).json({ message: 'Chatbot deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting chatbot', error: error.message });
    }
};

module.exports = {
    createChatbotHandler,
    getAllChatbotsHandler,
    getChatbotByIdHandler,
    updateChatbotHandler,
    deleteChatbotHandler,
};