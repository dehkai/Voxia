const express = require('express');
const router = express.Router();
const userController = require('./controllers/userController');
const authController = require('./controllers/authController');

// User authentication routes
router.post('/login', userController.login); 
router.post('/register', userController.register);

// Forgot password route
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);


module.exports = {
    userRoutes: router
};
