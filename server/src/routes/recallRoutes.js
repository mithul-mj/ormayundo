import express from 'express';
import { createRecallItem, getDueItems, getAllItems, editRecallItem, reviewRecallItem, deleteRecallItem, deleteAllRecallItems } from '../controllers/recallController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { createRecallSchema, reviewRecallSchema } from '../utils/validators.js';
import { recallCreationRateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAllItems);
router.post('/', recallCreationRateLimiter, validate(createRecallSchema), createRecallItem);
router.get('/due', getDueItems);
router.delete('/all', deleteAllRecallItems); // MUST BE BEFORE /:id
router.post('/:id/review', validate(reviewRecallSchema), reviewRecallItem);
router.put('/:id', editRecallItem);
router.delete('/:id', deleteRecallItem);

export default router;
