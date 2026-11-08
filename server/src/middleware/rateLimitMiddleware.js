import rateLimit from 'express-rate-limit';
import { STATUS_CODES } from '../utils/statusCodes.js';

// Guardrail: Auth endpoints brute-force defense
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per IP
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: STATUS_CODES.TOO_MANY_REQUESTS || 429,
  message: {
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  }
});

// Guardrail: AI Flashcard creation spam defense
export const recallCreationRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: STATUS_CODES.TOO_MANY_REQUESTS || 429,
  message: {
    message: 'Rate limit exceeded: You are creating flashcards too quickly. Please pause for a moment.'
  }
});

// Guardrail: General API protection
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: STATUS_CODES.TOO_MANY_REQUESTS || 429,
  message: {
    message: 'Too many requests from this IP. Please slow down.'
  }
});

