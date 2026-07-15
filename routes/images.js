import express from 'express';
import multer from 'multer';
import * as imageController from '../controllers/imageController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

router.post('/upload', authMiddleware, upload.single('image'), imageController.uploadImage);
router.get('/', imageController.getImages);
router.delete('/:id', authMiddleware, imageController.deleteImage);

export default router;
