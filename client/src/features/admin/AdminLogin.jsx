import { useState } from 'react';
import axios from 'axios';
import {
  Brain,
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';
import { API_URL } from '../../shared/config';
import { ADMIN_DEFAULTS, MESSAGES } from '../../shared/constants';

export default function AdminLogin({ onLoginSuccess, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError(MESSAGES.ERROR.ADMIN_CREDENTIALS_REQUIRED);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post(
        `${API_URL}/auth/admin-login`,
        {
          email: email.trim(),
          password,
        },
        { withCredentials: true }
      );

      if (onLoginSuccess) {
        onLoginSuccess(res.data);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Authentication failed. Please verify administrator credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center px-4 sm:px-6 py-12 relative">
      {/* Back button pill */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 flex items-center gap-2 text-xs font-semibold text-muted hover:text-ink transition-colors cursor-pointer py-2 px-3.5 rounded-full bg-white border border-divider hover:shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Ormayundo</span>
        </button>
      )}

      <div className="w-full max-w-md animate-fade-in">
        {/* Floating Airbnb Style Card */}
        <div className="bg-white border border-divider rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mb-4 shadow-sm shadow-brand/15">
              <Brain className="w-7 h-7" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/60 text-brand text-[11px] font-bold tracking-wide uppercase mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs text-muted mt-1.5 max-w-xs leading-relaxed">
              Sign in with your configured administrator email and password to access platform guardrails.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs font-bold text-ink mb-1.5"
              >
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={ADMIN_DEFAULTS.EMAIL_PLACEHOLDER}
                  className="w-full pl-10 pr-4 py-3 bg-surface hover:bg-surface-hover border border-divider rounded-2xl text-ink text-sm placeholder:text-muted/60 focus:bg-white focus:outline-hidden focus:border-ink focus:ring-1 focus:ring-ink transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold text-ink mb-1.5"
              >
                Administrator Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-surface hover:bg-surface-hover border border-divider rounded-2xl text-ink text-sm placeholder:text-muted/60 focus:bg-white focus:outline-hidden focus:border-ink focus:ring-1 focus:ring-ink transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted hover:text-ink transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-full bg-brand hover:bg-brand-hover text-white font-bold text-sm tracking-wide shadow-md shadow-brand/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2 active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Sign In to Admin Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Seed Notice */}
          <div className="mt-6 pt-5 border-t border-divider text-center">
            <p className="text-[11px] text-muted leading-relaxed">
              Public registration is disabled. Admin accounts are provisioned via the seed script:{' '}
              <code className="text-ink font-semibold bg-surface px-1.5 py-0.5 rounded text-[10px] font-mono border border-divider">
                npm run seed:admin
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
