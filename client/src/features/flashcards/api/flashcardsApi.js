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
    return res.data;
  },

  getFlashcardsWithDecks: async () => {
    const res = await apiClient.get('/recall?includeDecks=true');
    return res.data;
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
    queryKey: queryKeys.flashcards.all,
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

