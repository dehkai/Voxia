require('dotenv').config({ path: '.backend.env' });
const jwt = require('jsonwebtoken');
const User = require('../models/User');


const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

const generateToken = (user) => {
  return jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' });
};

const verifyToken = (token) => {
  return jwt.verify(token, SECRET_KEY);
};

const getUserTokenByEmail = async (email) => {
  try {
      const user = await User.findOne({ email });
      if (!user) {
          throw new Error('User not found');
      }
      return user.token; // Return the stored token
  } catch (error) {
      throw new Error(`Error fetching user token: ${error.message}`);
  }
};

module.exports = { 
  generateToken, 
  verifyToken,
  getUserTokenByEmail

};
