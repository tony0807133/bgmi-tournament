const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  // Use random hex name — never trust original filename (path traversal prevention)
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const rand = crypto.randomBytes(16).toString('hex');
    cb(null, `${Date.now()}-${rand}${ext}`);
  }
});

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const ALLOWED_EXTS  = ['.jpg', '.jpeg', '.png', '.webp'];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_MIMES.includes(file.mimetype) && ALLOWED_EXTS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, or WebP images are allowed'));
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});
