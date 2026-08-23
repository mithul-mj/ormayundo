import express from 'express';
import { googleAuth, logoutUser, refreshUserToken, saveFcmToken } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { fcmTokenSchema } from '../utils/validators.js';

const router = express.Router();

router.post('/google', googleAuth);
router.post('/logout', logoutUser);
router.post('/refresh', refreshUserToken);
router.post('/fcm-token', protect, validate(fcmTokenSchema), saveFcmToken);

export default router;
