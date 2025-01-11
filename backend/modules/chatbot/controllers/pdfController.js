require('dotenv').config({ path: '.backend.env' });
const path = require('path');
const { generatePDF, generateCustomPDF, generateTempoCustomPDF } = require('../services/pdfServices');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const { ObjectId } = mongoose.Types;  // Import ObjectId from mongoose
const { GridFSBucket } = require('mongodb'); 
const fs = require('fs');


const dbUri = process.env.MONGODB_ATLAS_URI;
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
        const data = req.body;
        // console.log("Received data:", JSON.stringify(data, null, 2));

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

const createTempoCustomPDFHandler = async (req, res) => {
    try {
        const data = req.body;
        // console.log("Received data:", JSON.stringify(data, null, 2));

        const pdfId = await generateTempoCustomPDF(data, db);

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

        if (!gfs) {
            return res.status(500).json({ message: 'GridFS not initialized' });
        }

        let objectId;
        try {
            objectId = new ObjectId(fileId);
        } catch (error) {
            return res.status(400).json({ message: 'Invalid File ID format!' });
        }

        const readStream = gfs.openDownloadStream(objectId);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${fileId}.pdf"`
        });

        readStream.on('error', (error) => {
            console.error('Error reading file:', error);
            res.status(404).send('File not found');
            res.end();
        });

        readStream.pipe(res);
    } catch (error) {
        console.error('Error downloading file with ID:', req.params.fileId, error);
        res.status(500).send('An error occurred while downloading the PDF');
    }
};

const downloadTemporeryPDF = async (req, res) => {
    try {
        const { fileId } = req.params;

        if (!fileId) {
            return res.status(400).json({ message: 'File ID is required!' });
        }

        // Whitelist of allowed file IDs (this can be dynamically populated, e.g., from a database)
        const allowedFiles = {
            '12345': 'example1.pdf',
            '67890': 'example2.pdf',
            'abcdef': 'example3.pdf'
        };

        const fileName = allowedFiles[fileId];
        if (!fileName) {
            return res.status(404).json({ message: 'File not found!' });
        }

        // Define the directory where your PDFs are stored
        const pdfDirectory = path.join(__dirname, '../../');
        const filePath = path.join(pdfDirectory, fileName);

        // Check if the file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found!' });
        }

        // Set headers and send the file
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${fileName}"`
        });

        const readStream = fs.createReadStream(filePath);

        readStream.on('error', (error) => {
            console.error('Error reading file:', error);
            res.status(500).send('An error occurred while downloading the PDF');
        });

        readStream.on('end', () => {
            // After the file has been sent, delete the file
            fs.unlink(filePath, (error) => {
                if (error) {
                    console.error('Error deleting file:', error);
                } else {
                    console.log(`File ${filePath} has been deleted.`);
                }
            });
        });

        readStream.pipe(res);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).send('An error occurred while downloading the PDF');
    }
};

const deletePDFHandler = async (req, res) => {
    try {
        const { fileId } = req.params;

        if (!fileId) {
            return res.status(400).json({ message: 'File ID is required to delete the PDF.' });
        }

        if (!gfs) {
            return res.status(500).json({ message: 'GridFS not initialized' });
        }

        let objectId;
        try {
            objectId = new ObjectId(fileId);
        } catch (error) {
            return res.status(400).json({ message: 'Invalid File ID format!' });
        }

        // Delete the file from GridFS
        gfs.delete(objectId, (error) => {
            if (error) {
                console.error('Error deleting file:', error);
                return res.status(500).json({ message: 'An error occurred while deleting the PDF.' });
            }

            // Optionally delete associated metadata
            PdfMetadata.deleteOne({ fileId: objectId }, (err) => {
                if (err) {
                    console.error('Error deleting metadata:', err);
                } else {
                    console.log(`Metadata for file ${fileId} deleted successfully.`);
                }
            });

            return res.status(200).json({ message: 'PDF deleted successfully.' });
        });
    } catch (error) {
        console.error('Error in deletePDFHandler:', error);
        return res.status(500).json({ message: 'An error occurred while deleting the PDF.' });
    }
};


module.exports = { 
    
    createPDFHandler,
    downloadPDFHandler,
    deletePDFHandler,
    createCustomPDFHandler,
    createTempoCustomPDFHandler,
    downloadTemporeryPDF,
};