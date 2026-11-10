/**
 * Industry-standard hierarchical query key factory
 * Ensures strict typing, cache deduplication, and pinpoint cache invalidation.
 */
export const queryKeys = {
  auth: {
    all: ['auth'],
    me: () => ['auth', 'me'],
  },
  flashcards: {
    all: ['flashcards'],
    data: () => ['flashcards', 'data'],
    list: (filters = {}) => ['flashcards', 'list', filters],
  },
  decks: {
    all: ['decks'],
  },
  analytics: {
    all: ['analytics'],
  },
  announcement: {
    current: () => ['announcement'],
  },
  admin: {
    all: ['admin'],
    stats: () => ['admin', 'stats'],
    system: () => ['admin', 'system'],
    tokens: () => ['admin', 'tokens'],
    config: () => ['admin', 'config'],
    users: (params = {}) => ['admin', 'users', params],
    cards: (params = {}) => ['admin', 'cards', params],
    incidents: () => ['admin', 'incidents'],
  },
};

