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
    learningStep: {
        type: Number,
        default: 0
    },
    isGraduated: {
        type: Boolean,
        default: false
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

// Compound indexes for sub-millisecond lookups under high concurrency
recallItemSchema.index({ userId: 1, status: 1, sourceUrl: 1 });
recallItemSchema.index({ userId: 1, status: 1, nextReviewAt: 1, isGraduated: 1 }); // Instant /recall/due queries
recallItemSchema.index({ userId: 1, status: 1, createdAt: -1 }); // Fast /recall list pagination
recallItemSchema.index({ status: 1, nextReviewAt: 1, notificationSent: 1 }); // Fast push notification cron aggregation
recallItemSchema.index({ userId: 1, deck: 1 });

export default mongoose.model('RecallItem', recallItemSchema);
