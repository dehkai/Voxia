const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../../user/models/User');
const {sendEmail, sendEmailWithPdfService} = require('../services/emailService');  // Utility to send email

const sendEmailWithPdf = async (req, res) => {
    try {
        const { to, subject, text, html, pdfFilename } = req.body;

        // Validate required fields
        if (!to || !subject || !pdfFilename) {
            return res.status(400).json({ message: 'Missing required fields (to, subject, pdfFilename).' });
        }

        // Call the service to handle email sending
        await sendEmailWithPdfService({ to, subject, text, html, pdfFilename });

        return res.status(200).json({ message: 'Email with PDF sent successfully.' });
    } catch (error) {
        console.error('Error in sendEmailWithPdf:', error);
        return res.status(500).json({ message: 'Failed to send email with PDF.' });
    }
};

module.exports = {
    sendEmailWithPdf,
};
