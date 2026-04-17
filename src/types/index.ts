export type StudentLevel = 'excellent' | 'veryGood' | 'good' | 'acceptable' | 'weak';

export interface Student {
  id: string;
  name: string;
  grades: Record<string, number>;
  averageScore: number;
  level: StudentLevel;
}

export interface StatisticalAnalysis {
  mean: number;
  median: number;
  standardDeviation: number;
  variance: number;
  range: number;
  min: number;
  max: number;
  q1: number;
  q3: number;
  count: number;
}

export interface SubjectAnalysis {
  subjectName: string;
  analysis: StatisticalAnalysis;
  levelDistribution: Record<StudentLevel, number>;
}

export interface ClassAnalysis {
  overallAnalysis: StatisticalAnalysis;
  subjectAnalyses: SubjectAnalysis[];
  levelDistribution: Record<StudentLevel, number>;
  totalStudents: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface ExerciseQuiz {
  title: string;
  subject: string;
  level: StudentLevel;
  questions: QuizQuestion[];
}

export interface AIContent {
  id: string;
  type: 'recommendation' | 'remedial' | 'enrichment' | 'exercise';
  level: StudentLevel | 'all';
  title: string;
  content: string;
  quiz?: ExerciseQuiz;
  timestamp: number;
}

export type Theme = 'dark' | 'light';
export type Language = 'ar' | 'en';

export interface AppState {
  theme: Theme;
  language: Language;
  students: Student[];
  subjects: string[];
  classAnalysis: ClassAnalysis | null;
  aiContents: AIContent[];
  isLoading: boolean;
  activeTab: string;
  maxScore: number;
}
