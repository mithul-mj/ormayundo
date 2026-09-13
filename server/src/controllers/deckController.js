import Deck from '../models/deck.js';
import RecallItem from '../models/recallItem.js';
import { STATUS_CODES } from '../utils/statusCodes.js';

const COLOR_PALETTE = [
  '#FF9532', '#3B82F6', '#10B981', '#8B5CF6', 
  '#EC4899', '#F59E0B', '#06B6D4', '#6366F1', '#14B8A6'
];

const getRandomColor = () => {
  const randomIndex = Math.floor(Math.random() * COLOR_PALETTE.length);
  return COLOR_PALETTE[randomIndex];
};

const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// @desc    Get all decks for a user
// @route   GET /api/decks
// @access  Private
export const getDecks = async (req, res) => {
  try {
    const userId = req.user._id;
    let decks = await Deck.find({ userId }).sort({ createdAt: 1 });

    // Auto-create default General deck if user has no decks yet
    if (decks.length === 0) {
      const defaultDeck = await Deck.create({
        userId,
        name: 'General',
        color: '#FF9532'
      });
      decks = [defaultDeck];
    }

    res.status(STATUS_CODES.OK).json(decks);
  } catch (error) {
    console.error('[Deck Controller] Error fetching decks:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: 'Server error fetching decks' });
  }
};

// @desc    Create a new deck with auto-assigned preset color
// @route   POST /api/decks
// @access  Private
export const createDeck = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user._id;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'Deck name is required' });
    }

    const trimmedName = name.trim();
    if (trimmedName.length > 40) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'Deck name must be 40 characters or less' });
    }

    // Check if deck with same name exists (case-insensitive with regex escaping)
    const escaped = escapeRegex(trimmedName);
    const existing = await Deck.findOne({ userId, name: new RegExp(`^${escaped}$`, 'i') });
    if (existing) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'Deck with this name already exists' });
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
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'Deck with this name already exists' });
    }
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error.message || 'Server error creating deck' });
  }
};

// @desc    Delete a deck (reassign active cards to "General")
// @route   DELETE /api/decks/:id
// @access  Private
export const deleteDeck = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const deck = await Deck.findOne({ _id: id, userId });
    if (!deck) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'Deck not found' });
    }

    if (deck.name.toLowerCase() === 'general') {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'Cannot delete default General deck' });
    }

    // Reassign cards in this deck to General
    await RecallItem.updateMany(
      { userId, deck: deck.name },
      { $set: { deck: 'General' } }
    );

    await deck.deleteOne();

    res.status(STATUS_CODES.OK).json({ message: 'Deck deleted successfully' });
  } catch (error) {
    console.error('[Deck Controller] Error deleting deck:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: 'Server error deleting deck' });
  }
};
