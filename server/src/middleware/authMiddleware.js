import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { STATUS_CODES } from '../utils/statusCodes.js';
import { AUTH_COOKIES, MESSAGES } from '../utils/constants.js';

export const protect = async (req, res, next) => {
  const token = req.cookies?.[AUTH_COOKIES.ACCESS_TOKEN];

  if (!token) {
    res.status(STATUS_CODES.UNAUTHORIZED);
    throw new Error(MESSAGES.ERROR.UNAUTHORIZED);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
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
        : MESSAGES.ERROR.ACCOUNT_SUSPENDED
    );
  }

  // Enforce session revocation and single-family token rotation
  if (
    decoded.tokenVersion !== undefined &&
    req.user.tokenVersion !== undefined &&
    decoded.tokenVersion !== req.user.tokenVersion
  ) {
    res.status(STATUS_CODES.UNAUTHORIZED);
    throw new Error(MESSAGES.ERROR.SESSION_INVALIDATED);
  }

  next();
};