import { STATUS_CODES } from '../utils/statusCodes.js';

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  res.status(STATUS_CODES.FORBIDDEN);
  throw new Error('Access denied: Administrator privileges required');
};

