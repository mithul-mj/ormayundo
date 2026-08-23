import User from '../models/user.js';
import generateTokens from '../utils/generateTokens.js';
import jwt from 'jsonwebtoken';
import { STATUS_CODES } from '../utils/statusCodes.js';

import axios from 'axios';

// @desc    Auth user using Google Access Token
// @route   POST /api/auth/google
export const googleAuth = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    res.status(STATUS_CODES.BAD_REQUEST);
    throw new Error('No Google token provided');
  }

  try {
    let email;

    // Check if it is a JWT (ID Token from Web) or an Access Token (from Extension)
    if (token.startsWith('eyJ')) {
      // It's an ID Token (JWT) from @react-oauth/google
      const googleResponse = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
      email = googleResponse.data.email;
    } else {
      // It's an Access Token from chrome.identity
      const googleResponse = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
      email = googleResponse.data.email;
    }

    if (!email) {
      res.status(STATUS_CODES.BAD_REQUEST);
      throw new Error('Failed to get email from Google');
    }

    // 2. Find or create the user in our database
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user (no password required for OAuth users)
      user = await User.create({ email });
    }

    // 3. Generate our internal JWT for sessions
    generateTokens(res, user._id);
    
    res.status(STATUS_CODES.OK).json({
      _id: user._id,
      email: user.email,
      message: 'Google Login successful'
    });
  } catch (error) {
    console.error('Google Auth Error:', error.message);
    res.status(STATUS_CODES.UNAUTHORIZED);
    throw new Error('Invalid Google token');
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
    path: '/api/auth/refresh',
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
