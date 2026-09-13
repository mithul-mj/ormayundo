import express from 'express';
import { getDecks, createDeck, deleteDeck } from '../controllers/deckController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getDecks)
  .post(createDeck);

router.route('/:id')
  .delete(deleteDeck);

export default router;
