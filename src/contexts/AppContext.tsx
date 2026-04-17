import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { AppState, Theme, Language, Student, ClassAnalysis, AIContent } from '../types';
import { analyzeClass, getStudentLevel } from '../utils/analysis';

type Action =
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_STUDENTS'; payload: { students: Student[]; subjects: string[]; maxScore: number } }
  | { type: 'ADD_STUDENT'; payload: Student }
  | { type: 'REMOVE_STUDENT'; payload: string }
  | { type: 'UPDATE_STUDENT'; payload: Student }
  | { type: 'ADD_AI_CONTENT'; payload: AIContent }
  | { type: 'CLEAR_AI_CONTENTS' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TAB'; payload: string }
  | { type: 'CLEAR_DATA' };

const initialState: AppState = {
  theme: (localStorage.getItem('theme') as Theme) || 'dark',
  language: (localStorage.getItem('language') as Language) || 'ar',
  students: [],
  subjects: [],
  classAnalysis: null,
  aiContents: [],
  isLoading: false,
  activeTab: 'input',
  maxScore: 100,
};

function processStudents(students: Student[], subjects: string[], maxScore: number): ClassAnalysis | null {
  if (students.length === 0 || subjects.length === 0) return null;

  const updatedStudents = students.map(s => {
    const grades = subjects.map(sub => s.grades[sub] ?? 0);
    const avg = grades.reduce((a, b) => a + b, 0) / grades.length;
    return { ...s, averageScore: avg, level: getStudentLevel(avg, maxScore) };
  });

  return { ...analyzeClass(updatedStudents, subjects, maxScore), totalStudents: updatedStudents.length };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_THEME':
      localStorage.setItem('theme', action.payload);
      return { ...state, theme: action.payload };
    case 'SET_LANGUAGE':
      localStorage.setItem('language', action.payload);
      return { ...state, language: action.payload };
    case 'SET_STUDENTS': {
      const { students, subjects, maxScore } = action.payload;
      const updatedStudents = students.map(s => {
        const grades = subjects.map(sub => s.grades[sub] ?? 0);
        const avg = grades.reduce((a, b) => a + b, 0) / grades.length;
        return { ...s, averageScore: avg, level: getStudentLevel(avg, maxScore) };
      });
      const analysis = processStudents(updatedStudents, subjects, maxScore);
      return { ...state, students: updatedStudents, subjects, classAnalysis: analysis, maxScore, activeTab: 'dashboard' };
    }
    case 'ADD_STUDENT': {
      const newStudents = [...state.students, action.payload];
      const analysis = processStudents(newStudents, state.subjects, state.maxScore);
      return { ...state, students: newStudents, classAnalysis: analysis };
    }
    case 'REMOVE_STUDENT': {
      const newStudents = state.students.filter(s => s.id !== action.payload);
      const analysis = processStudents(newStudents, state.subjects, state.maxScore);
      return { ...state, students: newStudents, classAnalysis: analysis };
    }
    case 'UPDATE_STUDENT': {
      const newStudents = state.students.map(s => (s.id === action.payload.id ? action.payload : s));
      const analysis = processStudents(newStudents, state.subjects, state.maxScore);
      return { ...state, students: newStudents, classAnalysis: analysis };
    }
    case 'ADD_AI_CONTENT':
      return { ...state, aiContents: [action.payload, ...state.aiContents] };
    case 'CLEAR_AI_CONTENTS':
      return { ...state, aiContents: [] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_TAB':
      return { ...state, activeTab: action.payload };
    case 'CLEAR_DATA':
      return { ...state, students: [], subjects: [], classAnalysis: null, aiContents: [], activeTab: 'input' };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
    document.documentElement.dir = state.language === 'ar' ? 'rtl' : 'ltr';
  }, [state.theme, state.language]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

export const translations: Record<string, Record<'ar' | 'en', string>> = {
  appName: { ar: 'تحليل نواتج التعلم', en: 'Learning Outcomes Analyzer' },
  dashboard: { ar: 'لوحة التحكم', en: 'Dashboard' },
  dataInput: { ar: 'إدخال البيانات', en: 'Data Input' },
  statisticalAnalysis: { ar: 'التحليل الإحصائي', en: 'Statistical Analysis' },
  studentCategories: { ar: 'تصنيف الطلاب', en: 'Student Categories' },
  skillsMatrix: { ar: 'مصفوفة المهارات', en: 'Skills Matrix' },
  remedialPlan: { ar: 'الخطة العلاجية', en: 'Remedial Plan' },
  enrichmentPlan: { ar: 'الخطة الإثرائية', en: 'Enrichment Plan' },
  exercises: { ar: 'التدريبات', en: 'Exercises' },
  recommendations: { ar: 'التوصيات', en: 'Recommendations' },
  settings: { ar: 'الإعدادات', en: 'Settings' },
  secureAiConfig: { ar: 'إعدادات الذكاء الاصطناعي الآمنة', en: 'Secure AI Configuration' },
  uploadExcel: { ar: 'رفع ملف Excel', en: 'Upload Excel File' },
  manualEntry: { ar: 'إدخال يدوي', en: 'Manual Entry' },
  studentName: { ar: 'اسم الطالب', en: 'Student Name' },
  addStudent: { ar: 'إضافة طالب', en: 'Add Student' },
  generate: { ar: 'توليد', en: 'Generate' },
  generating: { ar: 'جاري التوليد...', en: 'Generating...' },
  mean: { ar: 'المتوسط الحسابي', en: 'Arithmetic Mean' },
  median: { ar: 'الوسيط', en: 'Median' },
  stdDev: { ar: 'الانحراف المعياري', en: 'Standard Deviation' },
  variance: { ar: 'التباين', en: 'Variance' },
  range: { ar: 'المدى', en: 'Range' },
  min: { ar: 'أقل درجة', en: 'Min Score' },
  max: { ar: 'أعلى درجة', en: 'Max Score' },
  q1: { ar: 'الربع الأول', en: 'First Quartile' },
  q3: { ar: 'الربع الثالث', en: 'Third Quartile' },
  count: { ar: 'العدد', en: 'Count' },
  noData: { ar: 'لا توجد بيانات. قم بإدخال البيانات أولاً.', en: 'No data available. Please enter data first.' },
  totalStudents: { ar: 'إجمالي الطلاب', en: 'Total Students' },
  classAverage: { ar: 'متوسط الفصل', en: 'Class Average' },
  passRate: { ar: 'نسبة النجاح', en: 'Pass Rate' },
  highestScore: { ar: 'أعلى درجة', en: 'Highest Score' },
  maxScoreLabel: { ar: 'الدرجة العظمى', en: 'Max Score' },
  subjects: { ar: 'المواد', en: 'Subjects' },
  subject: { ar: 'المادة', en: 'Subject' },
  level: { ar: 'المستوى', en: 'Level' },
  average: { ar: 'المعدل', en: 'Average' },
  grade: { ar: 'الدرجة', en: 'Grade' },
  actions: { ar: 'إجراءات', en: 'Actions' },
  delete: { ar: 'حذف', en: 'Delete' },
  edit: { ar: 'تعديل', en: 'Edit' },
  clearData: { ar: 'مسح البيانات', en: 'Clear Data' },
  exportData: { ar: 'تصدير البيانات', en: 'Export Data' },
  selectSubject: { ar: 'اختر المادة', en: 'Select Subject' },
  selectLevel: { ar: 'اختر المستوى', en: 'Select Level' },
  allLevels: { ar: 'جميع المستويات', en: 'All Levels' },
  generateExercises: { ar: 'توليد اختبار تفاعلي', en: 'Generate Interactive Quiz' },
  generatePlan: { ar: 'توليد خطة', en: 'Generate Plan' },
  generateRecommendations: { ar: 'توليد توصيات', en: 'Generate Recommendations' },
  apiManagedSecurely: {
    ar: 'مفتاح NVIDIA محفوظ على النظام ويُدار من الخادم فقط.',
    en: 'The NVIDIA key is stored on the system and managed only by the server.',
  },
  dragDrop: { ar: 'اسحب وأفلت ملف Excel هنا', en: 'Drag and drop Excel file here' },
  or: { ar: 'أو', en: 'or' },
  browse: { ar: 'تصفح الملفات', en: 'Browse Files' },
  sampleData: { ar: 'بيانات تجريبية', en: 'Sample Data' },
  loadSample: { ar: 'تحميل بيانات تجريبية', en: 'Load Sample Data' },
  overallAnalysis: { ar: 'التحليل العام', en: 'Overall Analysis' },
  subjectAnalysis: { ar: 'تحليل المواد', en: 'Subject Analysis' },
  gradeDistribution: { ar: 'توزيع الدرجات', en: 'Grade Distribution' },
  levelDistribution: { ar: 'توزيع المستويات', en: 'Level Distribution' },
  weakAreas: { ar: 'نقاط الضعف', en: 'Weak Areas' },
  noStudentsForLevel: { ar: 'لا يوجد طلاب في هذا المستوى', en: 'No students at this level' },
  quizProgress: { ar: 'تقدم الاختبار', en: 'Quiz Progress' },
  nextQuestion: { ar: 'السؤال التالي', en: 'Next Question' },
  finishQuiz: { ar: 'إنهاء الاختبار', en: 'Finish Quiz' },
  showAnswer: { ar: 'إظهار الإجابة', en: 'Show Answer' },
  yourAnswer: { ar: 'إجابتك', en: 'Your Answer' },
  correctAnswer: { ar: 'الإجابة الصحيحة', en: 'Correct Answer' },
  explanation: { ar: 'الشرح', en: 'Explanation' },
  finalResult: { ar: 'النتيجة النهائية', en: 'Final Result' },
  restartQuiz: { ar: 'إعادة الاختبار', en: 'Restart Quiz' },
  questionLabel: { ar: 'السؤال', en: 'Question' },
  quizComplete: { ar: 'تم إكمال الاختبار', en: 'Quiz Complete' },
};

export function t(key: string, lang: 'ar' | 'en'): string {
  return translations[key]?.[lang] || key;
}
