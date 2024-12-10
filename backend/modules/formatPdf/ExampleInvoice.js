const exampleTemplate = (data) => {
    return `
    <!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            font-size: 14px;
        }
        .company-address {
            margin-bottom: 50px;
        }
        .invoice-header {
            text-align: right;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 30px;
        }
        .customer-info {
            margin-bottom: 20px;
        }
        .invoice-details {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .invoice-details td {
            border: 1px solid #000;
            padding: 8px;
        }
        .summary-table {
            width: 100%;
            margin-bottom: 20px;
        }
        .summary-table td {
            padding: 5px;
        }
        .summary-table .amount-column {
            text-align: right;
            width: 100px;
        }
        .total-row {
            border-top: 1px solid #000;
            font-weight: bold;
        }
        .vat-info {
            margin-top: 10px;
        }
        .billing-footer {
            margin-top: 50px;
        }
    </style>
</head>
<body>
    <div class="company-address">
        XYZ Company Ltd<br>
        2218 Street<br>
        TOWN<br>
        CITY<br>
        COUNTRY
    </div>

    <div class="invoice-header">INVOICE</div>

    <div class="customer-info">
        Customer VAT Number: ${data.username || 'GB123456789'}<br>
        Customer email: ${data.password || 'abc@xyz.com'}
    </div>

    <table class="invoice-details">
        <tr>
            <td>Billing Account Number</td>
            <td>Customer Number</td>
            <td>Invoice Number</td>
            <td>Invoice Date</td>
            <td>Payment Due Date</td>
        </tr>
        <tr>
            <td>123456</td>
            <td>23579-0</td>
            <td>2024/XXX/456</td>
            <td>01-JUL-2024</td>
            <td>31-JUL-2024</td>
        </tr>
    </table>

    <table class="summary-table">
        <tr>
            <td>Summary Charges</td>
            <td class="amount-column">GBP</td>
        </tr>
        <tr>
            <td>Data Services Charges</td>
            <td class="amount-column">265.42</td>
        </tr>
        <tr>
            <td>Other Services Charges</td>
            <td class="amount-column">197.14</td>
        </tr>
        <tr>
            <td>Sub Total</td>
            <td class="amount-column">462.56</td>
        </tr>
        <tr>
            <td>Total Charges ex VAT</td>
            <td class="amount-column">462.56</td>
        </tr>
        <tr>
            <td>VAT @ 20.00%</td>
            <td class="amount-column">92.52</td>
        </tr>
        <tr class="total-row">
            <td>Total Amount Due - GBP</td>
            <td class="amount-column">555.08</td>
        </tr>
    </table>

    <div class="billing-footer">
        XYZ Company Ltd<br>
        2218 Street<br>
        TOWN<br>
        CITY<br>
        COUNTRY
    </div>
</body>
</html>
    `;
};

module.exports = {
    exampleTemplate
};