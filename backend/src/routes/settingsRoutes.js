const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    getEmailSettings,
    updateEmailSettings,
} = require('../controllers/settingsController');

const router = express.Router();

router.get('/email', protect, getEmailSettings);

router.put('/email', protect, updateEmailSettings);

module.exports = router;
