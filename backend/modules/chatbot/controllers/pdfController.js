require('dotenv').config({ path: '.backend.env' });
const path = require('path'); 
const { generatePDF, generateCustomPDF  } = require('../services/pdfServices');

const createPDFHandler = async (req, res) => {
    try {
        const data = req.body;
        const filePath = await generatePDF(data);

        // Notify success with a message
        res.status(200).json({
            message: 'PDF generated successfully',
            filePath: filePath,  // Send back the file path for reference
        });

        // // Optionally, trigger the file download after the notification
        // res.download(filePath, 'generated_report.pdf', (err) => {
        //     if (err) {
        //         console.error('Error sending file:', err);
        //         res.status(500).send('Error generating PDF');
        //     }
        // });
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ message: 'An error occurred while generating the PDF' });
    }
};

// const createCustomPDFHandler = async (req, res) => {
//     try {
//         const { username, password } = req.body;

//         if (!username || !password) {
//             return res.status(400).json({ message: 'Username and password are required!' });
//         }

//         const data = {
//             username,
//             password
//             // Add more fields as needed
//         };

//         const filePath = await generateCustomPDF(data);

//         res.status(200).json({
//             message: 'PDF generated successfully',
//             filePath: filePath,
//         });
//     } catch (error) {
//         console.error('Custom PDF generation error:', error);
//         res.status(500).json({ message: 'An error occurred while generating the PDF' });
//     }
// };

const createCustomPDFHandler = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required!' });
        }

        const data = { username, password };
        const filePath = await generateCustomPDF(data);

        res.status(200).json({
            message: 'PDF generated successfully',
            filePath: filePath
        });
    } catch (error) {
        console.error('Custom PDF generation error:', error);
        res.status(500).json({ message: 'An error occurred while generating the PDF' });
    }
};

const downloadPDFHandler = (req, res) => {
    const filePath = path.join(__dirname, '../../generated_report.pdf');
    res.download(filePath, 'generated_report.pdf', (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(500).send('Error downloading PDF');
        }
    });
};


module.exports = { 
    
    createPDFHandler,
    downloadPDFHandler,
    createCustomPDFHandler,
};