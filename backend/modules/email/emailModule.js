const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/authMiddleware');
const { 
    sendEmailWithPdf
} = require('../email/controllers/emailController');


router.post('/sendEmailWithPdf', sendEmailWithPdf);


module.exports = {
    emailRoutes: router
};