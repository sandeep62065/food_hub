const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateAccessToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
};

const generatePasswordResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  return { resetToken, hashedToken };
};

// Set refresh token in httpOnly cookie
const sendRefreshCookie = (res, token) => {
  const isCrossDomain = process.env.FRONTEND_URL && !process.env.FRONTEND_URL.includes('localhost');
  const isProd = process.env.NODE_ENV === 'production' || isCrossDomain;
  
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };
  res.cookie('refreshToken', token, cookieOptions);
};

const clearRefreshCookie = (res) => {
  const isCrossDomain = process.env.FRONTEND_URL && !process.env.FRONTEND_URL.includes('localhost');
  const isProd = process.env.NODE_ENV === 'production' || isCrossDomain;
  
  res.clearCookie('refreshToken', { 
    path: '/', 
    httpOnly: true, 
    secure: isProd, 
    sameSite: isProd ? 'none' : 'lax' 
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generatePasswordResetToken,
  sendRefreshCookie,
  clearRefreshCookie,
};
