const express = require('express');
const router = express.Router();

// Import all routes
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');
const userRoutes = require('./userRoutes');
// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
const settingsRoutes = require('./settingsRoutes');
router.use('/settings', settingsRoutes);


module.exports = router;
