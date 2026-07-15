import { v2 as cloudinary } from 'cloudinary';
import Image from '../models/Image.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '❌ No file provided' });
    }

    // Convert buffer to base64
    const base64 = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'aroma-cafe',
      resource_type: 'auto'
    });

    // Save to MongoDB
    const image = new Image({
      url: result.secure_url,
      publicId: result.public_id,
      uploadedBy: req.user.userId,
      fileName: req.file.originalname
    });

    await image.save();

    res.status(201).json({
      message: '✅ Image uploaded successfully',
      image: {
        url: image.url,
        id: image._id,
        fileName: image.fileName
      }
    });
  } catch (error) {
    res.status(500).json({ message: '❌ Upload failed', error: error.message });
  }
};

export const getImages = async (req, res) => {
  try {
    const images = await Image.find().sort({ uploadedAt: -1 });
    res.json({ images });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: '❌ Image not found' });
    }
    const isOwner = image.uploadedBy.toString() === req.user.userId;
    const isStaff = req.user.role === 'admin' || req.user.role === 'chef';
    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: '❌ You do not have permission to delete this image' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(image.publicId);

    // Delete from MongoDB
    await Image.findByIdAndDelete(req.params.id);

    res.json({ message: '✅ Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: '❌ Server error', error: error.message });
  }
};
