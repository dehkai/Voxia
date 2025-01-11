const nodemailer = require('nodemailer');
const path = require('path'); // Import the 'path' module
const fs = require('fs'); // Import 'fs' for file system operations
require('dotenv').config();
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb'); 

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

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendResetPasswordEmail = (to, link) => {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to,
    subject: 'Reset Your Password',
    text: `Click on this link to reset your password: ${link}`,
  };

  return transporter.sendMail(mailOptions);
};
// version 1 

// const sendEmailWithPdfService = async ({ to, subject, text, html, pdfFilename }) => {
//     try {
//         const pdfPath = path.resolve(__dirname, '../../../modules', pdfFilename);

//         // Check if the PDF file exists
//         if (!fs.existsSync(pdfPath)) {
//             throw new Error(`PDF file not found: ${pdfFilename}`);
//         }

//         // Read the PDF file as a Buffer
//         const pdfBuffer = fs.readFileSync(pdfPath);

//         // Define email options with PDF attachment
//         const mailOptions = {
//             from: process.env.FROM_EMAIL,
//             to,
//             subject,
//             text: text || `Please find the attached PDF: ${pdfFilename}`, // Default text if not provided
//             html: html || `<p>Please find the attached PDF: <strong>${pdfFilename}</strong></p>`, // Default HTML if not provided
//             attachments: [
//                 {
//                     filename: pdfFilename,
//                     content: pdfBuffer, // Use the buffer directly
//                     contentType: 'application/pdf', // Set MIME type explicitly
//                 },
//             ],
//         };

//         // Send the email
//         const info = await transporter.sendMail(mailOptions);
//         console.log(`Email sent to ${to} with PDF: ${pdfFilename}`);
//     } catch (error) {
//         console.error('Error in sendEmailWithPdfService:', error);
//         throw error;
//     }
// };

const sendEmailWithPdfService = async ({ to, subject, text, html, fileId, db }) => {
    console.log("Running sendEmailWithPdfService");
    try {
        if (!fileId) {
            throw new Error('File ID is required to fetch the PDF from the database.');
        }

        const bucket = new GridFSBucket(db, {
            bucketName: 'requestForm', // Ensure this matches your GridFS bucket name
        });

        // Fetch the PDF file as a Buffer
        const chunks = [];
        const downloadStream = bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));

        downloadStream.on('data', (chunk) => chunks.push(chunk));
        downloadStream.on('error', (error) => {
            console.error('Error fetching PDF from GridFS:', error);
            throw error;
        });

        // Wait for the stream to end and create a buffer
        const pdfBuffer = await new Promise((resolve, reject) => {
            downloadStream.on('end', () => resolve(Buffer.concat(chunks)));
            downloadStream.on('error', (error) => reject(error));
        });

        // Define email options with PDF attachment
        const mailOptions = {
            from: process.env.FROM_EMAIL,
            to,
            subject,
            text: text || 'Please find the attached PDF.', // Default text if not provided
            html: html || `<p>Please find the attached PDF.</p>`, // Default HTML if not provided
            attachments: [
                {
                    filename: `${fileId}.pdf`,
                    content: pdfBuffer, // Use the buffer from GridFS
                    contentType: 'application/pdf',
                },
            ],
        };

        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to} with PDF file ID: ${fileId}`);
    } catch (error) {
        console.error('Error in sendEmailWithPdfService:', error);
        throw error;
    }
};

module.exports = { 
    sendResetPasswordEmail,
    sendEmail,
    sendEmailWithPdfService
};
