const multer = require('multer');
const ApiError = require('../utils/ApiError');

// Memory storage — buffer directly Cloudinary ko jayega
const storage = multer.memoryStorage();

// Allowed file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError(400, 'Only JPEG, JPG, PNG and WEBP images are allowed!'), false);
    }
};

// Max 5MB per file
module.exports = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});
