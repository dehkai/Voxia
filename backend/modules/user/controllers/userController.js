require('dotenv').config({ path: '.backend.env' });
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const { getUserTokenByEmail } = require('../services/userService');


const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne()
            .where('email').equals(email.toString())
            .collation({ locale: 'en', strength: 2 });
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

const login = [
    // Validation rules
    body('email')
        .isEmail().withMessage('Invalid email format')
        .trim()
        .escape(),
    body('password')
        .isString().withMessage('Password must be a string')
        .notEmpty().withMessage('Password cannot be empty'),

    // The actual login function
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            console.log('Login request received:', req.body);

            // Add timeout to database queries
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Database timeout')), 5000);
            });

            const userPromise = User.findOne()
                .where('email').equals(email.toString())
                .select('+password +role +email')
                .collation({ locale: 'en', strength: 2 });

            // Race between timeout and actual query
            const user = await Promise.race([userPromise, timeoutPromise]);

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

            // Update user token using findOneAndUpdate with $eq operator
            await User.findOneAndUpdate()
                .where('_id').equals(user._id.toString())
                .set({ token: token })
                .setOptions({ new: true });

            console.log('Login successful for user:', email);
            
            return res.status(200).json({
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
];

const getToken = [
    body('email')
        .isEmail().withMessage('Invalid email format')
        .trim()
        .escape(),

    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { email } = req.body;

            const token = await getUserTokenByEmail(req, res); 

            res.status(200).json({
                message: 'Token fetched successfully',
                token
            });
        } catch (error) {
            console.error('Error fetching token:', error);
            res.status(500).json({ message: `Error fetching token: ${error.message}` });
        }
    }
];
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

const changePassword = async (req, res) => {
    try {
        const userId = req.user.userId; 
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Both old and new passwords are required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isValidPassword = await bcrypt.compare(oldPassword, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Error changing password', error: error.message });
    }
};


module.exports = {
    register,
    login,
    getToken,
    updateUserDetails,
    changePassword
};

