const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile,
    changePassword,
    getAllUsers,
    deleteUser,
    deleteAccount,
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// User
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/delete-account', protect, deleteAccount);

// Admin
router.get('/', protect, adminOnly, getAllUsers);
router.delete('/:id', protect, adminOnly, deleteUser);


module.exports = router;
