import { useState } from 'react';
import { AppProvider, useApp, t } from './contexts/AppContext';
import Header from './components/Header';
import DataInput from './components/DataInput';
import Dashboard from './components/Dashboard';
import StudentCategories from './components/StudentCategories';
import SkillsMatrix from './components/SkillsMatrix';
import PlansExercises from './components/PlansExercises';
import WorksheetGenerator from './components/WorksheetGenerator';
import ApiSettings from './components/ApiSettings';
import { Database, LayoutDashboard, Users, Grid3X3, BookOpen, Trash2, FileSpreadsheet } from 'lucide-react';

const NAV_ITEMS = [
  { key: 'input', labelKey: 'dataInput', icon: Database },
  { key: 'dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
  { key: 'categories', labelKey: 'studentCategories', icon: Users },
  { key: 'skills', labelKey: 'skillsMatrix', icon: Grid3X3 },
  { key: 'plans', labelKey: 'remedialPlan', icon: BookOpen },
  { key: 'worksheet', labelKey: 'worksheetGenerator', icon: FileSpreadsheet },
];

function AppContent() {
  const { state, dispatch } = useApp();
  const { language, activeTab, students } = state;
  const [settingsOpen, setSettingsOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'input': return <DataInput />;
      case 'dashboard': return <Dashboard />;
      case 'categories': return <StudentCategories />;
      case 'skills': return <SkillsMatrix />;
      case 'plans': return <PlansExercises />;
      case 'worksheet': return <WorksheetGenerator />;
      default: return <DataInput />;
    }
  };

  return (
    <div className={`min-h-screen ${state.theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'} transition-colors duration-300`}>
      <Header onOpenSettings={() => setSettingsOpen(true)} />

      {/* Navigation */}
      <div className="sticky top-[57px] z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              const isDisabled = item.key !== 'input' && students.length === 0;
              return (
                <button
                  key={item.key}
                  onClick={() => !isDisabled && dispatch({ type: 'SET_TAB', payload: item.key })}
                  disabled={isDisabled}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : isDisabled
                        ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t(item.labelKey, language)}
                </button>
              );
            })}
            {students.length > 0 && (
              <button
                onClick={() => {
                  if (confirm(language === 'ar' ? 'هل أنت متأكد من مسح جميع البيانات؟' : 'Are you sure you want to clear all data?')) {
                    dispatch({ type: 'CLEAR_DATA' });
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all ms-auto"
              >
                <Trash2 className="w-4 h-4" />
                {t('clearData', language)}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-slate-400">
          <p>{language === 'ar' ? 'تحليل نواتج التعلم - مدعوم بالذكاء الاصطناعي' : 'Learning Outcomes Analyzer - AI Powered'}</p>
          <p className="mt-1 text-xs">
            {language === 'ar' ? 'يستخدم NVIDIA NIM API لتوليد التوصيات والخطط العلاجية' : 'Uses NVIDIA NIM API for generating recommendations and plans'}
          </p>
        </div>
      </footer>

      <ApiSettings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
