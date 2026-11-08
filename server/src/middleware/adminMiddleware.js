import { STATUS_CODES } from '../utils/statusCodes.js';
import { USER_ROLES, MESSAGES } from '../utils/constants.js';

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === USER_ROLES.ADMIN) {
    return next();
  }

  res.status(STATUS_CODES.FORBIDDEN);
  throw new Error(MESSAGES.ERROR.ADMIN_REQUIRED);
};
