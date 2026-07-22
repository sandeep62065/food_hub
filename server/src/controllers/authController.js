const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const {
  generateAccessToken,
  generateRefreshToken,
  generatePasswordResetToken,
  sendRefreshCookie,
  clearRefreshCookie,
} = require('../utils/generateToken');
const { sendEmail, passwordResetEmail } = require('../utils/sendEmail');
const { generateReferralCode } = require('../utils/generateReferralCode');

// @desc   Register
// @route  POST /api/v1/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, referralCode } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered', 409));
    }

    // Prevent creating admin via API
    const allowedRoles = ['customer', 'owner', 'delivery_partner'];
    const userRole = allowedRoles.includes(role) ? role : 'customer';

    let referredBy = undefined;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.trim().toUpperCase() });
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    let newReferralCode = generateReferralCode(name);
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 5) {
      const codeExists = await User.findOne({ referralCode: newReferralCode });
      if (codeExists) {
        newReferralCode = generateReferralCode(name);
        attempts++;
      } else {
        isUnique = true;
      }
    }

    const user = await User.create({ 
      name, email, password, phone, role: userRole, 
      referredBy, referralCode: newReferralCode 
    });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    sendRefreshCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        accessToken,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Login
// @route  POST /api/v1/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Invalid email or password', 401));
    }

    if (user.isBanned) {
      return next(new AppError('Your account has been banned. Contact support.', 403));
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    sendRefreshCookie(res, refreshToken);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl, phone: user.phone },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Google Login
// @route  POST /api/v1/auth/google
const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.findOne({ email });
      if (user) {
        user.googleId = googleId;
        await user.save({ validateBeforeSave: false });
      } else {
        user = await User.create({
          authProvider: 'google',
          googleId,
          name,
          email,
          role: 'customer',
        });
      }
    }

    if (user.isBanned) {
      return next(new AppError('Your account has been banned. Contact support.', 403));
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    sendRefreshCookie(res, refreshToken);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl, phone: user.phone },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Logout
// @route  POST /api/v1/auth/logout
const logout = async (req, res, next) => {
  try {
    // Clear refresh token in DB
    await User.findByIdAndUpdate(req.user._id, { refreshToken: '' });
    clearRefreshCookie(res);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc   Refresh access token
// @route  POST /api/v1/auth/refresh
const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return next(new AppError('No refresh token. Please log in.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      clearRefreshCookie(res);
      return next(new AppError('Invalid refresh token. Please log in.', 401));
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    sendRefreshCookie(res, newRefreshToken);

    res.json({
      success: true,
      data: {
        accessToken,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
      },
    });
  } catch (error) {
    clearRefreshCookie(res);
    next(new AppError('Invalid or expired refresh token. Please log in.', 401));
  }
};

// @desc   Forgot password
// @route  POST /api/v1/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      // Don't reveal if email exists
      return res.json({ success: true, message: 'If that email is registered, you will receive a reset link.' });
    }

    const { resetToken, hashedToken } = generatePasswordResetToken();
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 min
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const emailContent = passwordResetEmail(user.name, resetUrl);

    try {
      await sendEmail({ to: user.email, ...emailContent });
    } catch (emailErr) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(new AppError('Failed to send reset email. Try again later.', 500));
    }

    res.json({ success: true, message: 'If that email is registered, you will receive a reset link.' });
  } catch (error) {
    next(error);
  }
};

// @desc   Reset password
// @route  POST /api/v1/auth/reset-password/:token
const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return next(new AppError('Reset token is invalid or has expired.', 400));
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = '';
    await user.save();

    clearRefreshCookie(res);
    res.json({ success: true, message: 'Password reset successful. Please log in.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, googleLogin, logout, refresh, forgotPassword, resetPassword };
