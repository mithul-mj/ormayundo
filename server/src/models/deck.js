import mongoose from 'mongoose';

const deckSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  color: {
    type: String,
    default: '#FF9532'
  }
}, { timestamps: true });

deckSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model('Deck', deckSchema);
