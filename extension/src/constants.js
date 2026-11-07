// Google Cloud Messaging Configuration (Option A: Native chrome.gcm)
export const GCM_CONFIG = {
  SENDER_ID: '261551023957'
};

// Spaced Repetition Parameters
export const SPACED_REPETITION = {
  MAX_INTERVAL_DAYS: 365,
  DEFAULT_EASINESS_FACTOR: 2.5,
  MIN_EASINESS_FACTOR: 1.3,
  HARD_GROWTH_FACTOR: 1.2,
  EASY_BONUS_FACTOR: 1.3,
  RATINGS: {
    FORGOT: 'forgot',
    HARD: 'hard',
    GOOD: 'good',
    EASY: 'easy'
  }
};

// UI and Action Messages
export const MESSAGES = {
  SUCCESS: {
    CARD_SAVED: 'Question updated successfully',
    CARD_DELETED: 'Flashcard deleted',
    ALL_DELETED: 'All flashcards wiped',
    TOKEN_SYNCED: 'GCM push token synced successfully',
    LOGGED_OUT: 'Logged out successfully'
  },
  ERROR: {
    EMPTY_QUESTION: 'Question cannot be empty.',
    TOKEN_SYNC_FAILED: 'Failed to sync GCM token with server',
    DELETE_CARD_FAILED: 'Failed to delete card',
    UPDATE_QUESTION_FAILED: 'Failed to update question. Please try again.',
    AUTH_EXPIRED: 'Session expired. Please log in again.',
    NETWORK_ERROR: 'Unable to connect to server. Please check your connection.',
    FETCH_FAILED: 'Failed to load flashcards.'
  },
  UI: {
    CHECKING_MEMORY: 'Checking your memory bank...',
    ALL_CAUGHT_UP: "You're all caught up!",
    NO_CARDS_DUE: 'No flashcards due right now. Go highlight some text to learn more!',
    NOTIFICATION_TITLE: 'Time for Ormayundo!',
    NOTIFICATION_BODY: 'You have flashcards due for active recall.'
  }
};

// Aliases for convenience
MESSAGES.CARD_SAVED = MESSAGES.SUCCESS.CARD_SAVED;
MESSAGES.CARD_DELETED = MESSAGES.SUCCESS.CARD_DELETED;
MESSAGES.ALL_DELETED = MESSAGES.SUCCESS.ALL_DELETED;
MESSAGES.EMPTY_QUESTION = MESSAGES.ERROR.EMPTY_QUESTION;
MESSAGES.CHECKING_MEMORY = MESSAGES.UI.CHECKING_MEMORY;
MESSAGES.ALL_CAUGHT_UP = MESSAGES.UI.ALL_CAUGHT_UP;
MESSAGES.NO_CARDS_DUE = MESSAGES.UI.NO_CARDS_DUE;
