const User = require('../models/userModel');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { asyncHandler } = require('devil-backend-nodejs');
const { STATUS } = require('../config/constants');

// GET /api/users/profile
exports.getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) throw new ApiError(404, 'User not found');

    res.json(new ApiResponse(STATUS.OK, { user }));
});

// PUT /api/users/profile
exports.updateProfile = asyncHandler(async (req, res) => {
    const { name, phone, address } = req.body;

    // Drop the existing address field first to prevent MongoServerError 
    // when converting from a legacy string to the new object schema
    await User.updateOne({ _id: req.user._id }, { $unset: { address: 1 } });

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { name, phone, address },
        { new: true, runValidators: true }
    ).select('-password');

    res.json(new ApiResponse(STATUS.OK, { message: 'Profile updated', user }));
});

// PUT /api/users/change-password
exports.changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) throw new ApiError(STATUS.BAD_REQUEST, 'Current password is incorrect');

    user.password = newPassword;
    await user.save();

    res.json(new ApiResponse(STATUS.OK, 'Password changed successfully'));
});

// GET /api/users  [Admin]
exports.getAllUsers = asyncHandler(async (req, res) => {
    const { page, limit, search } = req.query;

    const query = {};
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    const { paginate } = require('devil-backend-nodejs');
    const result = await paginate(User, query, {
        page,
        limit,
        sort: '-createdAt',
        select: '-password'
    });

    res.json(new ApiResponse(STATUS.OK, result));
});

// DELETE /api/users/:id  [Admin]
exports.deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) throw new ApiError(STATUS.NOT_FOUND, 'User not found');
    res.json(new ApiResponse(STATUS.OK, 'User deleted successfully'));
});

// DELETE /api/users/profile  [Self delete]
exports.deleteAccount = asyncHandler(async (req, res) => {
    const { password } = req.body;
    if (!password) throw new ApiError(STATUS.BAD_REQUEST, 'Password is required');
    const user = await User.findById(req.user._id).select('+password');
    if (!user) throw new ApiError(STATUS.NOT_FOUND, 'User not found');

    // Password confirm karo
    const isMatch = await user.matchPassword(password);
    if (!isMatch) throw new ApiError(STATUS.BAD_REQUEST, 'Incorrect password');
    await user.deleteOne();
    res.json(new ApiResponse(STATUS.OK, 'Account deleted successfully'));
});
