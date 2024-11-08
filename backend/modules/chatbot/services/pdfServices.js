require('dotenv').config({ path: '.backend.env' });
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

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

module.exports = { generatePDF };