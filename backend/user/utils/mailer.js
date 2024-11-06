const nodemailer = require('nodemailer');
require('dotenv').config();

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

module.exports = { sendResetPasswordEmail };
