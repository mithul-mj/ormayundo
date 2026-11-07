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

// Application Messages
export const MESSAGES = {
  SUCCESS: {
    FLASHCARD_QUEUED: 'Flashcard added to the AI Queue!',
    RECALL_DELETED: 'Recall item deleted successfully',
    ALL_RECALL_WIPED: 'All recall items wiped successfully',
    DECK_DELETED: 'Deck deleted successfully',
    GOOGLE_LOGIN: 'Google Login successful',
    LOGGED_OUT: 'Logged out successfully',
    FCM_TOKEN_SAVED: 'FCM Token saved successfully'
  },
  ERROR: {
    UNAUTHORIZED: 'Unauthorized',
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
