import { Student, StudentLevel, StatisticalAnalysis, SubjectAnalysis, ClassAnalysis } from '../types';

export function getStudentLevel(average: number, maxScore: number = 100): StudentLevel {
  const pct = (average / maxScore) * 100;
  if (pct >= 90) return 'excellent';
  if (pct >= 80) return 'veryGood';
  if (pct >= 70) return 'good';
  if (pct >= 60) return 'acceptable';
  return 'weak';
}

export function getLevelLabel(level: StudentLevel, lang: 'ar' | 'en'): string {
  const labels: Record<StudentLevel, { ar: string; en: string }> = {
    excellent: { ar: 'ممتاز', en: 'Excellent' },
    veryGood: { ar: 'جيد جداً', en: 'Very Good' },
    good: { ar: 'جيد', en: 'Good' },
    acceptable: { ar: 'مقبول', en: 'Acceptable' },
    weak: { ar: 'ضعيف', en: 'Weak' },
  };
  return labels[level][lang];
}

export function getLevelColor(level: StudentLevel): string {
  const colors: Record<StudentLevel, string> = {
    excellent: '#10B981',
    veryGood: '#3B82F6',
    good: '#8B5CF6',
    acceptable: '#F59E0B',
    weak: '#EF4444',
  };
  return colors[level];
}

export function getLevelBgClass(level: StudentLevel, isDark: boolean): string {
  const classes: Record<StudentLevel, string> = {
    excellent: isDark ? 'bg-emerald-900/40 text-emerald-300 border-emerald-700' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    veryGood: isDark ? 'bg-blue-900/40 text-blue-300 border-blue-700' : 'bg-blue-50 text-blue-700 border-blue-200',
    good: isDark ? 'bg-purple-900/40 text-purple-300 border-purple-700' : 'bg-purple-50 text-purple-700 border-purple-200',
    acceptable: isDark ? 'bg-amber-900/40 text-amber-300 border-amber-700' : 'bg-amber-50 text-amber-700 border-amber-200',
    weak: isDark ? 'bg-red-900/40 text-red-300 border-red-700' : 'bg-red-50 text-red-700 border-red-200',
  };
  return classes[level];
}

export function calculateStatistics(values: number[]): StatisticalAnalysis {
  if (values.length === 0) {
    return { mean: 0, median: 0, standardDeviation: 0, variance: 0, range: 0, min: 0, max: 0, q1: 0, q3: 0, count: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const count = values.length;
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / count;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const range = max - min;

  const median = count % 2 === 0
    ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
    : sorted[Math.floor(count / 2)];

  const q1Index = Math.floor(count * 0.25);
  const q3Index = Math.floor(count * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[Math.min(q3Index, count - 1)];

  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
  const standardDeviation = Math.sqrt(variance);

  return { mean, median, standardDeviation, variance, range, min, max, q1, q3, count };
}

export function analyzeSubject(students: Student[], subject: string, maxScore: number): SubjectAnalysis {
  const grades = students.map(s => s.grades[subject] ?? 0).filter(g => g !== undefined);
  const analysis = calculateStatistics(grades);

  const levelDistribution: Record<StudentLevel, number> = {
    excellent: 0, veryGood: 0, good: 0, acceptable: 0, weak: 0,
  };

  students.forEach(s => {
    const grade = s.grades[subject] ?? 0;
    const level = getStudentLevel(grade, maxScore);
    levelDistribution[level]++;
  });

  return { subjectName: subject, analysis, levelDistribution };
}

export function analyzeClass(students: Student[], subjects: string[], maxScore: number): ClassAnalysis {
  const averages = students.map(s => s.averageScore);
  const overallAnalysis = calculateStatistics(averages);

  const subjectAnalyses = subjects.map(sub => analyzeSubject(students, sub, maxScore));

  const levelDistribution: Record<StudentLevel, number> = {
    excellent: 0, veryGood: 0, good: 0, acceptable: 0, weak: 0,
  };

  students.forEach(s => {
    levelDistribution[s.level]++;
  });

  return { overallAnalysis, subjectAnalyses, levelDistribution, totalStudents: students.length };
}

export function generateStudentId(): string {
  return Math.random().toString(36).substring(2, 11);
}
