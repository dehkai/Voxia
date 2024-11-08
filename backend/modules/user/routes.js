// routes.js
const express = require('express');
const { register, login, getToken } = require('./controllers/userController');
const authMiddleware = require('../../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/fetch-token', getToken);


router.get('/profile', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Profile data', user: req.user });
});

module.exports = router;