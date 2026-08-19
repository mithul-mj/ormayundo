import User from '../models/user.js';
import generateTokens from '../utils/generateTokens.js';
import jwt from 'jsonwebtoken';
import { STATUS_CODES } from '../utils/statusCodes.js';

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  const { email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(STATUS_CODES.BAD_REQUEST);
    throw new Error('User already exists');
  }

  const user = await User.create({ email, password });

  generateTokens(res, user._id);
  
  res.status(STATUS_CODES.CREATED).json({
    _id: user._id,
    email: user.email,
    message: 'Registration successful'
  });
};

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // We explicitly select +password because it is hidden by default in the schema
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    generateTokens(res, user._id);
    
    res.status(STATUS_CODES.OK).json({
      _id: user._id,
      email: user.email,
      message: 'Login successful'
    });
  } else {
    res.status(STATUS_CODES.UNAUTHORIZED);
    throw new Error('Invalid email or password');
  }
};

// @desc    Logout user / clear cookies
// @route   POST /api/auth/logout
export const logoutUser = async (req, res) => {
  res.cookie('accessToken', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(STATUS_CODES.OK).json({ message: 'Logged out successfully' });
};

// @desc    Save FCM Token
// @route   POST /api/auth/fcm-token
export const saveFcmToken = async (req, res) => {
  const { token } = req.body;

  req.user.fcmToken = token;
  await req.user.save();

  res.status(STATUS_CODES.OK).json({ message: 'FCM Token saved successfully' });
};

// @desc    Refresh the access token
// @route   POST /api/auth/refresh
export const refreshUserToken = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    res.status(STATUS_CODES.UNAUTHORIZED);
    throw new Error('Not authorized, no refresh token');
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    generateTokens(res, decoded.userId);

    res.status(STATUS_CODES.OK).json({ message: 'Token refreshed successfully' });
  } catch (error) {
    res.status(STATUS_CODES.UNAUTHORIZED);
    throw new Error('Refresh token failed or expired');
  }
};
