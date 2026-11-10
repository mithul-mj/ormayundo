import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLES } from '../utils/constants.js';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    password: {
        type: String,
        required: false,
        select: false
    },
    fcmToken: {
        type: String
    },
    fcmTokens: [{
        type: String
    }],
    currentStreak: {
        type: Number,
        default: 0
    },
    maxStreak: {
        type: Number,
        default: 0
    },
    lastAddedDate: {
        type: Date
    },
    lastStudiedDate: {
        type: Date
    },
    role: {
        type: String,
        enum: Object.values(USER_ROLES),
        default: USER_ROLES.USER
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    blockedReason: {
        type: String,
        default: ''
    },
    blockedAt: {
        type: Date
    },
    customDailyLimit: {
        type: Number,
        default: null
    },
    tokenVersion: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
