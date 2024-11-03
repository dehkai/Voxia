// routes.js
const express = require('express');
const { register, login } = require('./controllers/userController');
const { forgotPassword, resetPassword } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/profile', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Profile data', user: req.user });
});

module.exports = router;
