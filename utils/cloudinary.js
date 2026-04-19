const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
    cloud_name: (process.env.CLOUDINARY_NAME || '').trim(),
    api_key: (process.env.CLOUDINARY_KEY || '').trim(),
    api_secret: (process.env.CLOUDINARY_SECRET || '').trim(),
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };
