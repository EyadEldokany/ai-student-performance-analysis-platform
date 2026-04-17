import { useApp, t } from '../contexts/AppContext';
import { Moon, Sun, Languages, Settings, GraduationCap, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { state, dispatch } = useApp();
  const { theme, language } = state;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                {t('appName', language)}
              </h1>
            </div>
          </div>

          {/* Desktop controls */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => dispatch({ type: 'SET_LANGUAGE', payload: language === 'ar' ? 'en' : 'ar' })}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title={language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
            >
              <Languages className="w-4 h-4" />
              <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            <button
              onClick={() => dispatch({ type: 'SET_THEME', payload: theme === 'dark' ? 'light' : 'dark' })}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="sm:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <button
              onClick={() => { dispatch({ type: 'SET_LANGUAGE', payload: language === 'ar' ? 'en' : 'ar' }); setMobileMenuOpen(false); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Languages className="w-4 h-4" />
              <span>{language === 'ar' ? 'English' : 'عربي'}</span>
            </button>
            <button
              onClick={() => { dispatch({ type: 'SET_THEME', payload: theme === 'dark' ? 'light' : 'dark' }); setMobileMenuOpen(false); }}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => { onOpenSettings(); setMobileMenuOpen(false); }}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
