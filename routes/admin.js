const express = require('express');
const {
    flagFile,
    reviewFile

} = require('../controllers/admin');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.put('/flag', protect, authorize('admin'), flagFile);
router.delete('/review', protect, authorize('admin'), reviewFile);



module.exports = router