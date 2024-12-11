require('dotenv').config({ path: '.backend.env' });
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { userReportTemplate } = require('../../formatPdf/UTMInvoice');
const { exampleTemplate } = require('../../formatPdf/ExampleInvoice');
const wkhtmltopdf = require('wkhtmltopdf');

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

// const generateCustomPDF = async (data) => {
//     const filePath = path.join(__dirname, '../../generated_custom_report.pdf');
    
//     // Get HTML content from template
//     const htmlContent = userReportTemplate(data);
    
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
    
//     try {
//         await page.setContent(htmlContent);
//         await page.pdf({
//             path: filePath,
//             format: 'A4',
//             printBackground: true,
//             margin: {
//                 top: '20px',
//                 right: '20px',
//                 bottom: '20px',
//                 left: '20px'
//             }
//         });
        
//         await browser.close();
//         return filePath;
//     } catch (error) {
//         await browser.close();
//         throw error;
//     }
// };

const generateCustomPDF = async (data) => {
    const filePath = path.join(__dirname, '../../generated_custom_report.pdf');
    const htmlContent = exampleTemplate(data);

    return new Promise((resolve, reject) => {
        wkhtmltopdf(htmlContent, { 
            output: filePath,
            pageSize: 'letter',
            marginTop: '10mm',
            marginBottom: '10mm',
            marginLeft: '10mm',
            marginRight: '10mm'
        })
        .on('end', () => {
            resolve(filePath);
        })
        .on('error', (error) => {
            reject(error);
        });
    });
};


module.exports = { generatePDF, generateCustomPDF };