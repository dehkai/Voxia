require('dotenv').config({ path: '.backend.env' });
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';
const Chatbot = require('../models/ChatBot');

const createChatbot = async (chatbotData) => {
    const chatbot = new Chatbot(chatbotData);
    return await chatbot.save();
};

const getAllChatbots = async () => {
    return await Chatbot.find();
};

const getChatbotById = async (id) => {
    return await Chatbot.findById(id);
};

const updateChatbot = async (id, chatbotData) => {
    return await Chatbot.findByIdAndUpdate(id, chatbotData, { new: true });
};

const deleteChatbot = async (id) => {
    return await Chatbot.findByIdAndDelete(id);
};

module.exports = {
    createChatbot,
    getAllChatbots,
    getChatbotById,
    updateChatbot,
    deleteChatbot,
};