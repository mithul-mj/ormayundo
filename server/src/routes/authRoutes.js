import express from 'express';
import { registerUser, loginUser, logoutUser, refreshUserToken, saveFcmToken } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { authSchema, fcmTokenSchema } from '../utils/validators.js';

const router = express.Router();

router.post('/register', validate(authSchema), registerUser);
router.post('/login', validate(authSchema), loginUser);
router.post('/logout', logoutUser);
router.post('/refresh', refreshUserToken);
router.post('/fcm-token', protect, validate(fcmTokenSchema), saveFcmToken);

export default router;
