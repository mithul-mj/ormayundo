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
    reviewHistory: [{
        reviewedAt: { type: Date, default: Date.now },
        rating: { type: String, enum: ['forgot', 'hard', 'good', 'easy'] },
        newInterval: Number
    }],
    status: {
        type: String,
        enum: ['active', 'archived'],
        default: 'active'
    }
}, { timestamps: true });

export default mongoose.model('RecallItem', recallItemSchema);
