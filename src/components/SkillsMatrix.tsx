import { useApp, t } from '../contexts/AppContext';
import { Grid3X3, CheckCircle, XCircle, MinusCircle } from 'lucide-react';

export default function SkillsMatrix() {
  const { state } = useApp();
  const { students, subjects, language, maxScore } = state;

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Grid3X3 className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg">{t('noData', language)}</p>
      </div>
    );
  }

  const getGradeStyle = (grade: number) => {
    const pct = (grade / maxScore) * 100;
    if (pct >= 90) return { bg: 'bg-emerald-500', text: 'text-white', icon: <CheckCircle className="w-3 h-3" /> };
    if (pct >= 80) return { bg: 'bg-blue-500', text: 'text-white', icon: <CheckCircle className="w-3 h-3" /> };
    if (pct >= 70) return { bg: 'bg-purple-500', text: 'text-white', icon: <MinusCircle className="w-3 h-3" /> };
    if (pct >= 60) return { bg: 'bg-amber-500', text: 'text-white', icon: <MinusCircle className="w-3 h-3" /> };
    return { bg: 'bg-red-500', text: 'text-white', icon: <XCircle className="w-3 h-3" /> };
  };

  // Calculate mastery percentage per subject
  const subjectMastery = subjects.map(sub => {
    const passingCount = students.filter(s => (s.grades[sub] ?? 0) >= maxScore * 0.6).length;
    return {
      subject: sub,
      mastery: ((passingCount / students.length) * 100).toFixed(1),
      avg: (students.reduce((sum, s) => sum + (s.grades[sub] ?? 0), 0) / students.length).toFixed(1),
    };
  });

  // Student skill gaps
  const studentGaps = students.map(s => {
    const weakSubjects = subjects.filter(sub => (s.grades[sub] ?? 0) < maxScore * 0.6);
    const strongSubjects = subjects.filter(sub => (s.grades[sub] ?? 0) >= maxScore * 0.9);
    return { ...s, weakSubjects, strongSubjects };
  }).sort((a, b) => a.averageScore - b.averageScore);

  return (
    <div className="space-y-6">
      {/* Skills Heatmap */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5 overflow-x-auto">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{t('skillsMatrix', language)}</h3>
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr>
              <th className="text-start px-3 py-2 font-semibold text-slate-600 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-800/50 z-10">
                {t('studentName', language)}
              </th>
              {subjects.map(sub => (
                <th key={sub} className="text-center px-2 py-2 font-semibold text-slate-600 dark:text-slate-300">
                  <div className="rotate-0 text-xs whitespace-nowrap">{sub}</div>
                </th>
              ))}
              <th className="text-center px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">{t('average', language)}</th>
            </tr>
          </thead>
          <tbody>
            {students.sort((a, b) => b.averageScore - a.averageScore).map(student => (
              <tr key={student.id} className="border-b border-slate-100 dark:border-slate-700/30">
                <td className="px-3 py-2 font-medium text-slate-800 dark:text-white sticky left-0 bg-white dark:bg-slate-800/50 z-10 whitespace-nowrap">
                  {student.name}
                </td>
                {subjects.map(sub => {
                  const grade = student.grades[sub] ?? 0;
                  const style = getGradeStyle(grade);
                  return (
                    <td key={sub} className="text-center px-1 py-1">
                      <div className={`inline-flex items-center justify-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${style.bg} ${style.text} min-w-[40px]`}>
                        {style.icon}
                        {grade}
                      </div>
                    </td>
                  );
                })}
                <td className="text-center px-3 py-2 font-bold text-slate-800 dark:text-white">
                  {student.averageScore.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 flex-wrap text-sm">
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-emerald-500" /> {language === 'ar' ? 'ممتاز (90+)' : 'Excellent (90+)'}</div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-blue-500" /> {language === 'ar' ? 'جيد جداً (80-89)' : 'Very Good (80-89)'}</div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-purple-500" /> {language === 'ar' ? 'جيد (70-79)' : 'Good (70-79)'}</div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-amber-500" /> {language === 'ar' ? 'مقبول (60-69)' : 'Acceptable (60-69)'}</div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-4 rounded bg-red-500" /> {language === 'ar' ? 'ضعيف (<60)' : 'Weak (<60)'}</div>
      </div>

      {/* Subject Mastery */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
          {language === 'ar' ? 'نسبة إتقان كل مادة' : 'Subject Mastery Rate'}
        </h3>
        <div className="space-y-3">
          {subjectMastery.map(sm => (
            <div key={sm.subject} className="flex items-center gap-3">
              <span className="w-32 text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{sm.subject}</span>
              <div className="flex-1 h-8 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-end px-2 transition-all duration-500"
                  style={{ width: `${Math.max(Number(sm.mastery), 5)}%` }}
                >
                  <span className="text-xs font-bold text-white">{sm.mastery}%</span>
                </div>
              </div>
              <span className="text-sm text-slate-500 w-16 text-center">{language === 'ar' ? 'معدل' : 'Avg'}: {sm.avg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Student Skill Gaps */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
          {language === 'ar' ? 'تحليل الفجوات المهارية' : 'Skill Gap Analysis'}
        </h3>
        <div className="space-y-2">
          {studentGaps.filter(s => s.weakSubjects.length > 0).map(student => (
            <div key={student.id} className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-slate-800 dark:text-white">{student.name}</span>
                <span className="text-sm font-bold text-red-600 dark:text-red-400">{student.averageScore.toFixed(1)}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs text-red-600 dark:text-red-400">{language === 'ar' ? 'نقاط ضعف:' : 'Weak areas:'}</span>
                {student.weakSubjects.map(sub => (
                  <span key={sub} className="px-2 py-0.5 rounded-full bg-red-200 dark:bg-red-800/40 text-red-700 dark:text-red-300 text-xs font-medium">
                    {sub} ({student.grades[sub] ?? 0})
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
