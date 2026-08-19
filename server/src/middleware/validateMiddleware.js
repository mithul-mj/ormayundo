import { STATUS_CODES } from '../utils/statusCodes.js';

export const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync(req.body);
    next();
  } catch (error) {
    res.status(STATUS_CODES.BAD_REQUEST);
    // Extract the first Zod error message cleanly
    const message = error.errors ? error.errors[0].message : 'Validation failed';
    next(new Error(message));
  }
};
