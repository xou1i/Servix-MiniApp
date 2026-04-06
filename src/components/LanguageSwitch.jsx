import { Languages } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';

function LanguageSwitch() {
  const { language, switchLanguage } = useAppState();

  const toggleLanguage = () => {
    switchLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="group relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-(--surface-mid) text-(--text-secondary) transition-all duration-300 hover:bg-(--surface-high) hover:text-(--text-primary) hover:scale-105 active:scale-95 shadow-sm border border-(--surface-high)/50"
      aria-label={language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}
    >
      <Languages size={20} className="transition-transform duration-500 group-hover:rotate-12" />
      
      <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-lg bg-(--color-primary) text-[10px] font-black text-white shadow-md ring-2 ring-(--surface-low) uppercase transition-all duration-300 group-hover:scale-110 group-active:scale-90">
        {language}
      </span>
    </button>
  );
}

export default LanguageSwitch;
