import { STATUS_CODES } from '../utils/statusCodes.js';

export const errorHandler = (err, req, res, next) => {
  // If the error was thrown but status is still 200, force it to 500
  const statusCode = res.statusCode === STATUS_CODES.OK ? STATUS_CODES.INTERNAL_SERVER_ERROR : res.statusCode;
  
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
