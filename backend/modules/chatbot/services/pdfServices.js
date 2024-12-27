const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const wkhtmltopdf = require('wkhtmltopdf');
const PdfMetadata = require('../models/pdf');
const { userReportTemplate } = require('../../formatPdf/UTMInvoice');
const { MongoClient, GridFSBucket } = require('mongodb');

const generatePDF = async (data) => {
    const filePath = path.join(__dirname, '../../generated_report.pdf');
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(20).text('Generated PDF', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(data.text || 'Hello, this is your generated PDF!', { align: 'left' });

    doc.end();

    return filePath;
};

const storePDFInMongoDB = async (filePath, filename, db) => {
    const bucket = new GridFSBucket(db, {
        bucketName: 'requestForm', // You can use your own bucket name
    });
    console.log("This is filePath", filePath);
    return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(filename);
        const readStream = fs.createReadStream(filePath);

        readStream.pipe(uploadStream)
            .on('finish', () => resolve(uploadStream.id))  // Return GridFS ID
            .on('error', (error) => reject(error));
    });
};
const storePDFMetadata = async (fileId, username) => {
    const metadata = new PdfMetadata({
        fileId: fileId,
        username: username,
    });

    return await metadata.save();
};

const generateCustomPDF = async (data, db) => {
    const filePath = path.join(__dirname, '../../generated_custom_report.pdf');
    const htmlContent = userReportTemplate(data);

    return new Promise((resolve, reject) => {
        wkhtmltopdf(htmlContent, {
            output: filePath,
            pageSize: 'letter',
            marginTop: '10mm',
            marginBottom: '10mm',
            marginLeft: '10mm',
            marginRight: '10mm',
        })
            .on('end', async () => {
                try {
                    const pdfId = await storePDFInMongoDB(filePath, 'custom_report.pdf', db);
                    await storePDFMetadata(pdfId, data.username);
                    resolve(pdfId); // Resolve with GridFS ID
                } catch (error) {
                    reject(error);
                }
            })
            .on('error', (error) => reject(error));
    });
};

module.exports = { generatePDF, generateCustomPDF, storePDFMetadata };
