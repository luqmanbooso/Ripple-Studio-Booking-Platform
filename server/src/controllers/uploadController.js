const { uploadImage, isConfigured } = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const fs = require('fs');
const path = require('path');

const uploadSingleImage = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ApiError('No file uploaded', 400);
  }

  let result;
  
  if (isConfigured) {
    // Upload to Cloudinary
    result = await uploadImage(req.file.path);
    
    // Clean up local file
    fs.unlinkSync(req.file.path);
  } else {
    // Use local storage
    result = {
      url: `/uploads/${req.file.filename}`,
      publicId: req.file.filename
    };
  }

  res.json({
    status: 'success',
    data: result
  });
});

const uploadMultipleImages = catchAsync(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError('No files uploaded', 400);
  }

  const results = [];

  for (const file of req.files) {
    let result;
    
    if (isConfigured) {
      // Upload to Cloudinary
      result = await uploadImage(file.path);
      
      // Clean up local file
      fs.unlinkSync(file.path);
    } else {
      // Use local storage
      result = {
        url: `/uploads/${file.filename}`,
        publicId: file.filename
      };
    }
    
    results.push(result);
  }

  res.json({
    status: 'success',
    data: {
      images: results
    }
  });
});

module.exports = {
  uploadImage: uploadSingleImage,
  uploadImages: uploadMultipleImages
};
