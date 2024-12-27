require('dotenv').config({ path: '.backend.env' });
const path = require('path');
const { generatePDF, generateCustomPDF } = require('../services/pdfServices');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const { ObjectId } = mongoose.Types;  // Import ObjectId from mongoose
const { GridFSBucket } = require('mongodb'); 

const dbPassword = process.env.DB_PASSWORD;
const dbUri = process.env.MONGODB_ATLAS_URI.replace('${DB_PASSWORD}', dbPassword);
console.log("Database URI being used:", dbUri);

const conn = mongoose.createConnection(dbUri, {
    dbName: 'Voxia',
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

let db, gfs;
conn.once('open', () => {
    db = conn.db;  // Get the database instance
    console.log("Connected to database:", db.databaseName);
    console.log('MongoDB Connection URI:', dbUri);

    gfs = new GridFSBucket(db, {
        bucketName: 'requestForm',  // Bucket name to store the PDFs
    });
});

const createPDFHandler = async (req, res) => {
    try {
        const data = req.body;
        const filePath = await generatePDF(data);

        // Notify success with a message
        res.status(200).json({
            message: 'PDF generated successfully',
            filePath: filePath,  // Send back the file path for reference
        });
        
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ message: 'An error occurred while generating the PDF' });
    }
};


const createCustomPDFHandler = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required!' });
        }

        const data = { username, password };
        const pdfId = await generateCustomPDF(data, db);

        res.status(200).json({
            message: 'PDF generated and stored successfully',
            fileId: pdfId,
        });
    } catch (error) {
        console.error('Custom PDF generation error:', error);
        res.status(500).json({ message: 'An error occurred while generating the PDF' });
    }
};

const downloadPDFHandler = async (req, res) => {
    try {
        const { fileId } = req.params;

        if (!fileId) {
            return res.status(400).json({ message: 'File ID is required!' });
        }

        // Check if gfs is properly initialized
        if (!gfs) {
            return res.status(500).json({ message: 'GridFS not initialized' });
        }

        // Convert the fileId to ObjectId
        const objectId = new ObjectId(fileId);

        // Create the read stream from GridFS using the ObjectId
        const readStream = gfs.openDownloadStream(objectId);
        
        readStream.on('error', (error) => {
            console.error('Error reading file:', error);
            res.status(404).send('File not found');
        });

        readStream.pipe(res);  // Pipe the stream to the response
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).send('An error occurred while downloading the PDF');
    }
};


module.exports = { 
    
    createPDFHandler,
    downloadPDFHandler,
    createCustomPDFHandler,
};