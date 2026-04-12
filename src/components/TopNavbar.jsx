import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Clock,
  Bell,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { ROLES } from '../constants/roles';
import { useAppState } from '../hooks/useAppState';
import LanguageSwitch from './LanguageSwitch';
import iconSrc from '../assets/Servix - Icon.png';
import logoSrc from '../assets/Servix - Logo.png';

const NAV_ITEMS = [
  { to: '/orders',  Icon: ShoppingBag, labelAr: 'الطلبات',  labelEn: 'Orders' },
  { to: '/history', Icon: Clock,        labelAr: 'السجل',    labelEn: 'History' },
];

function TopNavbar({ roleKey, logout }) {
  const { notifications, language } = useAppState();
  const isAr = language !== 'en';
  const unread = notifications.filter((n) => !n.read).length;
  const role = ROLES[roleKey];
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const roleColor = role?.color ?? '#1D4E89';
  const roleLabel = (isAr ? role?.labelAr : role?.labelEn) ?? roleKey;


  return (
    <>
      {/* ── Floating Top Navbar ─────────────────────────────────────── */}
      <div className="topnav-wrapper">
        <nav className="topnav glass-topnav">
          {/* Logo */}
          <NavLink to="/orders" className="shrink-0 me-1">
            <img src={logoSrc} alt="Servix" className="h-7 w-auto hidden sm:block" />
            <img src={iconSrc} alt="Servix" className="h-8 w-auto sm:hidden" />
          </NavLink>

          <div className="hidden sm:flex items-center gap-0.5 ms-3 flex-1">
            {NAV_ITEMS.map(({ to, Icon, labelAr, labelEn }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `topnav-link ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={16} strokeWidth={2} />
                <span>{isAr ? labelAr : labelEn}</span>
              </NavLink>
            ))}
          </div>

          {/* Spacer for mobile */}
          <div className="flex-1 sm:hidden" />

          {/* Right-side controls */}
          <div className="flex items-center gap-1.5">
            {/* Role badge (desktop) */}
            <div
              className="hidden md:flex items-center gap-2 rounded-xl px-2.5 py-1.5 me-1"
              style={{ background: `${roleColor}12` }}
            >
              <div
                className="h-6 w-6 shrink-0 rounded-lg flex items-center justify-center text-white text-[10px] font-bold"
                style={{ background: roleColor }}
              >
                {roleLabel.charAt(0)}
              </div>
              <span className="text-xs font-bold" style={{ color: roleColor }}>
                {roleLabel}
              </span>
            </div>

            {/* Language switch */}
            <LanguageSwitch />

            {/* Notifications */}
            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                `btn-icon relative ${isActive ? 'bg-[var(--surface-mid)] text-[var(--color-primary)]' : ''}`
              }
              title={isAr ? 'التنبيهات' : 'Notifications'}
            >
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute -top-0.5 -end-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-primary)] text-[9px] font-bold text-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </NavLink>

            {/* Profile */}
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `btn-icon ${isActive ? 'bg-[var(--surface-mid)] text-[var(--color-primary)]' : ''}`
              }
              title={isAr ? 'الملف الشخصي' : 'Profile'}
            >
              <User size={18} />
            </NavLink>

            {/* Logout (desktop) */}
            <button
              type="button"
              onClick={logout}
              className="btn-icon hidden sm:inline-flex text-[var(--text-muted)] hover:!text-red-600 hover:!bg-red-50"
              title={isAr ? 'تسجيل الخروج' : 'Logout'}
            >
              <LogOut size={17} />
            </button>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="btn-icon hamburger-btn"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </div>

      {/* ── Mobile Dropdown ────────────────────────────────────────── */}
      {mobileOpen && (
        <>
          <div
            className="mobile-nav-overlay animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="mobile-nav-panel glass-topnav animate-slide-down">
            {/* Role badge (mobile) */}
            <div
              className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 mb-2"
              style={{ background: `${roleColor}12` }}
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
                <p className="text-[10px] text-[var(--text-muted)]">
                  {isAr ? 'الدور الحالي' : 'Current role'}
                </p>
              </div>
            </div>

            {NAV_ITEMS.map(({ to, Icon, labelAr, labelEn }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `mobile-nav-link ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={18} strokeWidth={2} />
                <span>{isAr ? labelAr : labelEn}</span>
              </NavLink>
            ))}

            {/* Logout (mobile) */}
            <button
              type="button"
              onClick={() => { setMobileOpen(false); logout(); }}
              className="mobile-nav-link w-full text-red-500 hover:!bg-red-50 hover:!text-red-600 mt-1 border-t border-[var(--surface-high)] pt-2"
            >
              <LogOut size={17} />
              <span>{isAr ? 'تسجيل الخروج' : 'Logout'}</span>
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default TopNavbar;
