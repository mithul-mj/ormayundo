import mongoose from 'mongoose';
import { SYSTEM_CONFIG_DEFAULTS } from '../utils/constants.js';

const systemConfigSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: SYSTEM_CONFIG_DEFAULTS.GLOBAL_KEY
  },
  aiModel: {
    type: String,
    default: SYSTEM_CONFIG_DEFAULTS.AI_MODEL
  },
  aiFallbackModel: {
    type: String,
    default: SYSTEM_CONFIG_DEFAULTS.AI_FALLBACK_MODEL
  },
  aiTemperature: {
    type: Number,
    default: SYSTEM_CONFIG_DEFAULTS.AI_TEMPERATURE,
    min: 0,
    max: 2
  },
  aiMaxTokens: {
    type: Number,
    default: SYSTEM_CONFIG_DEFAULTS.AI_MAX_TOKENS,
    min: 256,
    max: 8192
  },
  aiEnabled: {
    type: Boolean,
    default: true
  },
  dailyCardLimit: {
    type: Number,
    default: SYSTEM_CONFIG_DEFAULTS.DAILY_CARD_LIMIT,
    min: 1,
    max: 1000
  },
  maxTextLength: {
    type: Number,
    default: SYSTEM_CONFIG_DEFAULTS.MAX_TEXT_LENGTH,
    min: 100,
    max: 20000
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  maintenanceMessage: {
    type: String,
    default: 'Ormayundo is temporarily undergoing scheduled maintenance. Please check back shortly.'
  },
  announcementBanner: {
    type: String,
    default: ''
  },
  announcementActive: {
    type: Boolean,
    default: false
  },
  pushNotificationsEnabled: {
    type: Boolean,
    default: true
  },
  alertWebhookUrl: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// In-memory cache to prevent database reads on every single AI request or guardrail check
let cachedConfig = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 15000; // 15 seconds cache

systemConfigSchema.statics.getSettings = async function () {
  const now = Date.now();
  if (cachedConfig && now < cacheExpiry) {
    return cachedConfig;
  }

  let config = await this.findOne({ key: 'global_settings' });
  if (!config) {
    config = await this.create({ key: 'global_settings' });
  }

  cachedConfig = config.toObject();
  cacheExpiry = now + CACHE_TTL_MS;
  return cachedConfig;
};

systemConfigSchema.statics.invalidateCache = function () {
  cachedConfig = null;
  cacheExpiry = 0;
};

export default mongoose.model('SystemConfig', systemConfigSchema);

