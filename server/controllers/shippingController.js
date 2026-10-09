const ShippingSettings = require('../models/ShippingSettings');
const Pincode = require('../models/Pincode');

// @desc    Get shipping settings (Public / Admin)
// @route   GET /api/shipping/settings
// @access  Public
const getShippingSettings = async (req, res) => {
  try {
    const settings = await ShippingSettings.getSettings();
    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shipping settings',
      error: error.message,
    });
  }
};

// @desc    Update shipping settings (Admin only)
// @route   PUT /api/shipping/settings
// @access  Private (Admin)
const updateShippingSettings = async (req, res) => {
  try {
    const { minFreeShippingThreshold, flatShippingRate, isShippingActive } = req.body;

    let settings = await ShippingSettings.findOne();
    if (!settings) {
      settings = new ShippingSettings({});
    }

    if (minFreeShippingThreshold !== undefined) {
      settings.minFreeShippingThreshold = Math.max(0, Number(minFreeShippingThreshold));
    }
    if (flatShippingRate !== undefined) {
      settings.flatShippingRate = Math.max(0, Number(flatShippingRate));
    }
    if (isShippingActive !== undefined) {
      settings.isShippingActive = Boolean(isShippingActive);
    }

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Shipping settings updated successfully',
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update shipping settings',
      error: error.message,
    });
  }
};

// @desc    Check pincode serviceability
// @route   GET /api/shipping/check-pincode/:pincode
// @access  Public
const checkPincode = async (req, res) => {
  try {
    const { pincode } = req.params;

    if (!pincode || pincode.trim().length !== 6 || !/^[1-9][0-9]{5}$/.test(pincode.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 6-digit Indian pincode not starting with 0',
      });
    }

    const cleanPincode = pincode.trim();
    const settings = await ShippingSettings.getSettings();
    const found = await Pincode.findOne({ pincode: cleanPincode });

    if (found) {
      return res.status(200).json({
        success: true,
        data: {
          pincode: found.pincode,
          serviceable: found.isServiceable,
          city: found.city,
          state: found.state,
          shipping_charge: found.customShippingCharge !== null ? found.customShippingCharge : settings.flatShippingRate,
          estimated_delivery_days: found.estimatedDeliveryDays || '3-5 Business Days',
          cod_available: found.codAvailable !== false,
        },
      });
    }

    // Default fallback serviceability response for standard 6-digit pincodes
    res.status(200).json({
      success: true,
      data: {
        pincode: cleanPincode,
        serviceable: true,
        city: 'Verified Location',
        state: 'India',
        shipping_charge: settings.flatShippingRate,
        estimated_delivery_days: '3-5 Business Days',
        cod_available: true,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify pincode serviceability',
      error: error.message,
    });
  }
};

// @desc    Add / Update pincode entry (Admin)
// @route   POST /api/shipping/pincode
// @access  Private (Admin)
const upsertPincode = async (req, res) => {
  try {
    const { pincode, city, state, isServiceable, customShippingCharge, estimatedDeliveryDays, codAvailable } = req.body;

    if (!pincode || pincode.trim().length !== 6) {
      return res.status(400).json({ success: false, message: 'Valid 6-digit pincode required' });
    }

    const cleanPincode = pincode.trim();
    let pincodeEntry = await Pincode.findOne({ pincode: cleanPincode });

    if (pincodeEntry) {
      if (city) pincodeEntry.city = city;
      if (state) pincodeEntry.state = state;
      if (isServiceable !== undefined) pincodeEntry.isServiceable = isServiceable;
      if (customShippingCharge !== undefined) pincodeEntry.customShippingCharge = customShippingCharge;
      if (estimatedDeliveryDays) pincodeEntry.estimatedDeliveryDays = estimatedDeliveryDays;
      if (codAvailable !== undefined) pincodeEntry.codAvailable = codAvailable;
      await pincodeEntry.save();
    } else {
      pincodeEntry = await Pincode.create({
        pincode: cleanPincode,
        city: city || 'Standard City',
        state: state || 'Standard State',
        isServiceable: isServiceable !== undefined ? isServiceable : true,
        customShippingCharge: customShippingCharge || null,
        estimatedDeliveryDays: estimatedDeliveryDays || '3-5 Business Days',
        codAvailable: codAvailable !== undefined ? codAvailable : true,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Pincode updated successfully',
      data: pincodeEntry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update pincode',
      error: error.message,
    });
  }
};

module.exports = {
  getShippingSettings,
  updateShippingSettings,
  checkPincode,
  upsertPincode,
};
