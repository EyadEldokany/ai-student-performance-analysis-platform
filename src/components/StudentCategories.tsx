import { useState } from 'react';
import { useApp, t } from '../contexts/AppContext';
import { getLevelLabel, getLevelColor, getLevelBgClass } from '../utils/analysis';
import { StudentLevel } from '../types';
import { Users, ChevronDown, ChevronUp, User } from 'lucide-react';

const LEVELS: StudentLevel[] = ['excellent', 'veryGood', 'good', 'acceptable', 'weak'];
const LEVEL_ICONS = ['🏆', '⭐', '👍', '✅', '⚠️'];

export default function StudentCategories() {
  const { state } = useApp();
  const { students, subjects, language, maxScore } = state;
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Users className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg">{t('noData', language)}</p>
      </div>
    );
  }

  const filteredStudents = selectedSubject === 'all'
    ? students
    : students.map(s => {
        const grade = s.grades[selectedSubject] ?? 0;
        const avg = subjects.length > 0 ? grade : s.averageScore;
        const level = avg >= maxScore * 0.9 ? 'excellent' as const
          : avg >= maxScore * 0.8 ? 'veryGood' as const
          : avg >= maxScore * 0.7 ? 'good' as const
          : avg >= maxScore * 0.6 ? 'acceptable' as const
          : 'weak' as const;
        return { ...s, averageScore: avg, level };
      });

  const grouped = LEVELS.map(level => ({
    level,
    students: filteredStudents.filter(s => s.level === level).sort((a, b) => b.averageScore - a.averageScore),
  }));

  return (
    <div className="space-y-4">
      {/* Subject Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('selectSubject', language)}:</span>
        <button
          onClick={() => setSelectedSubject('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            selectedSubject === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          {t('allLevels', language)}
        </button>
        {subjects.map(sub => (
          <button
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              selectedSubject === sub
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      {/* Level Groups */}
      {grouped.map(({ level, students: levelStudents }, idx) => (
        <div key={level} className={`rounded-2xl border overflow-hidden ${getLevelBgClass(level, state.theme === 'dark')}`}>
          <button
            onClick={() => setExpandedLevel(expandedLevel === level ? null : level)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{LEVEL_ICONS[idx]}</span>
              <div className="text-start">
                <h3 className="font-bold text-lg" style={{ color: getLevelColor(level) }}>
                  {getLevelLabel(level, language)}
                </h3>
                <p className="text-sm opacity-70">
                  {levelStudents.length} {language === 'ar' ? 'طالب/ة' : 'student(s)'}
                  {' '}({((levelStudents.length / filteredStudents.length) * 100).toFixed(1)}%)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {levelStudents.length > 0 && (
                <div className="flex -space-x-2">
                  {levelStudents.slice(0, 5).map((s) => (
                    <div key={s.id} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-bold" style={{ backgroundColor: getLevelColor(level), color: '#fff' }}>
                      {s.name.charAt(0)}
                    </div>
                  ))}
                  {levelStudents.length > 5 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-400 flex items-center justify-center text-xs font-bold text-white">
                      +{levelStudents.length - 5}
                    </div>
                  )}
                </div>
              )}
              {expandedLevel === level ? <ChevronUp className="w-5 h-5 opacity-50" /> : <ChevronDown className="w-5 h-5 opacity-50" />}
            </div>
          </button>

          {expandedLevel === level && levelStudents.length > 0 && (
            <div className="border-t border-current/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-current/10">
                    <th className="text-start px-5 py-2 font-semibold">#</th>
                    <th className="text-start px-5 py-2 font-semibold">{t('studentName', language)}</th>
                    {subjects.map(sub => (
                      <th key={sub} className="text-center px-3 py-2 font-semibold">{sub}</th>
                    ))}
                    <th className="text-center px-5 py-2 font-semibold">{t('average', language)}</th>
                  </tr>
                </thead>
                <tbody>
                  {levelStudents.map((s, i) => (
                    <tr key={s.id} className="border-b border-current/5 hover:bg-black/5 dark:hover:bg-white/5">
                      <td className="px-5 py-2">{i + 1}</td>
                      <td className="px-5 py-2 font-medium">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 opacity-50" />
                          {s.name}
                        </div>
                      </td>
                      {subjects.map(sub => {
                        const grade = s.grades[sub] ?? 0;
                        const pct = (grade / maxScore) * 100;
                        return (
                          <td key={sub} className="text-center px-3 py-2">
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                              pct >= 90 ? 'text-emerald-600 dark:text-emerald-400' :
                              pct >= 80 ? 'text-blue-600 dark:text-blue-400' :
                              pct >= 70 ? 'text-purple-600 dark:text-purple-400' :
                              pct >= 60 ? 'text-amber-600 dark:text-amber-400' :
                              'text-red-600 dark:text-red-400'
                            }`}>
                              {grade}
                            </span>
                          </td>
                        );
                      })}
                      <td className="text-center px-5 py-2 font-bold">{s.averageScore.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {expandedLevel === level && levelStudents.length === 0 && (
            <div className="px-5 py-4 text-center opacity-50 border-t border-current/10">
              {t('noStudentsForLevel', language)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
