import { useState, useRef, useCallback } from 'react';
import { useApp, t } from '../contexts/AppContext';
import { Upload, FileSpreadsheet, Plus, Trash2, Users, Database, BookOpen } from 'lucide-react';
import * as XLSX from 'xlsx';
import { generateStudentId, getStudentLevel } from '../utils/analysis';

const SAMPLE_DATA = {
  subjects: ['الرياضيات', 'العلوم', 'اللغة العربية', 'اللغة الإنجليزية'],
  maxScore: 100,
  students: [
    { name: 'أحمد محمد', grades: { 'الرياضيات': 92, 'العلوم': 88, 'اللغة العربية': 95, 'اللغة الإنجليزية': 85 } },
    { name: 'فاطمة علي', grades: { 'الرياضيات': 85, 'العلوم': 91, 'اللغة العربية': 78, 'اللغة الإنجليزية': 88 } },
    { name: 'خالد إبراهيم', grades: { 'الرياضيات': 72, 'العلوم': 65, 'اللغة العربية': 70, 'اللغة الإنجليزية': 68 } },
    { name: 'نورة سعيد', grades: { 'الرياضيات': 95, 'العلوم': 97, 'اللغة العربية': 93, 'اللغة الإنجليزية': 96 } },
    { name: 'عمر حسن', grades: { 'الرياضيات': 55, 'العلوم': 48, 'اللغة العربية': 62, 'اللغة الإنجليزية': 50 } },
    { name: 'سارة أحمد', grades: { 'الرياضيات': 78, 'العلوم': 82, 'اللغة العربية': 75, 'اللغة الإنجليزية': 80 } },
    { name: 'يوسف خالد', grades: { 'الرياضيات': 45, 'العلوم': 52, 'اللغة العربية': 40, 'اللغة الإنجليزية': 55 } },
    { name: 'مريم عبدالله', grades: { 'الرياضيات': 88, 'العلوم': 85, 'اللغة العربية': 90, 'اللغة الإنجليزية': 87 } },
    { name: 'عبدالرحمن سعيد', grades: { 'الرياضيات': 65, 'العلوم': 70, 'اللغة العربية': 58, 'اللغة الإنجليزية': 63 } },
    { name: 'لينا محمد', grades: { 'الرياضيات': 91, 'العلوم': 89, 'اللغة العربية': 94, 'اللغة الإنجليزية': 92 } },
    { name: 'حسن عمر', grades: { 'الرياضيات': 38, 'العلوم': 42, 'اللغة العربية': 35, 'اللغة الإنجليزية': 40 } },
    { name: 'ريم فهد', grades: { 'الرياضيات': 82, 'العلوم': 79, 'اللغة العربية': 85, 'اللغة الإنجليزية': 81 } },
    { name: 'طارق وليد', grades: { 'الرياضيات': 73, 'العلوم': 68, 'اللغة العربية': 71, 'اللغة الإنجليزية': 75 } },
    { name: 'هند سالم', grades: { 'الرياضيات': 96, 'العلوم': 94, 'اللغة العربية': 98, 'اللغة الإنجليزية': 95 } },
    { name: 'ماجد عادل', grades: { 'الرياضيات': 58, 'العلوم': 55, 'اللغة العربية': 60, 'اللغة الإنجليزية': 52 } },
  ],
};

