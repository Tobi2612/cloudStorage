const express = require('express');
const {
    uploadFile,
    downloadFile
} = require('../controllers/file');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/upload', protect, uploadFile);
router.get('/download', protect, downloadFile);


module.exports = router