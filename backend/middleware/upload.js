/* ============================================================
   File Upload Middleware — Multer + Cloudinary stream upload
   ============================================================ */
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

// Use memory storage (no temp files on disk)
const storage = multer.memoryStorage();

// Filter: accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpg, png, gif, webp)'), false);
  }
};

// Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

/**
 * Upload a buffer to Cloudinary using streams.
 * @param {Buffer} buffer - File buffer from multer
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<object>} Cloudinary upload result
 */
const uploadToCloudinary = (buffer, folder = 'agrimatch') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

module.exports = { upload, uploadToCloudinary };
