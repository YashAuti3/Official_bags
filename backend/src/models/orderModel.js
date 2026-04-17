const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    title: { type: String },
    image: { type: String },
    price: { type: Number },
    quantity: { type: Number, min: 1 },
    selectedColor: { type: String, default: '' },
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['Cart', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Cart' },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: "India" },
        phone: String
    },
    shiprocket: {
        shipment_id: String,
        awb_code: String,
        tracking_url: String
    },
    paymentId: { type: String, default: '' },
    razorpayOrderId: { type: String, default: '' },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
}, { timestamps: true });

// ── Static: user ke orders ──
orderSchema.statics.findByUser = function (userId) {
    return this.find({ user: userId }).sort('-createdAt');
};

// ── Static: status se filter ──
orderSchema.statics.findByStatus = function (status) {
    return this.find({ status }).populate('user', 'name email').sort('-createdAt');
};

// ── Method: order cancel ──
orderSchema.methods.cancel = function () {
    if (this.status === 'Delivered') {
        throw new Error('Delivered order cannot be cancelled');
    }
    this.status = 'Cancelled';
    return this.save();
};

module.exports = mongoose.model('Order', orderSchema);
