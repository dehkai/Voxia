const express = require('express');
const router = express.Router();
const userController = require('./controllers/userController');
const authMiddleware = require('../../middlewares/authMiddleware');

router.post('/login', userController.login); 
router.post('/register', userController.register);
router.get('/profile', authMiddleware, (req, res) => {
    res.status(200).json({ message: 'Profile data', user: req.user });
});

module.exports = {
    userRoutes: router
};
