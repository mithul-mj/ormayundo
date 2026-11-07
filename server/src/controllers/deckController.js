import Deck from '../models/deck.js';
import RecallItem from '../models/recallItem.js';
import { STATUS_CODES } from '../utils/statusCodes.js';
import { DECKS, MESSAGES } from '../utils/constants.js';

// Select a random accent color from the palette
const getRandomColor = () => {
  const randomIndex = Math.floor(Math.random() * DECKS.COLOR_PALETTE.length);
  return DECKS.COLOR_PALETTE[randomIndex];
};

const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Fetch all decks for user (creates default General deck if empty)
export const getDecks = async (req, res) => {
  try {
    const userId = req.user._id;
    let decks = await Deck.find({ userId }).sort({ createdAt: 1 });

    if (decks.length === 0) {
      const defaultDeck = await Deck.create({
        userId,
        name: DECKS.DEFAULT_NAME,
        color: DECKS.DEFAULT_COLOR
      });
      decks = [defaultDeck];
    }

    res.status(STATUS_CODES.OK).json(decks);
  } catch (error) {
    console.error('[Deck Controller] Error fetching decks:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.ERROR.FETCH_DECKS_FAILED });
  }
};

// Create a new deck with validation
export const createDeck = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user._id;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.ERROR.DECK_NAME_REQUIRED });
    }

    const trimmedName = name.trim();
    if (trimmedName.length > DECKS.MAX_NAME_LENGTH) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.ERROR.DECK_NAME_TOO_LONG });
    }

    const escaped = escapeRegex(trimmedName);
    const existing = await Deck.findOne({ userId, name: new RegExp(`^${escaped}$`, 'i') });
    if (existing) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.ERROR.DECK_EXISTS });
    }

    const newDeck = await Deck.create({
      userId,
      name: trimmedName,
      color: getRandomColor()
    });

    res.status(STATUS_CODES.CREATED).json(newDeck);
  } catch (error) {
    console.error('[Deck Controller] Error creating deck:', error);
    if (error.code === 11000) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.ERROR.DECK_EXISTS });
    }
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: error.message || MESSAGES.ERROR.CREATE_DECK_FAILED
    });
  }
};

// Delete a deck and reassign cards to General
export const deleteDeck = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const deck = await Deck.findOne({ _id: id, userId });
    if (!deck) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: MESSAGES.ERROR.DECK_NOT_FOUND });
    }

    if (deck.name.toLowerCase() === DECKS.DEFAULT_NAME.toLowerCase()) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: MESSAGES.ERROR.CANNOT_DELETE_DEFAULT_DECK });
    }

    await RecallItem.updateMany(
      { userId, deck: deck.name },
      { $set: { deck: DECKS.DEFAULT_NAME } }
    );

    await deck.deleteOne();
    res.status(STATUS_CODES.OK).json({ message: MESSAGES.SUCCESS.DECK_DELETED });
  } catch (error) {
    console.error('[Deck Controller] Error deleting deck:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.ERROR.DELETE_DECK_FAILED });
  }
};
