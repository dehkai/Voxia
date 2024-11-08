require('dotenv').config({ path: '.backend.env' });
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { getUserTokenByEmail } = require('../services/userService');


const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            role
        });

        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

const login = async (req, res) => {
    try {
        console.log('Login request received:', req.body); // Log incoming request
        
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.log('Invalid password for user:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { 
                userId: user._id,
                role: user.role,
                email: user.email
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        user.token = token; // Update the user's token field
        await user.save();

        console.log('Login successful for user:', email);

        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Server error during login',
            error: error.message 
        });
    }
};

const getToken = async (req, res) => {
    try {
        const { email } = req.body;

        // Fetch the token from the service
        const token = await getUserTokenByEmail(email);

        res.status(200).json({
            message: 'Token fetched successfully',
            token
        });
    } catch (error) {
        console.error('Error fetching token:', error);
        res.status(500).json({ message: `Error fetching token: ${error.message}` });

    }
}
const updateUserDetails = async (req, res) => {
    try {
        const userId = req.user.userId;  
        const updatedData = req.body;    

        // Find the user and update the details
        const user = await User.findByIdAndUpdate(userId, updatedData, { new: true });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'User details updated successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                gender: user.gender,
                jobTitle: user.jobTitle,
                preferences: user.preferences,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error('Error updating user details:', error);
        res.status(500).json({ message: 'Error updating user details', error: error.message });
    }
};

module.exports = {
    register,
    login,
    getToken,
    updateUserDetails
};