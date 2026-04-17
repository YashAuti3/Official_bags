const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
    name: { type: String },
    hex: { type: String },
    image: { type: String },
}, { _id: false });

const { CATEGORIES } = require('../config/constants');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
    images: [{ type: String }],
    category: { type: String, enum: CATEGORIES, required: true },
    colors: [colorSchema],
    features: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    slug: { type: String, unique: true },
    isActive: { type: Boolean, default: true },// Ye field add karo schema mein
    publicId: { type: String, default: '' }, // cloudinary public id
    publicIds: [{ type: String }], // for multiple images

}, { timestamps: true });

// ── Pre-save: auto slug from title ──
productSchema.pre('save', function (next) {
    if (this.isModified('title')) {
        this.slug = this.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    }
    next();
});

// ── Static: category se products ──
productSchema.statics.findByCategory = function (category) {
    return this.find({ category, isActive: true });
};

// ── Static: search ──
productSchema.statics.search = function (query) {
    return this.find({
        isActive: true,
        title: { $regex: query, $options: 'i' },
    });
};

// ── Static: categories list ──
productSchema.statics.getCategories = function () {
    return CATEGORIES;
};

module.exports = mongoose.model('Product', productSchema);
module.exports.CATEGORIES = CATEGORIES;
