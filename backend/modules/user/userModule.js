const express = require('express');
const router = express.Router();
const userController = require('./controllers/userController');
const authMiddleware = require('../../middlewares/authMiddleware');
const User = require('../user/models/User');

router.post('/login', userController.login); 
router.post('/register', userController.register);
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        res.status(200).json({ 
            message: 'Profile data', 
            user: {
                userId: user._id,
                role: user.role,
                email: user.email,
                username: user.username,
                preferences: user.preferences,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = {
    userRoutes: router
};