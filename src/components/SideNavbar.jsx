import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingBag, Bell, User, LogOut, Menu, X } from 'lucide-react';
import { ROLES } from '../constants/roles';
import { useAppState } from '../hooks/useAppState';
import LanguageSwitch from './LanguageSwitch';
import logoSrc from '../assets/Servix - Logo.png';
import iconSrc from '../assets/Servix - Icon.png';

const NAV_ITEMS = [
  { to: '/orders', Icon: ShoppingBag, labelAr: 'الطلبات', labelEn: 'Orders' },
  { to: '/notifications', Icon: Bell, labelAr: 'التنبيهات', labelEn: 'Notifications' },
  { to: '/profile', Icon: User, labelAr: 'الملف', labelEn: 'Profile' },
];

function SideNavbar({ roleKey, logout }) {
  const { notifications, language } = useAppState();
  const isAr = language !== 'en';
  const unread = notifications.filter((n) => !n.read).length;
  const role = ROLES[roleKey];
  const [mobileOpen, setMobileOpen] = useState(false);

  const roleColor = role?.color ?? '#1D4E89';
  const roleLabel = (isAr ? role?.labelAr : role?.labelEn) ?? roleKey;

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="px-3 py-5 mb-2">
        <img src={logoSrc} alt="Servix" className="h-8 w-auto" />
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 px-2">
        {NAV_ITEMS.map(({ to, Icon, labelAr, labelEn }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 ease-out relative ${isActive
                ? 'bg-white text-[var(--color-primary)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-mid)] hover:text-[var(--text-primary)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span>{isAr ? labelAr : labelEn}</span>
                {to === '/notifications' && unread > 0 && (
                  <span className="ms-auto rounded-full bg-[var(--color-primary)] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: language + role badge + logout */}
      <div className="mt-auto space-y-3 px-2 pb-4">
        <div className="px-2">
          <LanguageSwitch />
        </div>

        {/* Role badge */}
        <div
          className="mx-2 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5"
          style={{ background: `${roleColor}15` }}
        >
          <div
            className="h-7 w-7 shrink-0 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ background: roleColor }}
          >
            {roleLabel.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold truncate" style={{ color: roleColor }}>
              {roleLabel}
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">{isAr ? 'الدور الحالي' : 'Current role'}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={logout}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[var(--text-muted)] transition-all duration-200 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={17} />
          {isAr ? 'تسجيل الخروج' : 'Logout'}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex h-full w-60 shrink-0 flex-col glass-nav border-e border-[var(--surface-high)] overflow-y-auto">
        <NavContent />
      </aside>

      {/* ── Mobile top bar ───────────────────────────────────────────────── */}
      <header className="md:hidden flex items-center justify-between glass-nav border-b border-[var(--surface-high)] px-4 py-3">
        <img src={iconSrc} alt="Servix" className="h-8 w-auto" />
        <div className="flex items-center gap-2">
          {/* Notification dot */}
          {unread > 0 && (
            <span className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
          )}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="btn-ghost rounded-xl p-2"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 flex"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-64 h-full glass-nav flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <NavContent />
          </div>
          <div className="flex-1 bg-black/20 backdrop-blur-sm" />
        </div>
      )}
    </>
  );
}

export default SideNavbar;
