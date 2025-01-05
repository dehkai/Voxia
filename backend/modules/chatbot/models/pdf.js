const mongoose = require('mongoose');

const PdfMetadataSchema = new mongoose.Schema({
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'fs.files' },
    username: { type: String, required: true },
    email: { type: String },
    department: { type: String },
    employeeId: { type: String },
    phoneNum: { type: String },
    flightDetails: {
        airLineName: String,
        origin: String,
        destination: String,
        departureDate: String,
        returnDate: String,
        tripType: String,
        cabinClass: String,
        flightCode: String,
        flightPrice: String,
    },
    hotelDetails: {
        hotelName: String,
        city: String,
        check_in_date: String,
        check_out_date: String,
        hotelRating: String,
        roomCategory: String,
        hotelPrice: String,
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PdfMetadata', PdfMetadataSchema);
