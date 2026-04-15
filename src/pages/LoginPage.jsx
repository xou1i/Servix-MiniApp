import { useState } from 'react';
import { ChefHat, Coffee, User, Banknote, ArrowLeft, ArrowRight, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import { ROLES } from '../constants/roles';
import logoSrc from '../assets/Servix - Logo.png';

const ROLE_ICONS = {
  waiter:  User,
  chef:    ChefHat,
  barista: Coffee,
  cashier: Banknote,
};

// ─── Step 1: Role Selection ────────────────────────────────────────────────
function RoleSelectionStep({ onSelect, isAr }) {
  return (
    <div className="w-full max-w-5xl animate-slide-up">
      <div className="mb-12 flex flex-col items-center text-center">
        <img src={logoSrc} alt="Servix" className="h-12 w-auto mb-8" />
        <h1 className="font-headline text-4xl font-bold text-[var(--color-primary)] tracking-tight mb-3">
          {isAr ? 'مرحباً بك في سيرفيكس' : 'Welcome to Servix'}
        </h1>
        <p className="text-base text-[var(--text-secondary)] max-w-sm">
          {isAr ? 'اختر دورك للمتابعة' : 'Select your role to continue'}
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Object.values(ROLES).map((role, i) => {
          const Icon  = ROLE_ICONS[role.key] ?? User;
          const label = isAr ? role.labelAr : role.labelEn;
          const hint  = isAr ? role.hintAr  : role.hintEn;

          return (
            <button
              key={role.key}
              type="button"
              onClick={() => onSelect(role.key)}
              className="glass-panel group flex cursor-pointer flex-col items-center rounded-3xl p-7 text-center transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40 animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110"
                style={{ background: `${role.color}18` }}
              >
                <Icon size={28} style={{ color: role.color }} strokeWidth={1.75} />
              </div>

              <h3 className="font-headline text-lg font-bold mb-1.5" style={{ color: role.color }}>
                {label}
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-5">{hint}</p>

              <div
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 group-hover:text-white"
                style={{ borderColor: role.color, color: role.color }}
                onMouseEnter={e => { e.currentTarget.style.background = role.color; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                {isAr
                  ? <ArrowLeft  size={14} strokeWidth={2.5} />
                  : <ArrowRight size={14} strokeWidth={2.5} />
                }
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 2: Credentials Form ──────────────────────────────────────────────
function CredentialsStep({ roleKey, onBack, onLogin, isAr }) {
  const role = ROLES[roleKey];
  const Icon = ROLE_ICONS[roleKey] ?? User;

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError(isAr ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await onLogin(email.trim(), password, roleKey);
    } catch (err) {
      // error is set inside useAuth; we just surface it here
      setError(
        err.message ||
        (isAr ? 'فشل تسجيل الدخول. تحقق من البيانات.' : 'Login failed. Check your credentials.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-slide-up" dir={isAr ? 'rtl' : 'ltr'}>

      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-8 group"
      >
        {isAr
          ? <><ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /> {isAr ? 'تغيير الدور' : 'Change role'}</>
          : <><ArrowLeft  size={16} className="group-hover:-translate-x-1 transition-transform" /> Change role</>
        }
      </button>

      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <img src={logoSrc} alt="Servix" className="h-10 w-auto mb-6" />

        {/* Role badge */}
        <div
          className="flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-5 border"
          style={{ background: `${role.color}12`, borderColor: `${role.color}30`, color: role.color }}
        >
          <Icon size={18} strokeWidth={1.75} />
          <span className="font-bold text-sm">{isAr ? role.labelAr : role.labelEn}</span>
        </div>

        <h2 className="font-headline text-2xl font-bold text-[var(--text-primary)] mb-1">
          {isAr ? 'تسجيل الدخول' : 'Sign In'}
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          {isAr ? 'أدخل بيانات حسابك للمتابعة' : 'Enter your account credentials'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-8 space-y-5">

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm font-medium animate-fade-in">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Email */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            {isAr ? 'البريد الإلكتروني' : 'Email'}
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder={isAr ? 'example@restaurant.com' : 'you@restaurant.com'}
            value={email}
            onChange={e => { setEmail(e.target.value); setError(null); }}
            className="w-full rounded-xl border border-[var(--surface-high)] bg-[var(--surface-low)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            {isAr ? 'كلمة المرور' : 'Password'}
          </label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(null); }}
              className="w-full rounded-xl border border-[var(--surface-high)] bg-[var(--surface-low)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute top-1/2 -translate-y-1/2 right-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              tabIndex={-1}
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full btn-primary py-4 rounded-2xl text-sm font-bold tracking-wide flex items-center justify-center gap-2 transition-all ${
            loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl active:scale-[0.98]'
          }`}
          style={{ background: role.color }}
        >
          {loading
            ? <><Loader2 size={18} className="animate-spin" /> {isAr ? 'جاري الدخول...' : 'Signing in...'}</>
            : isAr ? 'دخول' : 'Sign In'
          }
        </button>
      </form>
    </div>
  );
}

// ─── Main LoginPage ────────────────────────────────────────────────────────
export default function LoginPage({ onLogin }) {
  const { language } = useAppState();
  const isAr = language !== 'en';

  const [selectedRole, setSelectedRole] = useState(null);

  return (
    <section
      className="flex min-h-screen flex-col items-center justify-center p-6 relative"
      style={{
        background:
          'radial-gradient(circle at 15% 15%, rgba(29,78,137,0.06) 0%, transparent 55%),' +
          'radial-gradient(circle at 85% 85%, rgba(31,168,155,0.06) 0%, transparent 55%),' +
          'var(--surface)',
      }}
    >
      {!selectedRole
        ? <RoleSelectionStep onSelect={setSelectedRole} isAr={isAr} />
        : <CredentialsStep
            roleKey={selectedRole}
            onBack={() => setSelectedRole(null)}
            onLogin={onLogin}
            isAr={isAr}
          />
      }

      <p className="absolute bottom-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]/50">
        {isAr ? '© 2026 سيرفيكس — نظام إدارة المطاعم' : '© 2026 Servix — Restaurant Operations System'}
      </p>
    </section>
  );
}
