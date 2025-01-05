const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const PdfMetadata = require('../models/pdf');
const { userReportTemplate } = require('../../formatPdf/UTMInvoice');
const { MongoClient, GridFSBucket } = require('mongodb');
const puppeteer = require('puppeteer');

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
const storePDFMetadata = async (fileId, metadata) => {
    const pdfMetadata = new PdfMetadata({
        fileId,
        ...metadata, // Spread the metadata object to include all fields
    });

    return await pdfMetadata.save();
};

// const generateCustomPDF = async (data, db) => {
//     const filePath = path.join(__dirname, '../../generated_custom_report.pdf');
//     const htmlContent = userReportTemplate(data); // Updated template to handle `basicInfo`, `flight`, and `hotel`

//     return new Promise((resolve, reject) => {
//         wkhtmltopdf(htmlContent, {
//             output: filePath,
//             pageSize: 'letter',
//             marginTop: '10mm',
//             marginBottom: '10mm',
//             marginLeft: '10mm',
//             marginRight: '10mm',
//         })
//             .on('end', async () => {
//                 try {
//                     const pdfId = await storePDFInMongoDB(filePath, 'custom_report.pdf', db);

//                     // Store metadata with detailed information
//                     await storePDFMetadata(pdfId, {
//                         username: data.basicInfo.username,
//                         email: data.basicInfo.email,
//                         department: data.basicInfo.department,
//                         employeeId: data.basicInfo.employeeId,
//                         phoneNum: data.basicInfo.phoneNum,
//                         flightDetails: data.flight,
//                         hotelDetails: data.hotel,
//                     });
                    
//                     fs.unlink(filePath, (err) => {
//                         if (err) {
//                             console.error("Error deleting the file:", err);
//                         } else {
//                             console.log("File deleted successfully:", filePath);
//                         }
//                     });

//                     resolve(pdfId);
//                 } catch (error) {
//                     reject(error);
//                 }
//             })
//             .on('error', (error) => reject(error));
//     });
// };

// const generateTempoCustomPDF = async (data) => {
//     const filePath = path.join(__dirname, `../../example1.pdf`);
//     const htmlContent = userReportTemplate(data); // Updated template to handle `basicInfo`, `flight`, and `hotel`

//     return new Promise((resolve, reject) => {
//         wkhtmltopdf(htmlContent, {
//             output: filePath,
//             pageSize: 'letter',
//             marginTop: '10mm',
//             marginBottom: '10mm',
//             marginLeft: '10mm',
//             marginRight: '10mm',
//         })
//             .on('end', () => {
//                 console.log(`PDF successfully generated at: ${filePath}`);
//                 resolve(filePath); // Return the file path instead of storing in MongoDB
//             })
//             .on('error', (error) => {
//                 console.error('Error generating PDF:', error);
//                 reject(error);
//             });
//     });
// };

const generateTempoCustomPDF = async (data, db) => {
    const filePath = path.join(__dirname, '../../example1.pdf');
    const htmlContent = userReportTemplate(data); // Your HTML template generator

    try {
        // Launch Puppeteer
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Set HTML content
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        // await page.screenshot({ path: 'debug.png', fullPage: true });

        // Generate PDF
        await page.pdf({
            path: filePath,
            format: 'A4',
            printBackground: true,
            margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
        });
        

        // console.log(`PDF successfully generated at: ${filePath}`);
        await browser.close();

        // Store PDF in MongoDB
        

        // Clean up the file
        // fs.unlink(filePath, (err) => {
        //     if (err) {
        //         console.error('Error deleting the file:', err);
        //     } else {
        //         console.log('File deleted successfully:', filePath);
        //     }
        // });

        // return pdfId; // Return MongoDB's GridFS ID
        return (`PDF successfully generated at: ${filePath}`);
    } catch (error) {
        console.error('Error generating PDF with Puppeteer:', error);
        throw error;
    }
};


const generateCustomPDF = async (data, db) => {
    const filePath = path.join(__dirname, '../../generated_custom_report.pdf');
    const htmlContent = userReportTemplate(data); // Your HTML template generator

    try {
        // Launch Puppeteer
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Set HTML content
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        // await page.screenshot({ path: 'debug.png', fullPage: true });

        // Generate PDF
        await page.pdf({
            path: filePath,
            format: 'A4',
            printBackground: true,
            margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
        });

        console.log(`PDF successfully generated at: ${filePath}`);
        await browser.close();

        // Store PDF in MongoDB
        const pdfId = await storePDFInMongoDB(filePath, 'custom_report.pdf', db);

        // Store metadata
        await storePDFMetadata(pdfId, {
            username: data.basicInfo.username,
            email: data.basicInfo.email,
            department: data.basicInfo.department,
            employeeId: data.basicInfo.employeeId,
            phoneNum: data.basicInfo.phoneNum,
            flightDetails: data.flight,
            hotelDetails: data.hotel,
        });

        // Clean up the file
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting the file:', err);
            } else {
                console.log('File deleted successfully:', filePath);
            }
        });

        return pdfId; // Return MongoDB's GridFS ID
    } catch (error) {
        console.error('Error generating PDF with Puppeteer:', error);
        throw error;
    }
};

module.exports = { generatePDF, generateCustomPDF, storePDFMetadata, generateTempoCustomPDF };
