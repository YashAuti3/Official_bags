const crypto = require('crypto');
const User = require('../models/userModel');
const { asyncHandler } = require('devil-backend-nodejs');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { generateAccessToken, generateRefreshToken, setTokenCookies } = require('../utils/generateToken');
const constants = require('../config/constants');
const { sendBrevo } = require('devil-backend-nodejs');


// ======================
// @route   POST /api/auth/register
// @access  Public
// ======================
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ApiError(409, 'Email already registered');

  // Security: Role is never taken from req.body during public registration
  const user = await User.create({ name, email, password, role: constants.ROLES.USER, phone });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Save refreshToken in DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setTokenCookies(res, accessToken, refreshToken);

  res.status(constants.STATUS.CREATED).json(
    new ApiResponse(constants.STATUS.CREATED, {
      message: 'Registration successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isVerified: user.isVerified,
      },
      accessToken,
    })
  );
});

// ======================
// @route   POST /api/auth/login
// @access  Public
// ======================
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  setTokenCookies(res, accessToken, refreshToken);

  res.status(constants.STATUS.OK).json(
    new ApiResponse(constants.STATUS.OK, {
      message: 'Login successful',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      accessToken,
    })
  );
});

// ======================
// @route   POST /api/auth/logout
// @access  Private
// ======================
exports.logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(constants.STATUS.OK).json(
    new ApiResponse(constants.STATUS.OK, { message: 'Logged out successfully' })
  );
});


// ======================
// @route   POST /api/auth/refresh-token
// @access  Public
// ======================
exports.refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, 'No refresh token provided');

  const user = await User.findOne({ refreshToken: token }).select('+refreshToken');
  if (!user) throw new ApiError(401, 'Invalid refresh token');

  const accessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  user.refreshToken = newRefreshToken;
  await user.save({ validateBeforeSave: false });

  setTokenCookies(res, accessToken, newRefreshToken);

  res.status(constants.STATUS.OK).json(
    new ApiResponse(constants.STATUS.OK, {
      message: 'Token refreshed successfully',
      accessToken,
    })
  );
});


// POST /api/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
  let { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'No user found with this email');

  // 1) Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + constants.PASSWORD.RESET_TOKEN_EXPIRES;
  await user.save({ validateBeforeSave: false });

  // 2) Frontend reset URL
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  // 3) Email content (HTML only, text optional nahi hai tumhare helper me)
  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 8px;">Reset your WebBags password</h2>
      <p style="font-size: 14px; color: #444; margin-bottom: 16px;">
        Hi ${user.name || 'there'},
      </p>
      <p style="font-size: 14px; color: #444; margin-bottom: 16px;">
        We received a request to reset the password for your WebBags account.
      </p>
      <p style="font-size: 14px; color: #444; margin-bottom: 24px;">
        Click the button below to set a new password. This link will expire in
        ${constants.PASSWORD.RESET_TOKEN_EXPIRES / (60 * 60 * 1000)} hours.
      </p>
      <p style="margin: 0 0 24px;">
        <a href="${resetUrl}"
           style="background:#000000;color:#ffffff;padding:10px 22px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;">
          Reset Password
        </a>
      </p>
      <p style="font-size: 12px; color: #666; margin-bottom: 8px;">
        If the button does not work, copy and paste this link into your browser:
      </p>
      <p style="font-size: 12px; color: #111; word-break: break-all;">
        <a href="${resetUrl}" style="color:#000000;">${resetUrl}</a>
      </p>
      <p style="font-size: 12px; color: #888; margin-top: 24px;">
        If you did not request a password reset, you can safely ignore this email.
      </p>
    </div>
  `;

  // 4) Send email via your helper
  await sendBrevo(
    user.email,
    'Reset your WebBags password',
    html,
  );

  // 5) Response
  res.status(constants.STATUS.OK).json(
    new ApiResponse(constants.STATUS.OK, {
      message: 'Password reset link has been sent to your email',
    })
  );
});


// ======================
// @route   POST /api/auth/reset-password/:token
// @access  Public
// ======================
exports.resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) throw new ApiError(400, 'Invalid or expired reset token');

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(constants.STATUS.OK).json(
    new ApiResponse(constants.STATUS.OK, { message: 'Password reset successful' })
  );
});

// ======================
// @route   POST /api/auth/create-first-admin
// @access  Public (One-time only)
// ======================
exports.createFirstAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Check if any admin already exists
  const adminExists = await User.findOne({ role: constants.ROLES.ADMIN });
  if (adminExists) throw new ApiError(403, 'Initial administrative setup is already completed');

  // 2. Check if email already used
  const emailTaken = await User.findOne({ email });
  if (emailTaken) throw new ApiError(409, 'Email already associated with an account');

  // 3. Create First Admin
  const admin = await User.create({
    name,
    email,
    password,
    role: constants.ROLES.ADMIN,
    isVerified: true
  });

  res.status(constants.STATUS.CREATED).json(
    new ApiResponse(constants.STATUS.CREATED, {
      message: 'Initial Administrative Account Created Successfully',
      user: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    })
  );
});
