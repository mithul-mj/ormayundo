import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { STATUS_CODES } from '../utils/statusCodes.js';

export const protect = async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    res.status(STATUS_CODES.UNAUTHORIZED);
    throw new Error('Not authorized, no token');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    res.status(STATUS_CODES.UNAUTHORIZED);
    throw new Error('Not authorized, token failed');
  }

  req.user = await User.findById(decoded.userId).select('-password');

  if (!req.user) {
    res.status(STATUS_CODES.UNAUTHORIZED);
    throw new Error('User no longer exists');
  }

  // Reject blocked/suspended users immediately
  if (req.user.isBlocked) {
    res.status(STATUS_CODES.FORBIDDEN);
    throw new Error(
      req.user.blockedReason
        ? `Account suspended: ${req.user.blockedReason}`
        : 'Account suspended by administrator'
    );
  }

  // Enforce session revocation and single-family token rotation
  if (
    decoded.tokenVersion !== undefined &&
    req.user.tokenVersion !== undefined &&
    decoded.tokenVersion !== req.user.tokenVersion
  ) {
    res.status(STATUS_CODES.UNAUTHORIZED);
    throw new Error('Session invalidated or expired. Please log in again.');
  }

  next();
};