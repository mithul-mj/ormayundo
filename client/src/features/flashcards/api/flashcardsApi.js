import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/lib/apiClient';
import { queryKeys } from '../../../shared/lib/queryKeys';

// ==========================================
// PURE API REQUESTS
// ==========================================
export const flashcardsApi = {
  getDecks: async () => {
    const res = await apiClient.get('/decks');
    return res.data;
  },

  getFlashcards: async () => {
    const res = await apiClient.get('/recall');
    return Array.isArray(res.data) ? res.data : (res.data?.cards || []);
  },

  getFlashcardsWithDecks: async () => {
    try {
      const res = await apiClient.get('/recall?includeDecks=true');
      const data = res.data;

      // Format 1: Backend returns { cards: [...], decks: [...] }
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const cards = Array.isArray(data.cards)
          ? data.cards
          : (Array.isArray(data.data) ? data.data : []);
        let decks = Array.isArray(data.decks) ? data.decks : [];

        if (decks.length === 0) {
          try {
            const decksRes = await apiClient.get('/decks');
            if (Array.isArray(decksRes.data)) decks = decksRes.data;
          } catch {
            // ignore decks fetch error
          }
        }
        return { cards, decks };
      }

      // Format 2: Backend returns a flat array of cards directly [...]
      if (Array.isArray(data)) {
        let decks = [];
        try {
          const decksRes = await apiClient.get('/decks');
          if (Array.isArray(decksRes.data)) decks = decksRes.data;
        } catch {
          // ignore decks fetch error
        }
        return { cards: data, decks };
      }

      return { cards: [], decks: [] };
    } catch {
      // Fallback: parallel requests to /recall and /decks
      const [cardsRes, decksRes] = await Promise.allSettled([
        apiClient.get('/recall'),
        apiClient.get('/decks'),
      ]);

      const rawCards = cardsRes.status === 'fulfilled' ? cardsRes.value.data : [];
      const rawDecks = decksRes.status === 'fulfilled' ? decksRes.value.data : [];

      const cards = Array.isArray(rawCards)
        ? rawCards
        : (Array.isArray(rawCards?.cards) ? rawCards.cards : (Array.isArray(rawCards?.data) ? rawCards.data : []));
      const decks = Array.isArray(rawDecks)
        ? rawDecks
        : (Array.isArray(rawDecks?.decks) ? rawDecks.decks : []);

      return { cards, decks };
    }
  },

  createDeck: async (payload) => {
    const res = await apiClient.post('/decks', payload);
    return res.data;
  },

  updateCard: async ({ id, data }) => {
    const res = await apiClient.put(`/recall/${id}`, data);
    return res.data;
  },

  deleteCard: async (id) => {
    await apiClient.delete(`/recall/${id}`);
    return id;
  },

  deleteAllCards: async () => {
    await apiClient.delete('/recall/all');
  },

  deleteDeck: async (deckId) => {
    await apiClient.delete(`/decks/${deckId}`);
    return deckId;
  },

  reviewCard: async ({ id, rating }) => {
    const timezone = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC';
    const res = await apiClient.post(`/recall/${id}/review`, { rating, timezone }, {
      headers: { 'x-timezone': timezone }
    });
    return res.data;
  },
};

// ==========================================
// CUSTOM TANSTACK QUERY HOOKS
// ==========================================
export function useFlashcardsDataQuery() {
  return useQuery({
    queryKey: queryKeys.flashcards.data(),
    queryFn: flashcardsApi.getFlashcardsWithDecks,
  });
}

export function useDecksQuery() {
  return useQuery({
    queryKey: queryKeys.decks.all,
    queryFn: flashcardsApi.getDecks,
  });
}

export function useFlashcardsQuery() {
  return useQuery({
    queryKey: queryKeys.flashcards.all,
    queryFn: flashcardsApi.getFlashcards,
  });
}

export function useCreateDeckMutation(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: flashcardsApi.createDeck,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashcards.all });
      options.onSuccess?.(data, variables, context);
    },
    onError: options.onError,
  });
}

export function useUpdateCardMutation(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: flashcardsApi.updateCard,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashcards.all });
      options.onSuccess?.(data, variables, context);
    },
    onError: options.onError,
  });
}

export function useDeleteCardMutation(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: flashcardsApi.deleteCard,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashcards.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
      options.onSuccess?.(data, variables, context);
    },
    onError: options.onError,
  });
}

export function useWipeAllCardsMutation(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: flashcardsApi.deleteAllCards,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashcards.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
      options.onSuccess?.(data, variables, context);
    },
    onError: options.onError,
  });
}

export function useDeleteDeckMutation(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: flashcardsApi.deleteDeck,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.decks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.flashcards.all });
      options.onSuccess?.(data, variables, context);
    },
    onError: options.onError,
  });
}

export function useReviewCardMutation(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: flashcardsApi.reviewCard,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.flashcards.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
      options.onSuccess?.(data, variables, context);
    },
    onError: options.onError,
  });
}

