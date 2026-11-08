import rateLimit from 'express-rate-limit';
import { STATUS_CODES } from '../utils/statusCodes.js';
import { RATE_LIMITS } from '../utils/constants.js';

// Auth endpoints rate limiter (applied specifically to login actions; skips successful requests so valid users are never locked out)
export const authRateLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH.WINDOW_MS,
  max: RATE_LIMITS.AUTH.MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: RATE_LIMITS.AUTH.SKIP_SUCCESSFUL,
  statusCode: STATUS_CODES.TOO_MANY_REQUESTS || 429,
  message: {
    message: 'Too many authentication attempts. Please try again in a few minutes.'
  }
});

// AI Flashcard creation spam defense (applied exclusively to flashcard generation mutations)
export const recallCreationRateLimiter = rateLimit({
  windowMs: RATE_LIMITS.RECALL_CREATION.WINDOW_MS,
  max: RATE_LIMITS.RECALL_CREATION.MAX,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: STATUS_CODES.TOO_MANY_REQUESTS || 429,
  message: {
    message: 'You are generating flashcards too quickly. Please pause for a moment.'
  }
});

// General API protection (relaxed to allow seamless page access, tab navigation, and admin telemetry)
export const generalRateLimiter = rateLimit({
  windowMs: RATE_LIMITS.PAGE_ACCESS.WINDOW_MS,
  max: RATE_LIMITS.PAGE_ACCESS.MAX,
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: STATUS_CODES.TOO_MANY_REQUESTS || 429,
  message: {
    message: 'High request volume detected from this network. Please slow down.'
  }
});
