const mongoose = require('mongoose');

const PdfMetadataSchema = new mongoose.Schema({
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'fs.files' }, // Reference to the GridFS file
    username: { type: String, required: true }, // Metadata field
    createdAt: { type: Date, default: Date.now }, // Timestamp
});

module.exports = mongoose.model('PdfMetadata', PdfMetadataSchema);
