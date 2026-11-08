import { useState } from 'react';
import {
  ShieldAlert,
  Save,
  Cpu,
  Sliders,
  AlertTriangle,
  Megaphone,
  Bell,
  CheckCircle,
} from 'lucide-react';
import Swal from 'sweetalert2';

const AVAILABLE_MODELS = [
  { id: 'openai/gpt-oss-120b', label: 'openai/gpt-oss-120b (Groq High Capability)' },
  { id: 'llama-3.3-70b-versatile', label: 'llama-3.3-70b-versatile (Fast & Reliable)' },
  { id: 'mixtral-8x7b-32768', label: 'mixtral-8x7b-32768 (Low Cost / High Context)' },
  { id: 'deepseek-r1-distill-llama-70b', label: 'deepseek-r1-distill-llama-70b (Reasoning Model)' },
];

export default function AdminGuardrailsTab({ config, onUpdateConfig }) {
  const [formData, setFormData] = useState(() => ({
    aiModel: 'openai/gpt-oss-120b',
    aiFallbackModel: 'llama-3.3-70b-versatile',
    aiTemperature: 1.0,
    aiMaxTokens: 2048,
    aiEnabled: true,
    dailyCardLimit: 30,
    maxTextLength: 4000,
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
        timer: 2000,
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
      {/* Top Save Action Bar */}
      <div className="bg-white p-5 rounded-2xl border border-divider shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-ink flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand" />
            Live Platform Guardrails & Engine Controls
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Changes take effect immediately across all client extensions and server instances.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-60 shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
        </button>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 1: AI Engine & Token Guardrails */}
        <div className="bg-white p-6 rounded-2xl border border-divider shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-divider pb-3">
            <h3 className="font-bold text-sm text-ink flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-600" />
              AI Model & Token Consumption
            </h3>
            <span className="text-[11px] font-semibold text-muted">Groq Cloud Integration</span>
          </div>

          {/* AI Kill Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface border border-divider/60">
            <div>
              <span className="text-xs font-bold text-ink block">AI Generation Engine</span>
              <span className="text-[11px] text-muted">
                {formData.aiEnabled ? 'Actively generating flashcards' : 'Generation paused by admin'}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.aiEnabled}
                onChange={(e) => handleChange('aiEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          {/* Primary Model */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">Primary Groq Model</label>
            <select
              value={formData.aiModel}
              onChange={(e) => handleChange('aiModel', e.target.value)}
              className="w-full px-3.5 py-2 bg-surface text-ink text-xs rounded-xl border border-divider focus:outline-none focus:border-brand cursor-pointer"
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Fallback Model */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">Fallback Groq Model</label>
            <select
              value={formData.aiFallbackModel}
              onChange={(e) => handleChange('aiFallbackModel', e.target.value)}
              className="w-full px-3.5 py-2 bg-surface text-ink text-xs rounded-xl border border-divider focus:outline-none focus:border-brand cursor-pointer"
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-muted block mt-1">
              Used if the primary model encounters rate limits or service timeouts.
            </span>
          </div>

          {/* Temperature & Max Output Tokens */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                Temperature ({formData.aiTemperature})
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={formData.aiTemperature}
                onChange={(e) => handleChange('aiTemperature', parseFloat(e.target.value))}
                className="w-full accent-brand cursor-pointer"
              />
              <span className="text-[10px] text-muted block mt-0.5">0 = Focused, 1 = Balanced</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Max Completion Tokens</label>
              <input
                type="number"
                min="256"
                max="8192"
                step="128"
                value={formData.aiMaxTokens}
                onChange={(e) => handleChange('aiMaxTokens', parseInt(e.target.value) || 2048)}
                className="w-full px-3 py-1.5 bg-surface text-ink text-xs rounded-xl border border-divider focus:outline-none focus:border-brand"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Quota & Abuse Prevention Guardrails */}
        <div className="bg-white p-6 rounded-2xl border border-divider shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-divider pb-3">
            <h3 className="font-bold text-sm text-ink flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-brand" />
              Usage Quotas & Spam Guardrails
            </h3>
            <span className="text-[11px] font-semibold text-muted">Cost Protection</span>
          </div>

          {/* Daily Card Creation Limit */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1">
              Default Daily Card Limit per User
            </label>
            <input
              type="number"
              min="1"
              max="1000"
              value={formData.dailyCardLimit}
              onChange={(e) => handleChange('dailyCardLimit', parseInt(e.target.value) || 30)}
              className="w-full px-3.5 py-2 bg-surface text-ink text-xs rounded-xl border border-divider focus:outline-none focus:border-brand"
            />
            <span className="text-[11px] text-muted block mt-1">
              Limits how many AI flashcards a free user can generate every 24 hours. Prevents script abuse.
            </span>
          </div>

          {/* Max Input Text Length */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1">
              Max Allowed Highlight Text Length (Chars)
            </label>
            <input
              type="number"
              min="200"
              max="20000"
              step="500"
              value={formData.maxTextLength}
              onChange={(e) => handleChange('maxTextLength', parseInt(e.target.value) || 4000)}
              className="w-full px-3.5 py-2 bg-surface text-ink text-xs rounded-xl border border-divider focus:outline-none focus:border-brand"
            />
            <span className="text-[11px] text-muted block mt-1">
              Highlighted texts exceeding this length are clamped to keep token costs minimal.
            </span>
          </div>

          {/* Push Notification Cron Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface border border-divider/60">
            <div>
              <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-brand" />
                Spaced Repetition Push Notifications
              </span>
              <span className="text-[11px] text-muted">
                {formData.pushNotificationsEnabled
                  ? 'Cron runs every minute dispatching due cards'
                  : 'Push notifications paused'}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.pushNotificationsEnabled}
                onChange={(e) => handleChange('pushNotificationsEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-emerald-600" />
            </label>
          </div>

          {/* Discord / Slack Failure Alert Webhook */}
          <div>
            <label className="block text-xs font-bold text-ink mb-1">
              Failure Alert Webhook URL (Discord / Slack)
            </label>
            <input
              type="url"
              placeholder="https://discord.com/api/webhooks/... or Slack webhook"
              value={formData.alertWebhookUrl || ''}
              onChange={(e) => handleChange('alertWebhookUrl', e.target.value)}
              className="w-full px-3.5 py-2 bg-surface text-ink text-xs rounded-xl border border-divider focus:outline-none focus:border-brand"
            />
            <span className="text-[11px] text-muted block mt-1">
              Instant alerts sent to your Discord/Slack channel whenever a job or server failure occurs.
            </span>
          </div>
        </div>

        {/* Section 3: Maintenance Mode & Announcements (Spans 2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-divider shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-divider pb-3">
            <h3 className="font-bold text-sm text-ink flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-500" />
              Platform Announcements & Maintenance Mode
            </h3>
            <span className="text-[11px] font-semibold text-muted">Broadcast Management</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Maintenance Mode */}
            <div className="p-4 rounded-xl border border-divider bg-surface/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Maintenance Mode
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.maintenanceMode}
                    onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-red-600" />
                </label>
              </div>

              <textarea
                rows={2}
                placeholder="Maintenance message displayed to users..."
                value={formData.maintenanceMessage}
                onChange={(e) => handleChange('maintenanceMessage', e.target.value)}
                className="w-full px-3 py-2 bg-white text-ink text-xs rounded-xl border border-divider focus:outline-none focus:border-brand resize-none"
              />
              <span className="text-[10px] text-muted block">
                When active, non-admin users receive a 503 maintenance response on card creation.
              </span>
            </div>

            {/* Announcement Banner */}
            <div className="p-4 rounded-xl border border-divider bg-surface/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Global Announcement Banner
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.announcementActive}
                    onChange={(e) => handleChange('announcementActive', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-emerald-600" />
                </label>
              </div>

              <textarea
                rows={2}
                placeholder="e.g. 🚀 Ormayundo v2.0 is live! Try the new spaced repetition interval sliders."
                value={formData.announcementBanner}
                onChange={(e) => handleChange('announcementBanner', e.target.value)}
                className="w-full px-3 py-2 bg-white text-ink text-xs rounded-xl border border-divider focus:outline-none focus:border-brand resize-none"
              />
              <span className="text-[10px] text-muted block">
                Displayed at the top of users' web dashboard when enabled.
              </span>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
