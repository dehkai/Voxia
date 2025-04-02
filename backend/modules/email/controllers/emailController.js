const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../../user/models/User');
const mongoose = require('mongoose');
const {sendEmail, sendEmailWithPdfService} = require('../services/emailService');  // Utility to send email

// version 1

// const sendEmailWithPdf = async (req, res) => {
//     try {
//         const { to, subject, text, html, pdfFilename } = req.body;

//         // Validate required fields
//         if (!to || !subject || !pdfFilename) {
//             return res.status(400).json({ message: 'Missing required fields (to, subject, pdfFilename).' });
//         }

//         // Call the service to handle email sending
//         await sendEmailWithPdfService({ to, subject, text, html, pdfFilename });

//         return res.status(200).json({ message: 'Email with PDF sent successfully.' });
//     } catch (error) {
//         console.error('Error in sendEmailWithPdf:', error);
//         return res.status(500).json({ message: 'Failed to send email with PDF.' });
//     }
// };

const dbUri = process.env.MONGODB_ATLAS_URI;
//console.log("Database URI being used:", dbUri);

const conn = mongoose.createConnection(dbUri, {
    dbName: 'Voxia'
});

let db, gfs;
conn.once('open', () => {
    db = conn.db;  // Get the database instance
    //console.log("Connected to database:", db.databaseName);
    //console.log('MongoDB Connection URI:', dbUri);

});

const sendEmailWithPdf = async (req, res) => {
    try {
        const { to, subject, text, html, fileId } = req.body;

        // Validate required fields
        if (!to || !subject || !fileId) {
            return res.status(400).json({ message: 'Missing required fields (to, subject, fileId).' });
        }

        // Call the service to handle email sending
        await sendEmailWithPdfService({ to, subject, text, html, fileId, db });

        return res.status(200).json({ message: 'Email with PDF sent successfully.' });
    } catch (error) {
        console.error('Error in sendEmailWithPdf:', error);
        return res.status(500).json({ message: 'Failed to send email with PDF.' });
    }
};

module.exports = {
    sendEmailWithPdf,
};
