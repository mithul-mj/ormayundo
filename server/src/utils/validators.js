import { z } from 'zod';

export const authSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const fcmTokenSchema = z.object({
  token: z.string().min(1, 'Token is required')
});

export const createRecallSchema = z.object({
  selectedText: z.string().min(1, 'Selected text is required').max(10000, 'Selected text cannot exceed 10,000 characters'),
  sourceUrl: z.string().url().optional().or(z.literal(''))
});

export const reviewRecallSchema = z.object({
  rating: z.enum(['forgot', 'hard', 'good', 'easy'], {
    errorMap: () => ({ message: 'Invalid rating provided. Must be forgot, hard, good, or easy.' })
  })
});
