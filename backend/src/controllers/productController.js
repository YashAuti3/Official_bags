const Product = require('../models/productModel');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const {
    asyncHandler,
    paginate,
    uploadImageToCloudinary,
    deleteFromCloudinary,
} = require('devil-backend-nodejs');
const { CATEGORIES, STATUS } = require('../config/constants');

// GET /api/products
exports.getProducts = asyncHandler(async (req, res) => {
    const { category, page, limit, sort = '-createdAt' } = req.query;

    const query = { isActive: true };
    if (category && category !== 'All') query.category = category;

    // ✅ Package ka paginate use kiya
    const result = await paginate(Product, query, { page, limit, sort });

    res.json(new ApiResponse(STATUS.OK, {
        ...result,
        categories: CATEGORIES,
    }));
});

// GET /api/products/:id
exports.getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw new ApiError(STATUS.NOT_FOUND, 'Product not found');
    res.json(new ApiResponse(STATUS.OK, { product }));
});

// POST /api/products  [Admin]
exports.createProduct = asyncHandler(async (req, res) => {
    const { title, description, price, category, colors, features } = req.body;

    if (!CATEGORIES.includes(category)) {
        throw new ApiError(STATUS.BAD_REQUEST, `Invalid category. Allowed: ${CATEGORIES.join(', ')}`);
    }

    let images = [];
    let publicIds = [];

    if (req.files && req.files.length > 0) {
        const uploaded = await Promise.all(
            req.files.map(file =>
                uploadImageToCloudinary(file.buffer, file.originalname, file.mimetype, 'webbags/products')
            )
        );
        images = uploaded.map(u => u.url);
        publicIds = uploaded.map(u => u.publicId);
    }

    const product = await Product.create({
        title, description, price, category,
        image: images[0] || '',
        images,
        publicIds,
        colors: colors ? JSON.parse(colors) : [],
        features: features ? JSON.parse(features) : [],
    });

    res.status(STATUS.CREATED).json(new ApiResponse(STATUS.CREATED, { message: 'Product created', product }));
});

// PUT /api/products/:id  [Admin]
exports.updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) throw new ApiError(STATUS.NOT_FOUND, 'Product not found');

    if (req.files && req.files.length > 0) {
        if (product.publicIds?.length > 0) {
            await Promise.all(product.publicIds.map(pid => deleteFromCloudinary(pid, 'image')));
        }
        const uploaded = await Promise.all(
            req.files.map(file =>
                uploadImageToCloudinary(file.buffer, file.originalname, file.mimetype, 'webbags/products')
            )
        );
        req.body.images = uploaded.map(u => u.url);
        req.body.image = uploaded[0].url;
        req.body.publicIds = uploaded.map(u => u.publicId);
    }

    if (typeof req.body.colors === 'string') {
        req.body.colors = req.body.colors ? JSON.parse(req.body.colors) : [];
    }
    if (typeof req.body.features === 'string') {
        req.body.features = req.body.features ? JSON.parse(req.body.features) : [];
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(new ApiResponse(STATUS.OK, { message: 'Product updated', product: updated }));
});

// DELETE /api/products/:id  [Admin]
exports.deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) throw new ApiError(STATUS.NOT_FOUND, 'Product not found');

    if (product.publicIds?.length > 0) {
        await Promise.all(product.publicIds.map(pid => deleteFromCloudinary(pid, 'image')));
    }
    res.json(new ApiResponse(STATUS.OK, 'Product deleted successfully'));
});
