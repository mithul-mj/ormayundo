import { STATUS_CODES } from '../utils/statusCodes.js';
import { logAndNotifyIncident } from '../services/alertService.js';

export const errorHandler = (err, req, res, next) => {
  // If the error was thrown but status is still 200, force it to 500
  const statusCode = res.statusCode === STATUS_CODES.OK ? STATUS_CODES.INTERNAL_SERVER_ERROR : res.statusCode;

  if (statusCode >= 500) {
    logAndNotifyIncident({
      type: 'SERVER_ERROR',
      severity: 'critical',
      message: `${req.method} ${req.originalUrl}: ${err.message}`,
      details: {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        stack: err.stack
      },
      userId: req.user?._id || null
    }).catch(() => {});
  }

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
