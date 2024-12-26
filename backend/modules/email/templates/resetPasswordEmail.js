const getResetPasswordTemplate = (resetLink) => {
    return {
        subject: 'Password Reset Request - Origtek',
        plainText: `
Hello,

We received a request to reset the password for your Origtek account. 

To reset your password, please click on the link below:
${resetLink}

This link will expire in 1 hour for security purposes.

If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.

Best regards,
The Origtek Team

Note: This is an automated message, please do not reply to this email.`,
        
        html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
            <td style="padding: 20px 0;">
                <table align="center" role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h1 style="color: #2c3e50; font-size: 24px; margin: 0 0 20px; text-align: center;">Password Reset Request</h1>
                            
                            <p style="color: #333; font-size: 16px; line-height: 24px; margin: 0 0 20px;">Hello,</p>
                            
                            <p style="color: #333; font-size: 16px; line-height: 24px; margin: 0 0 20px;">We received a request to reset the password for your Origtek account.</p>
                            
                            <p style="color: #333; font-size: 16px; line-height: 24px; margin: 0 0 20px;">To reset your password, please click the button below:</p>
                            
                            <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin: 30px auto;">
                                <tr>
                                    <td align="center">
                                        <a href="${resetLink}" 
                                           style="background-color: #3498db; 
                                                  border-radius: 4px;
                                                  color: #ffffff; 
                                                  display: inline-block; 
                                                  font-size: 16px; 
                                                  font-weight: bold;
                                                  line-height: 1.2;
                                                  padding: 12px 30px; 
                                                  text-decoration: none;
                                                  text-align: center;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="color: #666; font-size: 14px; line-height: 21px; margin: 0 0 20px;">This link will expire in 1 hour for security purposes.</p>
                            
                            <p style="color: #333; font-size: 16px; line-height: 24px; margin: 0 0 20px;">If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.</p>
                            
                            <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px;">
                                <p style="color: #666; font-size: 14px; line-height: 21px; margin: 0;">
                                    Best regards,<br>
                                    The Origtek Team
                                </p>
                            </div>
                            
                            <p style="color: #999; font-size: 12px; font-style: italic; line-height: 18px; margin: 20px 0 0;">
                                Note: This is an automated message, please do not reply to this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`
    };
};

module.exports = getResetPasswordTemplate; 