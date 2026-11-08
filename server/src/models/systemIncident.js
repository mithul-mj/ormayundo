import mongoose from 'mongoose';

const systemIncidentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'AI_GENERATION_FAILED',
      'API_RATE_LIMIT_EXCEEDED',
      'PUSH_DELIVERY_FAILED',
      'SERVER_ERROR',
      'DATABASE_DISCONNECT'
    ],
    required: true,
    index: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  jobId: {
    type: String
  },
  status: {
    type: String,
    enum: ['unresolved', 'resolved'],
    default: 'unresolved',
    index: true
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: String
  }
}, { timestamps: true });

systemIncidentSchema.index({ createdAt: -1 });
systemIncidentSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('SystemIncident', systemIncidentSchema);

