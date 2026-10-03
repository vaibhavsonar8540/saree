const mongoose = require('mongoose');

// Schema for color objects embedded directly inside Saree
const colorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: 'Original',
    },
    hexCode: {
      type: String,
      trim: true,
      default: '#1B5E3B',
    },
  },
  { _id: true }
);

// Schema for color-specific media (thumbnail, images array, video, colorName, and hexCode)
const colorMediaSchema = new mongoose.Schema(
  {
    colorName: {
      type: String,
      trim: true,
    },
    hexCode: {
      type: String,
      trim: true,
      default: '#1B5E3B',
    },
    colorId: {
      type: String,
      trim: true,
    },
    thumbnail: {
      type: String,
      trim: true,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    video: {
      type: String,
      trim: true,
    },
  },
  { _id: true }
);

const sareeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Saree name is required'],
      trim: true,
    },
    SKU: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      default: 'Saree',
      trim: true,
    },
    subCategory: {
      type: String,
      trim: true, // e.g. Banarasi, Silk, Cotton
    },
    sareeType: {
      type: String,
      trim: true, // e.g. Banarasi, Kanjivaram, Chanderi
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountedPrice: {
      type: Number,
      default: 0,
      min: [0, 'Discounted price cannot be negative'],
    },
    fabric: {
      type: String,
      trim: true, // Silk, Cotton, Georgette
    },
    pattern: {
      type: String,
      trim: true, // Floral, Printed, Embroidered
    },
    occasion: {
      type: String,
      trim: true, // Wedding, Party, Casual
    },
    workType: {
      type: String,
      trim: true, // Zari, Embroidery, Resham
    },
    borderType: {
      type: String,
      trim: true, // Heavy, Medium, Plain
    },
    sareeLength: {
      type: Number, // meters
    },
    sareeWidth: {
      type: Number, // meters
    },
    blousePiece: {
      type: Boolean,
      default: true,
    },
    blouseLength: {
      type: Number, // meters
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    salesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    favoriteCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    colors: [colorSchema], // Array of objects containing { name, hexCode } directly
    thumbnail: {
      type: String,
      trim: true, // Main overall thumbnail (Cloudinary URL)
    },
    video: {
      type: String,
      trim: true, // Main overall video (Cloudinary URL)
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    colorMedia: [colorMediaSchema], // Array of objects storing colorName, hexCode, thumbnail, images, and video
  },
  {
    timestamps: true,
  }
);

// Index for search & filter performance
sareeSchema.index({ name: 'text', description: 'text', SKU: 'text' });

module.exports = mongoose.model('Saree', sareeSchema);
