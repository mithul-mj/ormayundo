import express from 'express';
import { googleAuth, adminLogin, logoutUser, refreshUserToken, saveFcmToken, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { fcmTokenSchema } from '../utils/validators.js';

const router = express.Router();

router.get('/me', protect, getMe);
router.post('/google', googleAuth);
router.post('/admin-login', adminLogin);
router.post('/logout', logoutUser);
router.post('/refresh', refreshUserToken);
router.post('/fcm-token', protect, validate(fcmTokenSchema), saveFcmToken);

export default router;
