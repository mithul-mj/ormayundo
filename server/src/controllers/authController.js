import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import generateTokens from '../utils/generateTokens.js';
import { STATUS_CODES } from '../utils/statusCodes.js';
import { MESSAGES, AUTH_COOKIES, USER_ROLES } from '../utils/constants.js';
import axios from 'axios';

// Authenticate via Google OAuth token (ID Token or Access Token)
export const googleAuth = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    res.status(STATUS_CODES.BAD_REQUEST);
    throw new Error(MESSAGES.ERROR.NO_GOOGLE_TOKEN);
  }

  try {
    let email;

    if (token.startsWith('eyJ')) {
      const googleResponse = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
      email = googleResponse.data.email;
    } else {
      const googleResponse = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
      email = googleResponse.data.email;
    }

    if (!email) {
      res.status(STATUS_CODES.BAD_REQUEST);
      throw new Error(MESSAGES.ERROR.GOOGLE_EMAIL_FAILED);
    }

    const cleanEmail = String(email).trim().toLowerCase();

    let user = await User.findOne({ email: cleanEmail });
    if (!user) {
      const userCount = await User.countDocuments();
      const designatedAdmin =
        process.env.ADMIN_EMAIL &&
        cleanEmail === process.env.ADMIN_EMAIL.trim().toLowerCase();
      const role = userCount === 0 || designatedAdmin ? 'admin' : 'user';
      user = await User.create({ email: cleanEmail, role });
    } else if (
      process.env.ADMIN_EMAIL &&
      cleanEmail === process.env.ADMIN_EMAIL.trim().toLowerCase() &&
      user.role !== 'admin'
    ) {
      user.role = 'admin';
      await user.save();
    }

    if (user.isBlocked) {
      res.status(STATUS_CODES.FORBIDDEN);
      throw new Error(
        user.blockedReason
          ? `Account suspended: ${user.blockedReason}`
          : 'Account suspended by administrator'
      );
    }

    generateTokens(res, user._id, user.tokenVersion || 0);

    res.status(STATUS_CODES.OK).json({
      _id: user._id,
      email: user.email,
      role: user.role || 'user',
      message: MESSAGES.SUCCESS.GOOGLE_LOGIN
    });
  } catch (error) {
    console.error('Google Auth Error:', error.message);
    res.status(STATUS_CODES.UNAUTHORIZED);
    throw new Error(MESSAGES.ERROR.INVALID_GOOGLE_TOKEN);
  }
};

// Authenticate Administrator via Email & Password (no Google OAuth required)
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      message: MESSAGES.ERROR.ADMIN_CREDENTIALS_REQUIRED
    });
  }

  const cleanEmail = String(email).trim().toLowerCase();

  try {
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        message: MESSAGES.ERROR.INVALID_ADMIN_CREDENTIALS
      });
    }

    if (user.role !== USER_ROLES.ADMIN) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        message: MESSAGES.ERROR.ADMIN_ROLE_RESTRICTED
      });
    }

    if (user.isBlocked) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        message: user.blockedReason
          ? `Account suspended: ${user.blockedReason}`
          : MESSAGES.ERROR.ACCOUNT_SUSPENDED
      });
    }

    if (!user.password) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        message: MESSAGES.ERROR.ADMIN_NOT_CONFIGURED
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        message: MESSAGES.ERROR.INVALID_ADMIN_CREDENTIALS
      });
    }

    generateTokens(res, user._id, user.tokenVersion || 0);

    res.status(STATUS_CODES.OK).json({
      _id: user._id,
      email: user.email,
      role: USER_ROLES.ADMIN,
      message: MESSAGES.SUCCESS.ADMIN_LOGIN
    });
  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// Log out user and clear auth cookies
export const logoutUser = async (req, res) => {
  res.cookie(AUTH_COOKIES.ACCESS_TOKEN, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    expires: new Date(0)
  });
  res.cookie(AUTH_COOKIES.REFRESH_TOKEN, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/api/auth/refresh',
    expires: new Date(0)
  });
  res.status(STATUS_CODES.OK).json({ message: MESSAGES.SUCCESS.LOGGED_OUT });
};

// Return lightweight profile of current user
export const getMe = async (req, res) => {
  res.status(STATUS_CODES.OK).json({
    _id: req.user._id,
    email: req.user.email,
    role: req.user.role || 'user',
    isBlocked: req.user.isBlocked || false,
    currentStreak: req.user.currentStreak || 0,
    maxStreak: req.user.maxStreak || 0
  });
};

// Persist FCM device token for push notifications (multi-device support)
export const saveFcmToken = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'Token required' });
  }

  req.user.fcmToken = token;
  if (!req.user.fcmTokens) req.user.fcmTokens = [];
  if (!req.user.fcmTokens.includes(token)) {
    req.user.fcmTokens.push(token);
  }
  await req.user.save();

  res.status(STATUS_CODES.OK).json({ message: MESSAGES.SUCCESS.FCM_TOKEN_SAVED });
};

// Refresh access token via refresh token with rotation
export const refreshUserToken = async (req, res) => {
  const refreshToken = req.cookies[AUTH_COOKIES.REFRESH_TOKEN];

  if (!refreshToken) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.ERROR.UNAUTHORIZED });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.ERROR.UNAUTHORIZED });
    }

    if (user.isBlocked) {
      return res.status(STATUS_CODES.FORBIDDEN).json({
        message: user.blockedReason
          ? `Account suspended: ${user.blockedReason}`
          : 'Account suspended by administrator'
      });
    }

    // Enforce session revocation and single-family token rotation
    if (
      decoded.tokenVersion !== undefined &&
      user.tokenVersion !== undefined &&
      decoded.tokenVersion !== user.tokenVersion
    ) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        message: 'Session invalidated. Please log in again.'
      });
    }

    // Issue brand-new access token and refresh token (Token Rotation)
    generateTokens(res, user._id, user.tokenVersion || 0);
    res.status(STATUS_CODES.OK).json({ message: 'Token refreshed' });
  } catch (error) {
    res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.ERROR.UNAUTHORIZED });
  }
};
