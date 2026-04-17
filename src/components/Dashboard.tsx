import { useApp, t } from '../contexts/AppContext';
import { getLevelLabel, getLevelColor, getLevelBgClass } from '../utils/analysis';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Users, TrendingUp, Award, BarChart3, Calculator, Target, ArrowUpDown, Minus, Maximize2, Info } from 'lucide-react';



function StatCard({ icon: Icon, label, value, color, sub }: { icon: React.ElementType; label: string; value: string | number; color: string; sub?: string }) {
  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {sub && <span className="text-xs text-slate-400">{sub}</span>}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function AnalysisCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30">
      <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
        <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-sm font-bold text-slate-800 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { state } = useApp();
  const { classAnalysis, students, language, maxScore } = state;

  if (!classAnalysis || students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <BarChart3 className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg">{t('noData', language)}</p>
      </div>
    );
  }

  const passRate = ((classAnalysis.levelDistribution.excellent + classAnalysis.levelDistribution.veryGood + classAnalysis.levelDistribution.good + classAnalysis.levelDistribution.acceptable) / classAnalysis.totalStudents * 100).toFixed(1);

  const overall = classAnalysis.overallAnalysis;

  // Subject averages for bar chart
  const subjectChartData = classAnalysis.subjectAnalyses.map(sa => ({
    name: sa.subjectName.length > 8 ? sa.subjectName.substring(0, 8) + '...' : sa.subjectName,
    fullName: sa.subjectName,
    average: Number(sa.analysis.mean.toFixed(1)),
    median: Number(sa.analysis.median.toFixed(1)),
    min: sa.analysis.min,
    max: sa.analysis.max,
  }));

  // Level distribution for pie chart
  const levels: Array<'excellent' | 'veryGood' | 'good' | 'acceptable' | 'weak'> = ['excellent', 'veryGood', 'good', 'acceptable', 'weak'];
  const levelPieData = levels.map(level => ({
    name: getLevelLabel(level, language),
    value: classAnalysis.levelDistribution[level],
    color: getLevelColor(level),
  })).filter(d => d.value > 0);

  // Radar chart data for subject performance
  const radarData = classAnalysis.subjectAnalyses.map(sa => ({
    subject: sa.subjectName.length > 6 ? sa.subjectName.substring(0, 6) + '..' : sa.subjectName,
    average: Number((sa.analysis.mean / maxScore * 100).toFixed(1)),
    fullMark: 100,
  }));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label={t('totalStudents', language)} value={classAnalysis.totalStudents} color="bg-gradient-to-br from-blue-500 to-blue-600" />
        <StatCard icon={TrendingUp} label={t('classAverage', language)} value={overall.mean.toFixed(1)} color="bg-gradient-to-br from-emerald-500 to-emerald-600" sub={`${t('stdDev', language)}: ${overall.standardDeviation.toFixed(2)}`} />
        <StatCard icon={Target} label={t('passRate', language)} value={`${passRate}%`} color="bg-gradient-to-br from-purple-500 to-purple-600" />
        <StatCard icon={Award} label={t('highestScore', language)} value={overall.max.toFixed(1)} color="bg-gradient-to-br from-amber-500 to-amber-600" sub={`${t('min', language)}: ${overall.min.toFixed(1)}`} />
      </div>

      {/* Statistical Analysis */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">{t('overallAnalysis', language)}</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <AnalysisCard icon={TrendingUp} label={t('mean', language)} value={overall.mean.toFixed(2)} />
          <AnalysisCard icon={ArrowUpDown} label={t('median', language)} value={overall.median.toFixed(2)} />
          <AnalysisCard icon={Maximize2} label={t('stdDev', language)} value={overall.standardDeviation.toFixed(2)} />
          <AnalysisCard icon={Info} label={t('variance', language)} value={overall.variance.toFixed(2)} />
          <AnalysisCard icon={Minus} label={t('range', language)} value={overall.range.toFixed(2)} />
          <AnalysisCard icon={Award} label={t('max', language)} value={overall.max.toFixed(2)} />
          <AnalysisCard icon={Target} label={t('min', language)} value={overall.min.toFixed(2)} />
          <AnalysisCard icon={TrendingUp} label={t('q1', language)} value={overall.q1.toFixed(2)} />
          <AnalysisCard icon={TrendingUp} label={t('q3', language)} value={overall.q3.toFixed(2)} />
          <AnalysisCard icon={Users} label={t('count', language)} value={overall.count.toString()} />
        </div>
      </div>

      {/* Level Distribution Summary */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{t('levelDistribution', language)}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {levels.map(level => (
            <div key={level} className={`rounded-xl border p-3 text-center ${getLevelBgClass(level, state.theme === 'dark')}`}>
              <p className="text-2xl font-bold">{classAnalysis.levelDistribution[level]}</p>
              <p className="text-sm font-medium">{getLevelLabel(level, language)}</p>
              <p className="text-xs opacity-70 mt-1">
                {((classAnalysis.levelDistribution[level] / classAnalysis.totalStudents) * 100).toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Subject Averages */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{t('subjectAnalysis', language)}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={state.theme === 'dark' ? '#334155' : '#e2e8f0'} />
              <XAxis dataKey="name" tick={{ fill: state.theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: state.theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: state.theme === 'dark' ? '#1e293b' : '#fff',
                  border: state.theme === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  color: state.theme === 'dark' ? '#fff' : '#1e293b',
                }}
              />
              <Bar dataKey="average" fill="#6366F1" radius={[6, 6, 0, 0]} name={language === 'ar' ? 'المتوسط' : 'Average'} />
              <Bar dataKey="min" fill="#F59E0B" radius={[6, 6, 0, 0]} name={language === 'ar' ? 'أقل درجة' : 'Min'} />
              <Bar dataKey="max" fill="#10B981" radius={[6, 6, 0, 0]} name={language === 'ar' ? 'أعلى درجة' : 'Max'} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Level Distribution */}
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{t('gradeDistribution', language)}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={levelPieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {levelPieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar Chart */}
      {radarData.length > 2 && (
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
            {language === 'ar' ? 'تحليل أداء المواد' : 'Subject Performance Analysis'}
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={state.theme === 'dark' ? '#334155' : '#e2e8f0'} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: state.theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 12 }} />
              <PolarRadiusAxis tick={{ fill: state.theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 10 }} />
              <Radar name={language === 'ar' ? 'الأداء %' : 'Performance %'} dataKey="average" stroke="#6366F1" fill="#6366F1" fillOpacity={0.3} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Per-Subject Detailed Analysis */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">{t('subjectAnalysis', language)}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-start px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">{t('subject', language)}</th>
                <th className="text-center px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">{t('mean', language)}</th>
                <th className="text-center px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">{t('stdDev', language)}</th>
                <th className="text-center px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">{t('variance', language)}</th>
                <th className="text-center px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">{t('min', language)}</th>
                <th className="text-center px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">{t('max', language)}</th>
                <th className="text-center px-3 py-2 font-semibold text-slate-600 dark:text-slate-300">{t('range', language)}</th>
              </tr>
            </thead>
            <tbody>
              {classAnalysis.subjectAnalyses.map(sa => (
                <tr key={sa.subjectName} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-3 py-2 font-medium text-slate-800 dark:text-white">{sa.subjectName}</td>
                  <td className="text-center px-3 py-2 text-slate-600 dark:text-slate-300">{sa.analysis.mean.toFixed(2)}</td>
                  <td className="text-center px-3 py-2 text-slate-600 dark:text-slate-300">{sa.analysis.standardDeviation.toFixed(2)}</td>
                  <td className="text-center px-3 py-2 text-slate-600 dark:text-slate-300">{sa.analysis.variance.toFixed(2)}</td>
                  <td className="text-center px-3 py-2 text-slate-600 dark:text-slate-300">{sa.analysis.min}</td>
                  <td className="text-center px-3 py-2 text-slate-600 dark:text-slate-300">{sa.analysis.max}</td>
                  <td className="text-center px-3 py-2 text-slate-600 dark:text-slate-300">{sa.analysis.range}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
