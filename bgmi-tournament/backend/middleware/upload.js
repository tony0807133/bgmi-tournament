const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const isScreenshot = req.path.includes('screenshot');
    return {
      folder: isScreenshot ? 'bgmi/screenshots' : 'bgmi/banners',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: isScreenshot
        ? [{ width: 1280, crop: 'limit' }]
        : [{ width: 800, crop: 'limit' }]
    };
  }
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'), false);
  }
  cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});
