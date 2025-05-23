const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["admin", "employee", "supervisor"],
        default: "employee",
    },
    token: {
        type: String, // Add a token field
    },
    gender: {
      type: String,
    //   enum: ['Male', 'Female'],
      default: 'Male',
    },
    jobTitle: {
      type: String,
    //   enum: ['Sales Executive', 'PR Specialist', 'Executive Assistant', 'Marketing Specialist', 'HR Manager', 'IT Specialist', 'Customer Service Specialist','Marketing Lead','Admin'],
      default: 'Sales Executive',
    },
    preferences: {
        cabinClass: {
            type: String,
            // enum: ['Economy', 'Business', 'First Class'],
            default: "Economy",
        },
        hotelRating: {
            type: Number,
            min: 1,
            max: 5,
            default: 3,
        },
    },
    createdAt: {
        type: Date,
        default: () => new Date(Date.now() + 8 * 60 * 60 * 1000),
    },
    updatedAt: {
        type: Date,
        default: () => new Date(Date.now() + 8 * 60 * 60 * 1000),
    },
    resetPasswordToken: { 
        type: String 
    },
    resetPasswordExpires: { 
        type: Date 
    },
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    this.updatedAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
    next();
});

module.exports = mongoose.model("User", userSchema);
