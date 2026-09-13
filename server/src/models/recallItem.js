import mongoose from "mongoose";

const recallItemSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    selectedText: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    sourceUrl: {
        type: String,
        required: false
    },
    nextReviewAt: {
        type: Date,
        default: Date.now
    },
    lastReviewedAt: Date,
    reviewCount: {
        type: Number,
        default: 0
    },
    correctCount: {
        type: Number,
        default: 0
    },
    easinessFactor: {
        type: Number,
        default: 2.5
    },
    interval: {
        type: Number,
        default: 0
    },
    reviewHistory: [{
        reviewedAt: { type: Date, default: Date.now },
        rating: { type: String, enum: ['forgot', 'hard', 'good', 'easy'] },
        newInterval: Number
    }],
    status: {
        type: String,
        enum: ['active', 'archived'],
        default: 'active'
    },
    notificationSent: {
        type: Boolean,
        default: false
    },
    deck: {
        type: String,
        default: 'General'
    }
}, { timestamps: true });

// Compound index for instant sub-millisecond URL lookup per user
recallItemSchema.index({ userId: 1, status: 1, sourceUrl: 1 });
recallItemSchema.index({ userId: 1, deck: 1 });

export default mongoose.model('RecallItem', recallItemSchema);
