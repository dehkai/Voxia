const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');  // Utility to send email

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

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // Step 1: Find the user by the reset token and check expiration
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }, // Check if the token has expired
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        // Step 2: Hash the new password before saving it
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Error resetting password, please try again.' });
    }
};

module.exports = {
    forgotPassword,
    resetPassword // Make sure to export this
};
