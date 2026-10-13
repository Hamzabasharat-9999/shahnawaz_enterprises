import { Router } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { protect } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { getMediaStatus, uploadImages } from '../controllers/mediaController.js';

const router = Router();
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 8, fields: 5 },
  fileFilter: (req, file, cb) => {
    if (!allowedTypes.has(file.mimetype)) {
      const error = new Error('Only JPEG, PNG, WebP, and AVIF image files are allowed.');
      error.statusCode = 415;
      return cb(error);
    }
    cb(null, true);
  }
});
const uploadLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 40, standardHeaders: 'draft-8', legacyHeaders: false });

router.use(protect, requireAdmin);
router.get('/status', getMediaStatus);
router.post('/', uploadLimiter, (req, res, next) => {
  upload.array('images', 8)(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError) {
      const tooLarge = error.code === 'LIMIT_FILE_SIZE';
      return res.status(tooLarge ? 413 : 400).json({
        message: tooLarge ? 'Each image must be 8 MB or smaller.' : 'Choose up to 8 images per upload.'
      });
    }
    return res.status(error.statusCode || 400).json({ message: error.message || 'Invalid image upload.' });
  });
}, uploadImages);
export default router;
