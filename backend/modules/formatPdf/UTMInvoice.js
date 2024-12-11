const userReportTemplate = (data) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { 
                font-family: Arial; 
                padding: 40px; 
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .content {
                margin: 20px;
            }
            .user-info {
                border: 1px solid #ddd;
                padding: 20px;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>User Information Report</h1>
        </div>
        <div class="content">
            <div class="user-info">
                <h2>User Details</h2>
                <p><strong>Username:</strong> ${data.username || 'N/A'}</p>
                <p><strong>Password:</strong> ${data.password || 'N/A'}</p>
                <!-- Add more fields as needed -->
            </div>
        </div>
        <div class="footer">
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
        </div>
    </body>
    </html>
    `;
};

module.exports = {
    userReportTemplate
};