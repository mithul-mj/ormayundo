import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';
import {
  getAdminStats,
  getAdminUsers,
  toggleBlockUser,
  updateUserRole,
  revokeUserSessions,
  updateUserDetails,
  deleteUser,
  getTokenAnalytics,
  getSystemHealth,
  broadcastPush,
  retryFailedJobs,
  getSystemConfig,
  updateSystemConfig,
  getAdminFlashcards,
  updateAdminFlashcard,
  deleteAdminFlashcard,
  getAdminDecks,
  updateAdminDeck,
  deleteAdminDeck,
  getAdminIncidents,
  resolveAdminIncident
} from '../controllers/adminController.js';

const router = express.Router();

// Guard all admin routes with authentication and admin privilege checks
router.use(protect, adminOnly);

// 1. Platform Overview Stats
router.get('/stats', getAdminStats);

// 2. Dynamic Guardrails & Platform Settings
router.get('/config', getSystemConfig);
router.put('/config', updateSystemConfig);

// 3. User Management & Full Editing
router.get('/users', getAdminUsers);
router.patch('/users/:id', updateUserDetails);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/block', toggleBlockUser);
router.patch('/users/:id/role', updateUserRole);
router.post('/users/:id/revoke-sessions', revokeUserSessions);

// 4. Global Flashcards Manager & Editor
router.get('/flashcards', getAdminFlashcards);
router.patch('/flashcards/:id', updateAdminFlashcard);
router.delete('/flashcards/:id', deleteAdminFlashcard);

// 5. Global Decks Manager & Editor
router.get('/decks', getAdminDecks);
router.patch('/decks/:id', updateAdminDeck);
router.delete('/decks/:id', deleteAdminDeck);

// 6. Token Usage Analytics
router.get('/tokens', getTokenAnalytics);

// 7. Infrastructure and Queue Health
router.get('/system', getSystemHealth);
router.post('/queue/retry-failed', retryFailedJobs);

// 8. Broadcast Push Notification
router.post('/broadcast', broadcastPush);

// 9. Platform Failure Incidents & Alerts
router.get('/incidents', getAdminIncidents);
router.patch('/incidents/:id/resolve', resolveAdminIncident);

export default router;
