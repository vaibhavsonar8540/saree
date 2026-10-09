const mongoose = require('mongoose');

const shippingSettingsSchema = new mongoose.Schema(
  {
    minFreeShippingThreshold: {
      type: Number,
      default: 999, // Orders above 999 get free shipping
      min: [0, 'Threshold cannot be negative'],
    },
    flatShippingRate: {
      type: Number,
      default: 199, // Orders below 999 get 199 rs shipping charge
      min: [0, 'Shipping rate cannot be negative'],
    },
    isShippingActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure single settings document pattern
shippingSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      minFreeShippingThreshold: 999,
      flatShippingRate: 199,
      isShippingActive: true,
    });
  }
  return settings;
};

module.exports = mongoose.model('ShippingSettings', shippingSettingsSchema);
