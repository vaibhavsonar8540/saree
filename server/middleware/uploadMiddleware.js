const multer = require('multer');

// Configure Multer to use Memory Storage (Buffers)
const storage = multer.memoryStorage();

// File filter validation for images and videos
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith('image/') ||
    file.mimetype.startsWith('video/')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type! Only image and video files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max for high quality saree videos / images
  },
  fileFilter,
});

module.exports = upload;
