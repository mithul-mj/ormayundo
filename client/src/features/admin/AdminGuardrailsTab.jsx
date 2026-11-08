import { useState } from 'react';
import {
  Save,
  Cpu,
  Sliders,
  AlertTriangle,
  Megaphone,
  Bell,
  CheckCircle,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Toggle, Select } from '../../shared/components';
import { GUARDRAILS, UI_TIMERS } from '../../shared/constants';

const AVAILABLE_MODELS = [
  { value: 'openai/gpt-oss-120b', label: 'openai/gpt-oss-120b', badge: 'High Capability', description: 'Groq flagship performance' },
  { value: 'llama-3.3-70b-versatile', label: 'llama-3.3-70b-versatile', badge: 'Fast & Reliable', description: 'Low latency reasoning' },
  { value: 'mixtral-8x7b-32768', label: 'mixtral-8x7b-32768', badge: 'High Context', description: '32k token window' },
  { value: 'deepseek-r1-distill-llama-70b', label: 'deepseek-r1-distill-llama-70b', badge: 'Reasoning', description: 'Math and deep logic' },
];

export default function AdminGuardrailsTab({ config, onUpdateConfig }) {
  const [formData, setFormData] = useState(() => ({
    aiModel: 'openai/gpt-oss-120b',
    aiFallbackModel: 'llama-3.3-70b-versatile',
    aiTemperature: GUARDRAILS.TEMPERATURE.DEFAULT,
    aiMaxTokens: GUARDRAILS.MAX_TOKENS.DEFAULT,
    aiEnabled: true,
    dailyCardLimit: GUARDRAILS.DAILY_CARD_LIMIT.DEFAULT,
    maxTextLength: GUARDRAILS.TEXT_LENGTH.DEFAULT,
    maintenanceMode: false,
    maintenanceMessage: 'Ormayundo is temporarily undergoing maintenance.',
    announcementBanner: '',
    announcementActive: false,
    pushNotificationsEnabled: true,
    ...(config || {}),
  }));

  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await onUpdateConfig(formData);
      Swal.fire({
        icon: 'success',
        title: 'Settings Saved',
        text: 'Platform guardrails and configuration updated successfully.',
        timer: UI_TIMERS.ALERT_MEDIUM_MS,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
      {/* Top Action Bar (Clean & Unboxed) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-divider/60">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-ink flex items-center gap-2.5 tracking-tight">
            <Sliders className="w-5 h-5 text-brand" />
            Live Platform Guardrails
          </h2>
          <p className="text-xs text-muted mt-1">
            Real-time configuration across client extensions and server instances without service restart.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand hover:bg-brand-hover text-white font-bold text-xs transition-all shadow-sm shadow-brand/20 cursor-pointer disabled:opacity-60 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Grid: 2 Columns (Open, Breathable Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
        {/* Section 1: AI Engine & Token Guardrails */}
        <div className="space-y-6">
          <div className="border-b border-divider/60 pb-3">
            <h3 className="font-extrabold text-base text-ink flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-600" />
              AI Model & Consumption
            </h3>
            <p className="text-xs text-muted mt-0.5">Groq cloud inference and model routing</p>
          </div>

          {/* AI Kill Switch (Direct & Borderless) */}
          <div className="py-2">
            <Toggle
              checked={formData.aiEnabled}
              onChange={(checked) => handleChange('aiEnabled', checked)}
              label="AI Generation Engine"
              description={formData.aiEnabled ? 'Actively generating flashcards via Groq API' : 'Generation paused by admin kill-switch'}
              variant="brand"
              size="md"
            />
          </div>

          {/* Primary Model */}
          <div>
            <Select
              label="Primary Groq Model"
              value={formData.aiModel}
              onChange={(val) => handleChange('aiModel', val)}
              options={AVAILABLE_MODELS}
              variant="rounded"
              className="w-full"
            />
          </div>

          {/* Fallback Model */}
          <div>
            <Select
              label="Fallback Groq Model"
              value={formData.aiFallbackModel}
              onChange={(val) => handleChange('aiFallbackModel', val)}
              options={AVAILABLE_MODELS}
              variant="rounded"
              className="w-full"
            />
            <span className="text-[11px] text-muted block mt-1.5">
              Engages automatically if the primary model reaches rate limits or 429 quota.
            </span>
          </div>

          {/* Temperature & Max Output Tokens */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                Temperature ({formData.aiTemperature})
              </label>
              <input
                type="range"
                min={GUARDRAILS.TEMPERATURE.MIN}
                max={GUARDRAILS.TEMPERATURE.MAX}
                step={GUARDRAILS.TEMPERATURE.STEP}
                value={formData.aiTemperature}
                onChange={(e) => handleChange('aiTemperature', parseFloat(e.target.value))}
                className="w-full accent-brand cursor-pointer"
              />
              <span className="text-[10px] text-muted block mt-1">Lower = focused, Higher = creative</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                Max Output Tokens ({formData.aiMaxTokens})
              </label>
              <input
                type="number"
                min={GUARDRAILS.MAX_TOKENS.MIN}
                max={GUARDRAILS.MAX_TOKENS.MAX}
                step={GUARDRAILS.MAX_TOKENS.STEP}
                value={formData.aiMaxTokens}
                onChange={(e) => handleChange('aiMaxTokens', parseInt(e.target.value) || GUARDRAILS.MAX_TOKENS.DEFAULT)}
                className="w-full px-4 py-2.5 bg-surface text-ink text-xs rounded-2xl border border-divider focus:outline-hidden focus:border-ink"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Rate Limits & Highlights */}
        <div className="space-y-6">
          <div className="border-b border-divider/60 pb-3">
            <h3 className="font-extrabold text-base text-ink flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              Student Quotas & Abuse Prevention
            </h3>
            <p className="text-xs text-muted mt-0.5">Highlight payload bounds and spaced repetition notifications</p>
          </div>

          {/* Daily Card Creation Limit */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">
              Daily Flashcard Generation Limit ({formData.dailyCardLimit} cards/day)
            </label>
            <input
              type="range"
              min={GUARDRAILS.DAILY_CARD_LIMIT.MIN}
              max={GUARDRAILS.DAILY_CARD_LIMIT.MAX}
              step={GUARDRAILS.DAILY_CARD_LIMIT.STEP}
              value={formData.dailyCardLimit}
              onChange={(e) => handleChange('dailyCardLimit', parseInt(e.target.value))}
              className="w-full accent-brand cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted font-semibold mt-1">
              <span>{GUARDRAILS.DAILY_CARD_LIMIT.MIN} Cards</span>
              <span>{Math.round((GUARDRAILS.DAILY_CARD_LIMIT.MAX + GUARDRAILS.DAILY_CARD_LIMIT.MIN) / 3)} Cards</span>
              <span>{GUARDRAILS.DAILY_CARD_LIMIT.MAX} Cards</span>
            </div>
          </div>

          {/* Max Input Text Length */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">
              Max Allowed Highlight Text Length (Chars)
            </label>
            <input
              type="number"
              min={GUARDRAILS.TEXT_LENGTH.MIN}
              max={GUARDRAILS.TEXT_LENGTH.MAX}
              step={GUARDRAILS.TEXT_LENGTH.STEP}
              value={formData.maxTextLength}
              onChange={(e) => handleChange('maxTextLength', parseInt(e.target.value) || GUARDRAILS.TEXT_LENGTH.DEFAULT)}
              className="w-full px-4 py-2.5 bg-surface text-ink text-xs rounded-2xl border border-divider focus:outline-hidden focus:border-ink"
            />
            <span className="text-[11px] text-muted block mt-1">
              Highlighted texts exceeding this length are safely clamped before being sent to the AI.
            </span>
          </div>

          {/* Push Notification Cron Toggle (Direct & Borderless) */}
          <div className="py-2">
            <Toggle
              checked={formData.pushNotificationsEnabled}
              onChange={(checked) => handleChange('pushNotificationsEnabled', checked)}
              label={
                <span className="flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-brand" />
                  Spaced Repetition Push Notifications
                </span>
              }
              description={
                formData.pushNotificationsEnabled
                  ? 'Active • Dispatches due flashcard notifications at scheduled student local time'
                  : 'Push notification crons are paused platform-wide'
              }
              variant="brand"
              size="md"
            />
          </div>

          {/* Discord / Slack Failure Alert Webhook */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">
              Failure Alert Webhook URL (Discord / Slack)
            </label>
            <input
              type="url"
              placeholder="https://discord.com/api/webhooks/..."
              value={formData.alertWebhookUrl || ''}
              onChange={(e) => handleChange('alertWebhookUrl', e.target.value)}
              className="w-full px-4 py-2.5 bg-surface text-ink text-xs rounded-2xl border border-divider focus:outline-hidden focus:border-ink"
            />
          </div>
        </div>

        {/* Section 3: Maintenance Mode & Announcements (Spans 2 cols, Clean Borderless) */}
        <div className="lg:col-span-2 space-y-6 pt-4 border-t border-divider/60">
          <div>
            <h3 className="font-extrabold text-base text-ink flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-500" />
              Broadcast Announcements & Maintenance Controls
            </h3>
            <p className="text-xs text-muted mt-0.5">Control web app accessibility and student notifications</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Maintenance Mode */}
            <div className="space-y-3">
              <Toggle
                checked={formData.maintenanceMode}
                onChange={(checked) => handleChange('maintenanceMode', checked)}
                label={
                  <span className="flex items-center gap-1.5 text-red-600">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    Maintenance Mode
                  </span>
                }
                description={
                  formData.maintenanceMode
                    ? 'Active: Non-admin users will receive 503 service unavailable'
                    : 'Disabled: All users have normal platform access'
                }
                variant="danger"
                size="md"
              />

              <textarea
                rows={2}
                placeholder="Maintenance message displayed to users..."
                value={formData.maintenanceMessage}
                onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                className="w-full px-4 py-2.5 bg-surface text-ink text-xs rounded-2xl border border-divider focus:outline-hidden focus:border-ink focus:bg-white resize-none"
              />
            </div>

            {/* Announcement Banner */}
            <div className="space-y-3">
              <Toggle
                checked={formData.announcementActive}
                onChange={(checked) => handleChange('announcementActive', checked)}
                label={
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Global Announcement Banner
                  </span>
                }
                description={
                  formData.announcementActive
                    ? 'Banner is visible at top of students’ dashboard'
                    : 'Banner is hidden from user interfaces'
                }
                variant="brand"
                size="md"
              />

              <textarea
                rows={2}
                placeholder="e.g. 🚀 Ormayundo v2.0 is live! Try the new spaced repetition interval sliders."
                value={formData.announcementBanner}
                onChange={(e) => handleChange('announcementBanner', e.target.value)}
                className="w-full px-4 py-2.5 bg-surface text-ink text-xs rounded-2xl border border-divider focus:outline-hidden focus:border-ink focus:bg-white resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
