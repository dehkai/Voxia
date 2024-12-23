const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const {sendEmail} = require('../../email/services/emailService');  // Utility to send email
const { body, validationResult } = require('express-validator');

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Forgot password request received:', req.body);

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found for email:', email);
            return res.status(404).json({ message: 'User with this email does not exist.' });
        }

        const token = crypto.randomBytes(16).toString('hex'); // Generates a 32-character token
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const resetLink = `http://localhost:3000/reset-password?token=${token}`;
        
        // Send the reset email
        await sendEmail(email, 'Password Reset', 
            `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}`, 
            `<p>You requested a password reset. Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`
        );

        res.status(200).json({ message: 'Password reset link has been sent to your email.' });

    } catch (error) {
        console.error('Error in forgot password:', error);
        res.status(500).json({ message: 'Error sending email, please try again.' });
    }
};

const resetPassword = [
    body('token')
        .isString().withMessage('Token must be a string')
        .notEmpty().withMessage('Token cannot be empty'),
    body('password')
        .isString().withMessage('Password must be a string')
        .notEmpty().withMessage('Password cannot be empty'),

    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { token, password } = req.body;

            // Step 1: Find the user by the reset token and check expiration
            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }, // Check if the token has expired
            });

            if (!user) {
                return res.status(400).json({ message: 'Invalid or expired token.' });
            }

            // Step 2: Check if the new password is the same as the old password
            const isOldPassword = await bcrypt.compare(password, user.password);
            if (isOldPassword) {
                return res.status(400).json({ message: 'New password cannot be the same as the old password.' });
            }

            // Step 3: Save the password
            user.password = password; // 

            // Clear the reset token and expiration after successful password reset
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            res.status(200).json({ message: 'Password has been reset successfully.' });
        } catch (error) {
            console.error('Error resetting password:', error);  // Log the error for debugging
            res.status(500).json({ message: 'Error resetting password, please try again.' });
        }
    }
];

module.exports = {
    forgotPassword,
    resetPassword
};
