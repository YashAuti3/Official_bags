const express = require('express');
const router = express.Router();
const {
    createRazorpayOrder,
    verifyAndPlaceOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    getCart,
    addItemToCart,
    updateCartItem,
    removeItemFromCart,
    deleteOrder,
    exportOrders,
} = require('../controllers/orderController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// User Cart
router.get('/cart', protect, getCart);
router.post('/cart/add', protect, addItemToCart);
router.put('/cart/update', protect, updateCartItem);
router.post('/cart/remove', protect, removeItemFromCart);

// User
router.post('/create-razorpay-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyAndPlaceOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/export', protect, adminOnly, exportOrders);
router.get('/:id', protect, getOrderById);

// Admin
router.get('/', protect, adminOnly, getAllOrders);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);
router.delete('/:id', protect, adminOnly, deleteOrder);


module.exports = router;
