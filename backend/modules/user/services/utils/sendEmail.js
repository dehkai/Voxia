const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables from .env file

const sendEmail = async (to, subject, text, html) => {
    // Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',  // Use Gmail as the service
        auth: {
            user: process.env.SMTP_USER,  // Your Gmail address (e.g., 'youremail@gmail.com')
            pass: process.env.SMTP_PASS,  // Your Gmail App Password
        },
    });

    // Define email options
    const mailOptions = {
        from: process.env.FROM_EMAIL,  // Your email address (should match SMTP_USER)
        to,
        subject,
        text,
        html,
    };

    // Send the email
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Could not send email');
    }
};

module.exports = sendEmail;
