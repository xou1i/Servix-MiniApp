import { useAppState } from '../hooks/useAppState';

function LanguageSwitch() {
  const { language, switchLanguage } = useAppState();

  return (
    <div className="flex items-center gap-1 rounded-full bg-[var(--surface-mid)] p-1">
      <button
        type="button"
        onClick={() => switchLanguage('en')}
        className={`cursor-pointer rounded-full px-4 py-1 text-xs font-bold transition-all duration-200 ${
          language === 'en'
            ? 'bg-white shadow-sm text-[var(--color-primary)]'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => switchLanguage('ar')}
        className={`cursor-pointer rounded-full px-4 py-1 text-xs font-bold transition-all duration-200 ${
          language === 'ar'
            ? 'bg-white shadow-sm text-[var(--color-primary)]'
            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
        }`}
        style={{ fontFamily: "'Cairo', sans-serif" }}
      >
        عربي
      </button>
    </div>
  );
}

export default LanguageSwitch;
