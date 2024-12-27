const userReportTemplate = (data) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Travel Request Form</title>
  <style>
  body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
  }
  .container {
    max-width: 900px;
    margin: 0 auto;
    background: white;
    border: 1px solid #ddd;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  .section-header {
    background-color: #2c3e50;
    color: white;
    padding: 10px;
    text-align: center;
    font-size: 18px;
    margin-bottom: 10px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  th, td {
    padding: 10px;
    text-align: left;
    border: 1px solid #ddd;
  }
  th {
    background-color: #2c3e50;
    color: white;
    width: 25%;
  }
  .highlight-box {
    background-color: #f0f0f0;
    padding: 10px;
    border: 1px solid #ddd;
    margin-bottom: 10px;
    border-radius: 5px;
  }
  .approval-section {
    margin-top: 20px;
    page-break-before: always; /* This ensures the entire approval section, including header, starts on a new page */
  }
  .checkbox {
    margin-right: 10px;
  }
  .signature-section {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
  }
  .signature-box {
    width: 45%;
  }
  .signature-box span {
    display: block;
    margin-bottom: 20px;
    border-bottom: 1px solid #000;
  }
</style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <h1 style="text-align: center;">TRAVEL REQUEST FORM</h1>
    <table>
      <tr>
        <th>Date:</th>
        <td>(current date)</td>
        <th>Department:</th>
        <td>(dont have yet)</td>
      </tr>
      <tr>
        <th>Employee Name:</th>
        <td>TAN CHEE SEN</td>
        <th>Employee ID:</th>
        <td>(dont have yet)</td>
      </tr>
      <tr>
        <th>Phone Number:</th>
        <td>(dont have yet)</td>
        <th>Email Address:</th>
        <td>tancheesen123@gmail.com</td>
      </tr>
      <tr>
        <th>Dates of Travel:</th>
        <td colspan="3">2025-4-12 to 2025-4-13</td>
      </tr>
    </table>

    <!-- Flight Information Section -->
    <div class="section-header">Flight Information</div>
    <table>
        <tr>
        <th>AirLine</th>
        <td colspan="3">BATIK AIR MALAYSIA</td>
      </tr>
      <tr>
        <th>Origin</th>
        <td>KUL</td>
        <th>Destination</th>
        <td>ICN</td>
      </tr>
      <tr>
        <th>Departure Date</th>
        <td>2025-02-16</td>
        <th>Return Date</th>
        <td>2025-02-16</td>
      </tr>
      <tr>
        <th>Trip Type</th>
        <td>Single</td>
        <th>Cabin Class</th>
        <td>Economy</td>
      </tr>
      <tr>
      <th>Flight</th>
        <td colspan="3" >OD820</td>
        </tr>
    </table>
    <div class="highlight-box">
      <strong>Selected Flight:</strong><br>
      💰 Price: RM 614.00<br>
    </div>

    <!-- Accommodation Information Section -->
    <div class="section-header">Accommodation Information</div>
    <table>
        <tr>
        <th>Hotel Name</th>
        <td colspan="3" >Best Western Jardin De Cluny</td>
      </tr>
      <tr>
        <th>City</th>
        <td colspan="3" >PAR</td>
      </tr>
      <tr>
        <th>Check-in Date</th>
        <td>2025-02-12</td>
        <th>Check-out Date</th>
        <td>2025-02-16</td>
      </tr>
      <tr>
        <th>Hotel Rating</th>
        <td>3 stars</td>
        <th>Room Category</th>
        <td>STANDARD_ROOM</td>
      </tr>
    </table>
    <div class="highlight-box">
      <strong>Selected Hotel:</strong><br>
      💰 Price: RM 4248.50<br>
      📝 Description: MULTI NIGHT STAY PROMOTION<br>
      1 DOUBLE BED, NSMK, CLASSIC STANDARD<br>
    </div>

    <!-- Approval Section -->
    <div class="section-header" style="page-break-before: always;">Approval</div>
      <label>
        <input type="checkbox" class="checkbox"> Manager Approval Required?
      </label>
      <br>
      <strong>Notes:</strong>
      <div style="border: 1px solid #ddd; padding: 10px; height: 50px;"></div>

    <!-- Signature Section -->
    <!-- Signature Section -->
<div class="signature-section" style="position: relative; display: flex; justify-content: space-between;">
  <div class="signature-box">
    <strong>Employee Signature:</strong><br>
    <span></span>
    Date: ____________________
  </div>
  <div class="signature-box" style="position: absolute; right: 0;">
    <strong>Manager Signature:</strong><br>
    <span></span>
    Date: ____________________
  </div>
</div>

  </div>
</body>
</html>

    `;
};

module.exports = {
    userReportTemplate
};