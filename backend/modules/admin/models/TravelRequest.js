const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define schema for travel request
const TravelRequestSchema = new Schema({
  request_number: { type: String, required: true },  // Unique travel request number
  user_id: { type: Schema.Types.ObjectId, ref: 'User', default: null },  // Reference to user, can be null
  status: { type: String, required: true },  // Status of the request (e.g., 'pending', 'approved')
  type: { type: String, required: true },  // Type of travel (e.g., 'business', 'personal')
  purpose: { type: String, default: '' },  // Purpose of travel
  total_cost: { type: Number, required: true },  // Total cost of travel

  // Flight details (nested object)
  flight_details: {
    trip_type: { type: String, required: true },  // Single or return trip
    origin: {
      airport_code: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, default: '' }
    },
    destination: {
      airport_code: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, default: '' }
    },
    outbound_flight: {
      airline: { type: String, required: true },
      flight_number: { type: String, required: true },
      cabin_class: { type: String, required: true },
      departure_datetime: { type: Date, required: true },
      arrival_datetime: { type: Date, required: true },
      duration: { type: String, required: true },
      price: { type: Number, required: true }
    },
    layovers: [{  // Array of layovers (if any)
      type: Schema.Types.Mixed,  // This can be an object if there are specific fields for layovers
      default: []
    }]
  },

  // Hotel details (nested object)
  hotel_details: {
    city: { type: String, required: true },
    country: { type: String, default: '' },
    hotel_name: { type: String, required: true },
    room_type: { type: String, required: true },
    check_in: { type: Date, required: true },
    check_out: { type: Date, required: true },
    nights: { type: Number, required: true },
    price_per_night: { type: Number, required: true },
    total_price: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    amenities: [{ type: Schema.Types.Mixed, default: [] }]  // Array of amenities
  },

  // Approval details (nested object)
  approval: {
    status: { type: String, default: 'pending' }  // Approval status (e.g., 'pending', 'approved', 'rejected')
  },

  // Timestamps
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },

  // Additional fields (empty arrays)
  documents: [{ type: Schema.Types.Mixed, default: [] }],  // Array of document references
  notes: [{ type: Schema.Types.Mixed, default: [] }]  // Array of notes or comments
}, { collection: 'travel_requests', timestamps: true });  // Specify collection name and use timestamps

// Update 'updatedAt' on save
TravelRequestSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

// Create and export the TravelRequest model
const TravelRequest = mongoose.model('TravelRequest', TravelRequestSchema);

module.exports = TravelRequest;
