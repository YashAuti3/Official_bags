const jwt = require('jsonwebtoken');
const constants = require('../config/constants');

const toMilliseconds = (value, fallback) => {
  if (!value || typeof value !== 'string') return fallback;

  const match = value.trim().match(/^(\d+)([smhd])$/i);
  if (!match) return fallback;

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * multipliers[unit];
};

// ======================
// Generate Access Token (Short-lived)
// ======================
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: constants.JWT.ACCESS_EXPIRES_IN } // 15m
  );
};

// ======================
// Generate Refresh Token (Long-lived)
// ======================
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: constants.JWT.REFRESH_EXPIRES_IN } // 7d
  );
};

// ======================
// Set Both Tokens in Cookies
// ======================
const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const accessMaxAge = toMilliseconds(constants.JWT.ACCESS_EXPIRES_IN, 15 * 60 * 1000);
  const refreshMaxAge = toMilliseconds(constants.JWT.REFRESH_EXPIRES_IN, 7 * 24 * 60 * 60 * 1000);

  // Access Token Cookie
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: accessMaxAge,
  });

  // Refresh Token Cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: refreshMaxAge,
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  setTokenCookies,
};