export default function DataInput() {
  const { state, dispatch } = useApp();
  const { language } = state;
  const [subjectsInput, setSubjectsInput] = useState('');
  const [maxScore, setMaxScore] = useState(100);
  const [studentName, setStudentName] = useState('');
  const [studentGrades, setStudentGrades] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);
  const [mode, setMode] = useState<'upload' | 'manual'>('upload');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

        if (jsonData.length === 0) return;

        const headers = Object.keys(jsonData[0]);
        const nameCol = headers[0];
        const subjectsList = headers.slice(1);
        const fileMaxScore = maxScore;

        const students = jsonData.map((row) => {
          const name = String(row[nameCol] || '');
          const grades: Record<string, number> = {};
          subjectsList.forEach(sub => {
            const val = Number(row[sub]);
            grades[sub] = isNaN(val) ? 0 : val;
          });
          const avg = subjectsList.reduce((s, sub) => s + (grades[sub] || 0), 0) / subjectsList.length;
          return {
            id: generateStudentId(),
            name,
            grades,
            averageScore: avg,
            level: getStudentLevel(avg, fileMaxScore),
          };
        });

        dispatch({
          type: 'SET_STUDENTS',
          payload: { students, subjects: subjectsList, maxScore: fileMaxScore },
        });
      } catch (err) {
        console.error('Error parsing file:', err);
        alert(language === 'ar' ? 'خطأ في قراءة الملف' : 'Error reading file');
      }
    };
    reader.readAsArrayBuffer(file);
  }, [dispatch, language, maxScore]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const loadSampleData = () => {
    const students = SAMPLE_DATA.students.map(s => {
      const grades: Record<string, number> = { ...s.grades };
      const avg = SAMPLE_DATA.subjects.reduce((sum, sub) => sum + (grades[sub] || 0), 0) / SAMPLE_DATA.subjects.length;
      return {
        id: generateStudentId(),
        name: s.name,
        grades,
        averageScore: avg,
        level: getStudentLevel(avg, SAMPLE_DATA.maxScore),
      };
    });
    dispatch({ type: 'SET_STUDENTS', payload: { students, subjects: SAMPLE_DATA.subjects, maxScore: SAMPLE_DATA.maxScore } });
  };

  const setupManual = () => {
    const subjects = subjectsInput.split(/[,،\n]+/).map(s => s.trim()).filter(Boolean);
    if (subjects.length === 0) {
      alert(language === 'ar' ? 'أدخل المواد أولاً' : 'Enter subjects first');
      return;
    }
    setMode('manual');
  };

  const addStudent = () => {
    if (!studentName.trim()) return;
    const grades: Record<string, number> = {};
    state.subjects.forEach(sub => {
      grades[sub] = Number(studentGrades[sub]) || 0;
    });
    const avg = state.subjects.reduce((s, sub) => s + (grades[sub] || 0), 0) / state.subjects.length;
    const student = {
      id: generateStudentId(),
      name: studentName.trim(),
      grades,
      averageScore: avg,
      level: getStudentLevel(avg, maxScore),
    };
    dispatch({ type: 'SET_STUDENTS', payload: { students: [...state.students, student], subjects: state.subjects, maxScore } });
    setStudentName('');
    setStudentGrades({});
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Section */}
      <div className="text-center space-y-3 py-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/25 mb-2">
          <Database className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
          {language === 'ar' ? 'تحليل نواتج التعلم' : 'Learning Outcomes Analysis'}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          {language === 'ar'
            ? 'قم برفع ملف Excel أو إدخال البيانات يدوياً لتحليل أداء الطلاب وتوليد توصيات ذكية'
            : 'Upload an Excel file or enter data manually to analyze student performance and generate AI recommendations'}
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
        {(['upload', 'manual'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === m
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {m === 'upload' ? <Upload className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
            {m === 'upload' ? t('uploadExcel', language) : t('manualEntry', language)}
          </button>
        ))}
      </div>

      {mode === 'upload' && (
        <div className="space-y-4">
          {/* Max Score */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('maxScoreLabel', language)}:
            </label>
            <input
              type="number"
              value={maxScore}
              onChange={e => setMaxScore(Number(e.target.value) || 100)}
              className="w-24 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm"
            />
          </div>

          {/* Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-[1.02]'
                : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
            />
            <div className="space-y-3">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                <Upload className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">{t('dragDrop', language)}</p>
              <p className="text-slate-400 text-sm">{t('or', language)}</p>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
                <BookOpen className="w-4 h-4" />
                {t('browse', language)}
              </span>
            </div>
          </div>

          {/* Sample Data Button */}
          <div className="text-center pt-2">
            <p className="text-sm text-slate-400 mb-3">{language === 'ar' ? 'أو جرّب البيانات التجريبية' : 'Or try sample data'}</p>
            <button
              onClick={loadSampleData}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
            >
              <Users className="w-5 h-5" />
              {t('loadSample', language)}
            </button>
          </div>

          {/* Excel Format Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
              {language === 'ar' ? '📋 تنسيق ملف Excel المتوقع:' : '📋 Expected Excel format:'}
            </h4>
            <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <p>{language === 'ar' ? 'العمود الأول: اسم الطالب' : 'First column: Student Name'}</p>
              <p>{language === 'ar' ? 'الأعمدة التالية: درجات المواد' : 'Other columns: Subject grades'}</p>
            </div>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-blue-100 dark:bg-blue-800/40">
                    <th className="px-3 py-1.5 rounded-r-lg text-right">الاسم</th>
                    <th className="px-3 py-1.5 text-right">الرياضيات</th>
                    <th className="px-3 py-1.5 text-right">العلوم</th>
                    <th className="px-3 py-1.5 rounded-l-lg text-right">العربي</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white/50 dark:bg-blue-900/20">
                    <td className="px-3 py-1.5">أحمد</td>
                    <td className="px-3 py-1.5">85</td>
                    <td className="px-3 py-1.5">90</td>
                    <td className="px-3 py-1.5">78</td>
                  </tr>
                  <tr className="bg-white/50 dark:bg-blue-900/20">
                    <td className="px-3 py-1.5">فاطمة</td>
                    <td className="px-3 py-1.5">92</td>
                    <td className="px-3 py-1.5">88</td>
                    <td className="px-3 py-1.5">95</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {mode === 'manual' && state.subjects.length === 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t('subjects', language)} <span className="text-slate-400">({language === 'ar' ? 'افصل بفاصلة أو سطر جديد' : 'Separate by comma or new line'})</span>
            </label>
            <textarea
              value={subjectsInput}
              onChange={e => setSubjectsInput(e.target.value)}
              placeholder={language === 'ar' ? 'الرياضيات، العلوم، اللغة العربية، اللغة الإنجليزية' : 'Math, Science, Arabic, English'}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('maxScoreLabel', language)}:</label>
            <input
              type="number"
              value={maxScore}
              onChange={e => setMaxScore(Number(e.target.value) || 100)}
              className="w-24 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm"
            />
          </div>
          <button
            onClick={setupManual}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
          >
            {language === 'ar' ? 'التالي' : 'Next'}
          </button>
        </div>
      )}

      {mode === 'manual' && state.subjects.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('subjects', language)}:</span>
            {state.subjects.map(sub => (
              <span key={sub} className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm">{sub}</span>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
            <div className="grid grid-cols-[1fr_repeat(auto-fit,minmax(80px,1fr))] gap-2 items-end">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t('studentName', language)}</label>
                <input
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  placeholder={language === 'ar' ? 'اسم الطالب' : 'Student name'}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
                />
              </div>
              {state.subjects.map(sub => (
                <div key={sub}>
                  <label className="block text-xs font-medium text-slate-500 mb-1 truncate">{sub}</label>
                  <input
                    type="number"
                    value={studentGrades[sub] || ''}
                    onChange={e => setStudentGrades(prev => ({ ...prev, [sub]: e.target.value }))}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm"
                  />
                </div>
              ))}
              <button
                onClick={addStudent}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('addStudent', language)}
              </button>
            </div>
          </div>

          {/* Student list */}
          {state.students.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {language === 'ar' ? `الطلاب (${state.students.length})` : `Students (${state.students.length})`}
              </h3>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {state.students.map(s => (
                  <div key={s.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{s.name}</span>
                      <span className="text-slate-400">|</span>
                      <span className="text-slate-500 dark:text-slate-400">{s.averageScore.toFixed(1)}</span>
                    </div>
                    <button
                      onClick={() => dispatch({ type: 'REMOVE_STUDENT', payload: s.id })}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
