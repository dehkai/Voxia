// utils/sendEmail.js
const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables from .env file

const sendEmail = async (to, subject, text, html) => {
    // Create a transporter
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    // Define email options
    const mailOptions = {
        from: process.env.FROM_EMAIL,
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
