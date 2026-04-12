import { useState } from 'react';
import { ChefHat, Coffee, User, Banknote } from 'lucide-react';
import LanguageSwitch from '../components/LanguageSwitch';
import { useAppState } from '../hooks/useAppState';
import { ROLES } from '../constants/roles';
import logoSrc from '../assets/Servix - Logo.png';

const ROLE_ICONS = {
  waiter: User,
  chef: ChefHat,
  barista: Coffee,
  cashier: Banknote,
};

function LoginPage({ setRole }) {
  const { language } = useAppState();
  const isAr = language !== 'en';

  return (
    <section
      className="flex min-h-screen flex-col items-center justify-center p-6 relative"
      style={{
        background: 'radial-gradient(circle at 15% 15%, rgba(29,78,137,0.06) 0%, transparent 55%), radial-gradient(circle at 85% 85%, rgba(31,168,155,0.06) 0%, transparent 55%), var(--surface)',
      }}
    >
      {/* Language toggle at top end */}
      <div className="absolute top-6 end-6">
        <LanguageSwitch />
      </div>

      {/* Logo + tagline */}
      <div className="mb-12 flex flex-col items-center text-center animate-slide-up">
        <img src={logoSrc} alt="Servix" className="h-12 w-auto mb-8" />
        <h1 className="font-headline text-4xl font-bold text-[var(--color-primary)] tracking-tight mb-3">
          {isAr ? 'مرحباً بك في سيرفيكس' : 'Welcome to Servix'}
        </h1>
        <p className="text-base text-[var(--text-secondary)] max-w-sm">
          {isAr
            ? 'اختر دورك للبدء في إدارة الطلبات المباشرة'
            : 'Select your role to access the operations dashboard'}
        </p>
      </div>

      {/* Role cards */}
      <div className="grid w-full max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Object.values(ROLES).map((role, index) => {
          const Icon = ROLE_ICONS[role.key] ?? User;
          const label = isAr ? role.labelAr : role.labelEn;
          const hint = isAr ? role.hintAr : role.hintEn;
          return (
            <button
              key={role.key}
              type="button"
              onClick={() => setRole(role.key)}
              className="glass-panel group flex cursor-pointer flex-col items-center rounded-3xl p-7 text-center transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40 animate-slide-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Icon circle */}
              <div
                className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-105"
                style={{ background: `${role.color}12` }}
              >
                <Icon size={28} style={{ color: role.color }} strokeWidth={1.75} />
              </div>

              <h3
                className="font-headline text-lg font-bold mb-1.5"
                style={{ color: role.color }}
              >
                {label}
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-5">
                {hint}
              </p>

              {/* CTA arrow */}
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 group-hover:text-white"
                style={{
                  borderColor: role.color,
                  color: role.color,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = role.color; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  {isAr
                    ? <><polyline points="15 18 9 12 15 6" /></>
                    : <><polyline points="9 18 15 12 9 6" /></>
                  }
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]/50">
        {isAr ? '© 2026 سيرفيكس — نظام إدارة المطاعم' : '© 2026 Servix — Restaurant Operations System'}
      </p>
    </section>
  );
}

export default LoginPage;
