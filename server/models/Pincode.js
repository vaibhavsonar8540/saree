const mongoose = require('mongoose');

const pincodeSchema = new mongoose.Schema(
  {
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      unique: true,
      trim: true,
      length: 6,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    isServiceable: {
      type: Boolean,
      default: true,
    },
    customShippingCharge: {
      type: Number,
      default: null, // null means fallback to admin default shipping rules
    },
    estimatedDeliveryDays: {
      type: String,
      default: '3-5 Business Days',
    },
    codAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Pincode', pincodeSchema);
