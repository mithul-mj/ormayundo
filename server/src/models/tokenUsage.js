import mongoose from 'mongoose';

const tokenUsageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecallItem'
  },
  promptTokens: {
    type: Number,
    required: true,
    default: 0
  },
  completionTokens: {
    type: Number,
    required: true,
    default: 0
  },
  totalTokens: {
    type: Number,
    required: true,
    default: 0
  },
  model: {
    type: String,
    default: 'openai/gpt-oss-120b'
  },
  estimatedCost: {
    type: Number,
    default: 0
  },
  sourceUrl: {
    type: String,
    default: ''
  }
}, { timestamps: true });

tokenUsageSchema.index({ createdAt: -1 });
tokenUsageSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('TokenUsage', tokenUsageSchema);

