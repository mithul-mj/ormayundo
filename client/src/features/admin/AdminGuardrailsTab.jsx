import { useState } from 'react';
import {
  Save,
  Cpu,
  Sliders,
  AlertTriangle,
  Megaphone,
  Bell,
  CheckCircle,
  Key,
  Plus,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { adminApi } from './api/adminApi';
import { Toggle, Select, Modal } from '../../shared/components';
import { GUARDRAILS, UI_TIMERS } from '../../shared/constants';

const AVAILABLE_MODELS = [
  { value: 'openai/gpt-oss-120b', label: 'openai/gpt-oss-120b', badge: 'High Capability', description: 'Groq flagship performance' },
  { value: 'llama-3.3-70b-versatile', label: 'llama-3.3-70b-versatile', badge: 'Fast & Reliable', description: 'Low latency reasoning' },
  { value: 'mixtral-8x7b-32768', label: 'mixtral-8x7b-32768', badge: 'High Context', description: '32k token window' },
  { value: 'deepseek-r1-distill-llama-70b', label: 'deepseek-r1-distill-llama-70b', badge: 'Reasoning', description: 'Math and deep logic' },
];

const PROVIDER_DEFAULTS = {
  groq: {
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'llama-3.3-70b-versatile',
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
  },
  deepseek: {
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
  },
  cerebras: {
    baseUrl: 'https://api.cerebras.ai/v1',
    model: 'llama3.1-70b',
  },
  custom: {
    baseUrl: '',
    model: '',
  },
};

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
    apiSlots: config?.apiSlots || [],
    ...(config || {}),
  }));

  const [saving, setSaving] = useState(false);
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [newSlot, setNewSlot] = useState({
    name: '',
    provider: 'groq',
    apiKey: '',
    baseUrl: PROVIDER_DEFAULTS.groq.baseUrl,
    model: PROVIDER_DEFAULTS.groq.model,
    isActive: true,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProviderSelect = (provider) => {
    const defaults = PROVIDER_DEFAULTS[provider] || PROVIDER_DEFAULTS.custom;
    setNewSlot((prev) => ({
      ...prev,
      provider,
      baseUrl: defaults.baseUrl,
      model: defaults.model,
    }));
  };

  const handleAddSlot = (e) => {
    e.preventDefault();
    if (!newSlot.apiKey.trim()) {
      Swal.fire('Error', 'API Key cannot be empty', 'error');
      return;
    }

    const slotToAdd = {
      slotId: `slot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: newSlot.name.trim() || `${newSlot.provider.toUpperCase()} Slot`,
      provider: newSlot.provider,
      apiKey: newSlot.apiKey.trim(),
      maskedKey: newSlot.apiKey.slice(0, 4) + '••••••••' + newSlot.apiKey.slice(-4),
      baseUrl: newSlot.baseUrl.trim(),
      model: newSlot.model.trim(),
      isActive: newSlot.isActive,
      isCoolingDown: false,
      cooldownRemainingSeconds: 0,
      createdAt: new Date(),
    };

    setFormData((prev) => ({
      ...prev,
      apiSlots: [...(prev.apiSlots || []), slotToAdd],
    }));

    setShowAddSlotModal(false);
    setNewSlot({
      name: '',
      provider: 'groq',
      apiKey: '',
      baseUrl: PROVIDER_DEFAULTS.groq.baseUrl,
      model: PROVIDER_DEFAULTS.groq.model,
      isActive: true,
    });
  };

  const handleToggleSlot = (slotId) => {
    setFormData((prev) => ({
      ...prev,
      apiSlots: (prev.apiSlots || []).map((slot) =>
        slot.slotId === slotId ? { ...slot, isActive: !slot.isActive } : slot
      ),
    }));
  };

  const handleRemoveSlot = (slotId) => {
    setFormData((prev) => ({
      ...prev,
      apiSlots: (prev.apiSlots || []).filter((slot) => slot.slotId !== slotId),
    }));
  };

  const handleResetCooldown = async (slotId) => {
    try {
      await adminApi.resetSlotCooldown(slotId);
      setFormData((prev) => ({
        ...prev,
        apiSlots: (prev.apiSlots || []).map((slot) =>
          slot.slotId === slotId ? { ...slot, isCoolingDown: false, cooldownRemainingSeconds: 0 } : slot
        ),
      }));
      Swal.fire({
        icon: 'success',
        title: 'Cooldown Cleared',
        text: 'The Redis rate-limit cooldown was removed.',
        timer: UI_TIMERS.ALERT_SHORT_MS,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire('Error', err.extractedMessage || err.message, 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await onUpdateConfig(formData);
      Swal.fire({
        icon: 'success',
        title: 'Settings Saved',
        text: 'Platform guardrails and API key pool updated successfully.',
        timer: UI_TIMERS.ALERT_MEDIUM_MS,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const slots = formData.apiSlots || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {/* Top Action Bar */}
      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-neutral-900 hover:bg-black text-white font-semibold text-xs transition-all cursor-pointer disabled:opacity-50 shrink-0 shadow-xs"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Section: API Key Slots & Cascade Failover Pool */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-brand" />
              Dynamic API Key Pool &amp; Automatic Cascade Failover
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Slot 1 is used first. If a key hits HTTP 429 quota exhaustion, Redis puts it on automatic cooldown (TTL) and cascades to the next slot seamlessly.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddSlotModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold border border-gray-200 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Key Slot</span>
          </button>
        </div>

        {slots.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400">
            No dedicated slots configured yet. System will use environment default <code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-700">process.env.AI_API_KEY</code>.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {slots.map((slot, index) => (
              <div
                key={slot.slotId || index}
                className="p-4 rounded-xl border border-gray-200/80 bg-neutral-50/50 flex flex-col justify-between gap-3 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-neutral-200 text-neutral-700 text-[10px] font-bold flex items-center justify-center">
                        #{index + 1}
                      </span>
                      <h4 className="font-bold text-xs text-neutral-900">{slot.name}</h4>
                    </div>
                    <p className="text-[11px] text-neutral-500 font-mono mt-1">
                      {slot.model || 'llama-3.3-70b-versatile'} &bull; <span className="uppercase">{slot.provider}</span>
                    </p>
                    <p className="text-[11px] font-mono text-neutral-600 mt-0.5">
                      {slot.maskedKey || '••••••••'}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    {slot.isCoolingDown ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                        Cooling down ({slot.cooldownRemainingSeconds || 0}s)
                      </span>
                    ) : slot.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 border border-neutral-200 text-[10px] font-bold">
                        Paused
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200/60 text-xs">
                  <button
                    type="button"
                    onClick={() => handleToggleSlot(slot.slotId)}
                    className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer"
                  >
                    {slot.isActive ? 'Pause Slot' : 'Activate Slot'}
                  </button>

                  <div className="flex items-center gap-2">
                    {slot.isCoolingDown && (
                      <button
                        type="button"
                        onClick={() => handleResetCooldown(slot.slotId)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:underline cursor-pointer"
                        title="Clear Redis TTL Cooldown"
                      >
                        <RotateCcw className="w-3 h-3" /> Clear Cooldown
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(slot.slotId)}
                      className="p-1 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Remove Slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid: 2 Columns (Open, Minimalistic Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: AI Engine & Token Guardrails */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-neutral-700" />
              AI Model &amp; Generation Controls
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">Model selection and inference parameters</p>
          </div>

          <div className="py-1">
            <Toggle
              checked={formData.aiEnabled}
              onChange={(checked) => handleChange('aiEnabled', checked)}
              label="AI Generation Engine"
              description={formData.aiEnabled ? 'Actively generating flashcards via pool' : 'Generation paused by admin kill-switch'}
              variant="brand"
              size="md"
            />
          </div>

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

          <div>
            <Select
              label="Fallback Groq Model"
              value={formData.aiFallbackModel}
              onChange={(val) => handleChange('aiFallbackModel', val)}
              options={AVAILABLE_MODELS}
              variant="rounded"
              className="w-full"
            />
            <span className="text-[11px] text-neutral-400 block mt-1">
              Engages automatically if the primary model reaches rate limits.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Temperature ({formData.aiTemperature})
              </label>
              <input
                type="range"
                min={GUARDRAILS.TEMPERATURE.MIN}
                max={GUARDRAILS.TEMPERATURE.MAX}
                step={GUARDRAILS.TEMPERATURE.STEP}
                value={formData.aiTemperature}
                onChange={(e) => handleChange('aiTemperature', parseFloat(e.target.value))}
                className="w-full accent-neutral-900 cursor-pointer"
              />
              <span className="text-[10px] text-neutral-400 block mt-1">Lower = focused, Higher = creative</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Max Output Tokens ({formData.aiMaxTokens})
              </label>
              <input
                type="number"
                min={GUARDRAILS.MAX_TOKENS.MIN}
                max={GUARDRAILS.MAX_TOKENS.MAX}
                step={GUARDRAILS.MAX_TOKENS.STEP}
                value={formData.aiMaxTokens}
                onChange={(e) => handleChange('aiMaxTokens', parseInt(e.target.value) || GUARDRAILS.MAX_TOKENS.DEFAULT)}
                className="w-full px-3.5 py-2 bg-neutral-50 text-neutral-900 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Rate Limits & Highlights */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-neutral-700" />
              Student Quotas &amp; Abuse Prevention
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">Payload bounds and spaced repetition notifications</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              Daily Flashcard Generation Limit ({formData.dailyCardLimit} cards/day)
            </label>
            <input
              type="range"
              min={GUARDRAILS.DAILY_CARD_LIMIT.MIN}
              max={GUARDRAILS.DAILY_CARD_LIMIT.MAX}
              step={GUARDRAILS.DAILY_CARD_LIMIT.STEP}
              value={formData.dailyCardLimit}
              onChange={(e) => handleChange('dailyCardLimit', parseInt(e.target.value))}
              className="w-full accent-neutral-900 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-400 font-medium mt-1">
              <span>{GUARDRAILS.DAILY_CARD_LIMIT.MIN} Cards</span>
              <span>{Math.round((GUARDRAILS.DAILY_CARD_LIMIT.MAX + GUARDRAILS.DAILY_CARD_LIMIT.MIN) / 2)} Cards</span>
              <span>{GUARDRAILS.DAILY_CARD_LIMIT.MAX} Cards</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              Max Allowed Highlight Text Length (Chars)
            </label>
            <input
              type="number"
              min={GUARDRAILS.TEXT_LENGTH.MIN}
              max={GUARDRAILS.TEXT_LENGTH.MAX}
              step={GUARDRAILS.TEXT_LENGTH.STEP}
              value={formData.maxTextLength}
              onChange={(e) => handleChange('maxTextLength', parseInt(e.target.value) || GUARDRAILS.TEXT_LENGTH.DEFAULT)}
              className="w-full px-3.5 py-2 bg-neutral-50 text-neutral-900 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div className="py-1">
            <Toggle
              checked={formData.pushNotificationsEnabled}
              onChange={(checked) => handleChange('pushNotificationsEnabled', checked)}
              label={
                <span className="flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-neutral-700" />
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
        </div>

        {/* Section 3: Maintenance Mode & Announcements */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-neutral-700" />
              Maintenance &amp; Global Announcements
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">Control web app accessibility and student notifications</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Toggle
                checked={formData.maintenanceMode}
                onChange={(checked) => handleChange('maintenanceMode', checked)}
                label={
                  <span className="flex items-center gap-1.5 text-red-600 font-semibold">
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
                className="w-full px-3.5 py-2 bg-neutral-50 text-neutral-900 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-neutral-900 resize-none"
              />
            </div>

            <div className="space-y-3">
              <Toggle
                checked={formData.announcementActive}
                onChange={(checked) => handleChange('announcementActive', checked)}
                label={
                  <span className="flex items-center gap-1.5 font-semibold text-neutral-900">
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
                placeholder="e.g. 🚀 Ormayundo is updated with enhanced spaced repetition intervals!"
                value={formData.announcementBanner}
                onChange={(e) => handleChange('announcementBanner', e.target.value)}
                className="w-full px-3.5 py-2 bg-neutral-50 text-neutral-900 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-neutral-900 resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end pt-2 pb-6">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-neutral-900 hover:bg-black text-white font-semibold text-xs transition-all cursor-pointer disabled:opacity-50 shrink-0 shadow-xs"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Add Slot Modal */}
      <Modal
        isOpen={showAddSlotModal}
        onClose={() => setShowAddSlotModal(false)}
        title="Add AI Provider Slot"
      >
        <form onSubmit={handleAddSlot} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              Slot Name / Identifier
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Groq Fallback 2"
              value={newSlot.name}
              onChange={(e) => setNewSlot({ ...newSlot, name: e.target.value })}
              className="w-full px-3.5 py-2 bg-white text-neutral-900 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              Provider
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {['groq', 'openai', 'deepseek', 'cerebras', 'custom'].map((prov) => (
                <button
                  key={prov}
                  type="button"
                  onClick={() => handleProviderSelect(prov)}
                  className={[
                    'px-2 py-1.5 rounded-lg text-xs font-semibold uppercase transition-colors cursor-pointer border',
                    newSlot.provider === prov
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-neutral-50 text-neutral-600 border-gray-200 hover:bg-neutral-100',
                  ].join(' ')}
                >
                  {prov}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-1">
              API Key (Encrypted at rest with AES-256-GCM)
            </label>
            <input
              type="password"
              required
              placeholder="gsk_... or sk-..."
              value={newSlot.apiKey}
              onChange={(e) => setNewSlot({ ...newSlot, apiKey: e.target.value })}
              className="w-full px-3.5 py-2 bg-white text-neutral-900 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-neutral-900 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Base URL
              </label>
              <input
                type="text"
                required
                value={newSlot.baseUrl}
                onChange={(e) => setNewSlot({ ...newSlot, baseUrl: e.target.value })}
                className="w-full px-3.5 py-2 bg-white text-neutral-900 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-neutral-900 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-800 mb-1">
                Model Name
              </label>
              <input
                type="text"
                required
                value={newSlot.model}
                onChange={(e) => setNewSlot({ ...newSlot, model: e.target.value })}
                className="w-full px-3.5 py-2 bg-white text-neutral-900 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-neutral-900 font-mono text-[11px]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setShowAddSlotModal(false)}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-neutral-900 hover:bg-black text-white text-xs font-semibold cursor-pointer"
            >
              Add Slot
            </button>
          </div>
        </form>
      </Modal>
    </form>
  );
}
