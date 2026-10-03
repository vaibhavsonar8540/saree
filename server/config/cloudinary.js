const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dozvoexi7',
  api_key: process.env.CLOUDINARY_API_KEY || '397735858263262',
  api_secret: process.env.CLOUDINARY_API_SECRET || '72gY3jiP6QIdQnb5vH8ggFElbW0',
});

/**
 * Upload buffer or base64 / URL to Cloudinary
 * @param {Buffer|String} fileSource - Buffer from Multer or Base64/URL string
 * @param {Object} options - Folder and resource_type options
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = (fileSource, options = {}) => {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      folder: 'saree_store',
      resource_type: options.resource_type || 'auto',
      ...options,
    };

    // If fileSource is Buffer (from multer memoryStorage)
    if (Buffer.isBuffer(fileSource)) {
      const uploadStream = cloudinary.uploader.upload_stream(
        defaultOptions,
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(fileSource);
    }
    // If fileSource is Base64 data URI or remote/local file path URL
    else if (typeof fileSource === 'string') {
      cloudinary.uploader.upload(fileSource, defaultOptions, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });
    } else {
      reject(new Error('Invalid file source format for Cloudinary upload'));
    }
  });
};

/**
 * Delete a file from Cloudinary by public_id
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
};
