const userReportTemplate = (data) => {

  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split('T')[0];
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
        <th>Request Date:</th>
        <td>${data.basicInfo.current_date || 'Null Value'}</td>
        <th>Department:</th>
        <td>${data.basicInfo.department || 'Null Value'}</td>
      </tr>
      <tr>
        <th>Employee Name:</th>
        <td>${data.basicInfo.username || 'Null Value'}</td>
        <th>Employee ID:</th>
        <td>${data.basicInfo.employeeId || 'Null Value'}</td>
      </tr>
      <tr>
        <th>Phone Number:</th>
        <td>${data.basicInfo.phoneNum || 'Null Value'}</td>
        <th>Email Address:</th>
        <td>${data.basicInfo.email || 'Null Value'}</td>
      </tr>
      <tr>
        <th>Dates of Travel:</th>
        <td colspan="3">-</td>
      </tr>
    </table>

    <!-- Flight Information Section -->
    <div class="section-header">Flight Information</div>
    <table>
        <tr>
        <th>AirLine</th>
        <td colspan="3">${data.flight.airLineName || 'Null Value'}</td>
      </tr>
      <tr>
        <th>Origin</th>
        <td>${data.flight.origin || 'Null Value'}</td>
        <th>Destination</th>
        <td>${data.flight.destination || 'Null Value'}</td>
      </tr>
      <tr>
        <th>Departure Date</th>
        <td>${data.flight.departureDate || 'Null Value'}</td>
        <th>Return Date</th>
        <td>${data.flight.returnDate || 'Null Value'}</td>
      </tr>
      <tr>
        <th>Trip Type</th>
        <td>${data.flight.tripType || 'Null Value'}</td>
        <th>Cabin Class</th>
        <td>${data.flight.cabinClass || 'Null Value'}</td>
      </tr>
      <tr>
      <th>Flight</th>
        <td colspan="3" >${data.flight.flightCode || 'Null Value'}</td>
        </tr>
    </table>
    <div class="highlight-box">
      <strong>Selected Flight:</strong><br>
      💰 Price: RM ${data.flight.flightPrice || 'Null Value'}<br>
    </div>

    <!-- Accommodation Information Section -->
    <div class="section-header">Accommodation Information</div>
    <table>
        <tr>
        <th>Hotel Name</th>
        <td colspan="3" >${data.hotel.hotelName || 'Null Value'}</td>
      </tr>
      <tr>
        <th>City</th>
        <td colspan="3" >${data.hotel.city || 'Null Value'}</td>
      </tr>
      <tr>
        <th>Check-in Date</th>
        <td>${data.hotel.check_in_date || 'Null Value'}</td>
        <th>Check-out Date</th>
        <td>${data.hotel.check_out_date || 'Null Value'}</td>
      </tr>
      <tr>
        <th>Hotel Rating</th>
        <td>${data.hotel.hotelRating || 'Null Value'} stars</td>
        <th>Room Category</th>
        <td>${data.hotel.roomCategory || 'Null Value'}</td>
      </tr>
    </table>
    <div class="highlight-box">
      <strong>Selected Hotel:</strong><br>
      💰 Price: RM ${data.hotel.hotelPrice || 'Null Value'}<br>
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