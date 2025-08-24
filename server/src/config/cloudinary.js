const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary
const isConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const uploadImage = async (filePath, options = {}) => {
  if (!isConfigured) {
    throw new Error('Cloudinary is not configured. Please set CLOUDINARY environment variables.');
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: options.folder || 'music-booking',
      transformation: options.transformation || [
        { quality: 'auto', fetch_format: 'auto' }
      ],
      ...options
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

const deleteImage = async (publicId) => {
  if (!isConfigured) {
    throw new Error('Cloudinary is not configured. Please set CLOUDINARY environment variables.');
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

module.exports = {
  uploadImage,
  deleteImage,
  isConfigured
};
