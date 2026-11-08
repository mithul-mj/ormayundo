export { STATUS_CODES } from './statusCodes.js';

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

// Queue & Job Names
export const QUEUE_NAMES = {
  AI_FLASHCARD_GENERATION: 'ai-flashcard-generation'
};

export const JOB_NAMES = {
  GENERATE_FLASHCARD: 'generate-flashcard'
};

// Spaced Repetition Parameters
export const SPACED_REPETITION = {
  MAX_INTERVAL_DAYS: 365,
  DEFAULT_EASINESS_FACTOR: 2.5,
  MIN_EASINESS_FACTOR: 1.3,
  HARD_GROWTH_FACTOR: 1.2,
  EASY_BONUS_FACTOR: 1.3,
  MASTERED_THRESHOLD_DAYS: 21,
  FORGOT_EF_PENALTY: 0.2,
  HARD_EF_PENALTY: 0.15,
  EASY_EF_BONUS: 0.15,
  GRADUATION_INTERVAL_DAYS: 4,
  RATINGS: {
    FORGOT: 'forgot',
    HARD: 'hard',
    GOOD: 'good',
    EASY: 'easy'
  }
};

// Deck Configurations
export const DECKS = {
  DEFAULT_NAME: 'General',
  DEFAULT_COLOR: '#FF9532',
  MAX_NAME_LENGTH: 40,
  COLOR_PALETTE: [
    '#FF9532', '#3B82F6', '#10B981', '#8B5CF6',
    '#EC4899', '#F59E0B', '#06B6D4', '#6366F1', '#14B8A6'
  ]
};

// Auth & Cookie Names
export const AUTH_COOKIES = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken'
};

// JWT & Session Lifetimes
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN_MS: 15 * 60 * 1000, // 15 minutes
  REFRESH_TOKEN_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
  ACCESS_TOKEN_JWT: '15m',
  REFRESH_TOKEN_JWT: '7d'
};

// Flashcard Statuses
export const CARD_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  DELETED: 'deleted'
};

// Incident Management
export const INCIDENT_SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

export const INCIDENT_STATUS = {
  UNRESOLVED: 'unresolved',
  RESOLVED: 'resolved'
};

// Default Fallback Admin Credentials (Used when environment variables are not provided)
export const DEFAULT_ADMIN_CREDENTIALS = {
  EMAIL: 'admin@ormayundo.com',
  PASSWORD: 'Admin@Ormayundo2026!'
};

// Rate Limiting Defaults (Relaxed for smooth page access & unhindered authentications)
export const RATE_LIMITS = {
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX: 200, // Generous allowance (skips successful attempts)
    SKIP_SUCCESSFUL: true
  },
  RECALL_CREATION: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX: 120 // 120 generations per minute
  },
  PAGE_ACCESS: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX: 3000 // 3000 requests per window for seamless page navigation & telemetry
  }
};

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

// System & Infrastructure Metrics
export const SYSTEM_METRICS = {
  PUSH_BATCH_SIZE: 10,
  BYTES_PER_KB: 1024,
  BYTES_PER_MB: 1024 * 1024,
  COST_DECIMALS: 4,
  LOG_COST_DECIMALS: 5
};

// Time Constants
export const TIME_CONSTANTS = {
  SECONDS_IN_MINUTE: 60,
  MINUTES_IN_HOUR: 60,
  HOURS_IN_DAY: 24
};

// AI Engine Constraints & Parameters
export const AI_CONSTANTS = {
  TIMEOUT_MS: 30000,
  TEXT_CLAMP_HEAD_CHARS: 2500,
  TEXT_CLAMP_TAIL_CHARS: 1500,
  DEFAULT_TOP_P: 1
};

// System Guardrail Defaults
export const SYSTEM_CONFIG_DEFAULTS = {
  GLOBAL_KEY: 'global_settings',
  AI_MODEL: 'openai/gpt-oss-120b',
  AI_FALLBACK_MODEL: 'llama-3.3-70b-versatile',
  AI_TEMPERATURE: 1.0,
  AI_MAX_TOKENS: 2048,
  DAILY_CARD_LIMIT: 30,
  MAX_TEXT_LENGTH: 4000
};

// Application Messages
export const MESSAGES = {
  SUCCESS: {
    FLASHCARD_QUEUED: 'Flashcard added to the AI Queue!',
    RECALL_DELETED: 'Recall item deleted successfully',
    ALL_RECALL_WIPED: 'All recall items wiped successfully',
    DECK_DELETED: 'Deck deleted successfully',
    GOOGLE_LOGIN: 'Google Login successful',
    ADMIN_LOGIN: 'Administrator login successful',
    ADMIN_SEEDED: 'Administrator account seeded successfully',
    USER_BLOCKED: 'User blocked successfully',
    USER_UNBLOCKED: 'User unblocked successfully',
    GUARDRAILS_UPDATED: 'Platform configuration updated successfully',
    INCIDENT_RESOLVED: 'Incident marked as resolved',
    NOTIFICATION_BROADCAST: 'Broadcast notification sent successfully',
    LOGGED_OUT: 'Logged out successfully',
    FCM_TOKEN_SAVED: 'FCM Token saved successfully'
  },
  ERROR: {
    UNAUTHORIZED: 'Unauthorized',
    FORBIDDEN: 'Forbidden',
    ADMIN_REQUIRED: 'Access denied: Administrator privileges required',
    INVALID_ADMIN_CREDENTIALS: 'Invalid administrator credentials',
    ADMIN_CREDENTIALS_REQUIRED: 'Email and password are required',
    ADMIN_NOT_CONFIGURED: 'No password configured for this administrator. Please run the seed script.',
    ADMIN_ROLE_RESTRICTED: 'Access restricted: This account does not have administrator privileges',
    ADMIN_USER_SAME_EMAIL: 'An administrator and regular user cannot use the same email address',
    ACCOUNT_SUSPENDED: 'Account suspended by administrator',
    SESSION_INVALIDATED: 'Session invalidated. Please log in again.',
    NO_GOOGLE_TOKEN: 'No Google token provided',
    INVALID_GOOGLE_TOKEN: 'Invalid Google token',
    GOOGLE_EMAIL_FAILED: 'Failed to get email from Google',
    RECALL_NOT_FOUND: 'Recall item not found',
    DECK_NOT_FOUND: 'Deck not found',
    DECK_NAME_REQUIRED: 'Deck name is required',
    DECK_NAME_TOO_LONG: 'Deck name must be 40 characters or less',
    DECK_EXISTS: 'Deck with this name already exists',
    CANNOT_DELETE_DEFAULT_DECK: 'Cannot delete default General deck',
    QUEUE_JOB_FAILED: 'Failed to add job to queue. Check backend logs!',
    SERVER_ERROR: 'Internal server error',
    FETCH_DECKS_FAILED: 'Server error fetching decks',
    CREATE_DECK_FAILED: 'Server error creating deck',
    DELETE_DECK_FAILED: 'Server error deleting deck'
  }
};
