const express = require('express');
const router = express.Router();

const {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  createFirstAdmin,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// ======================
// Public Routes
// ======================
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/refresh-token', refreshToken);
router.post('/create-first-admin', createFirstAdmin);

// ======================
// Protected Routes (Login Required)
// ======================
router.post('/logout', protect, logout);

module.exports = router;
