// models/Contact.js

const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true, // Assuming phone number must be unique
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v); // Validates that phone is 10 digits
      },
      message: props => `${props.value} is not a valid phone number!`
    },
  },
  email: {
    type: String,
    required: true,
    unique: true, // Assuming email must be unique
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\S+@\S+\.\S+$/.test(v); // Validates email format
      },
      message: props => `${props.value} is not a valid email address!`
    },
  },
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
