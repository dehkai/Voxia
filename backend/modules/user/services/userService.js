require('dotenv').config({ path: '.backend.env' });
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' });
};

const verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY);
};

// Validation middleware for email
const validateEmail = [
    body('email')
        .isEmail().withMessage('Invalid email format')
        .trim()
        .escape()
];

// Function to get user token by email
const getUserTokenByEmail = async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
        const user = await User.findOne({
            email: { $eq: email }
        }).select('token');

        if (!user) {
            throw new Error('User not found');
        }
        return user.token;
    } catch (error) {
        throw new Error(`Error fetching user token: ${error.message}`);
    }
};

module.exports = { 
    generateToken, 
    verifyToken,
    getUserTokenByEmail: validateEmail.concat(getUserTokenByEmail) 
};
