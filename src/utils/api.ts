import { ExerciseQuiz, Student, StudentLevel } from '../types';
import { getLevelLabel } from './analysis';

// In production (Vercel), use a relative path so it hits the serverless function.
// In development, fall back to the local Express proxy on port 3001.
const NIM_PROXY_URL =
  import.meta.env.PROD
    ? '/api/nim/chat'
    : 'http://localhost:3001/api/nim/chat';

const MODEL = 'qwen/qwen3.5-397b-a17b';

type ChatMessage = { role: string; content: string };

async function callNvidiaNIM(messages: ChatMessage[]): Promise<string> {
  const response = await fetch(NIM_PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.9,
    }),
  });

  if (!response.ok) {
    let errorMessage = `API Error (${response.status})`;

    try {
      const errorData = await response.json();
      errorMessage = errorData?.error ? `${errorMessage}: ${errorData.error}` : errorMessage;
    } catch {
      const errorText = await response.text();
      if (errorText) {
        errorMessage = `${errorMessage}: ${errorText}`;
      }
    }

    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No response generated';
}

function extractJsonObject(text: string): string {
  const fencedMatch = text.match(/```json\s*([\s\S]*?)```/i) || text.match(/```\s*([\s\S]*?)```/);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return text.slice(start, end + 1);
  }

  return text;
}

function normalizeQuiz(rawQuiz: ExerciseQuiz, fallbackTitle: string, subject: string, level: StudentLevel): ExerciseQuiz {
  return {
    title: rawQuiz.title || fallbackTitle,
    subject: rawQuiz.subject || subject,
    level: rawQuiz.level || level,
    questions: (rawQuiz.questions || []).map(question => ({
      question: question.question,
      options: Array.isArray(question.options) ? question.options.slice(0, 4) : [],
      correctAnswerIndex: question.correctAnswerIndex,
      explanation: question.explanation,
    })),
  };
}

export async function generateRecommendations(
  students: Student[],
  subjects: string[],
  language: 'ar' | 'en',
  maxScore: number
): Promise<string> {
  const weakStudents = students.filter(s => s.level === 'weak' || s.level === 'acceptable');
  const strongStudents = students.filter(s => s.level === 'excellent' || s.level === 'veryGood');

  const studentSummary = students
    .map(s => {
      const grades = subjects.map(sub => `${sub}: ${s.grades[sub] ?? 0}/${maxScore}`).join(', ');
      return `- ${s.name}: ${grades} | Average: ${s.averageScore.toFixed(1)} | Level: ${getLevelLabel(s.level, language)}`;
    })
    .join('\n');

  const prompt =
    language === 'ar'
      ? `أنت خبير تحليل نواتج التعلم. قم بتحليل البيانات التالية وقدم توصيات مفصلة لتحسين مستوى الطلاب.

إحصائيات الفصل:
- عدد الطلاب: ${students.length}
- عدد الطلاب الضعاف والمقبولين: ${weakStudents.length}
- عدد الطلاب الممتازين والجيدين جداً: ${strongStudents.length}
- المواد: ${subjects.join('، ')}
- الدرجة العظمى: ${maxScore}

بيانات الطلاب:
${studentSummary}

قدم توصيات مفصلة في النقاط التالية:
1. 📊 تحليل عام لمستوى الفصل
2. 🎯 توصيات لتحسين أداء الطلاب الضعاف
3. 📚 توصيات لدعم الطلاب الممتازين (خطة إثرائية)
4. 🔧 استراتيجيات تدريس مقترحة
5. 📋 خطة زمنية مقترحة للتحسين

اكتب الإجابة باللغة العربية بشكل منظم وواضح.`
      : `You are a learning outcomes analysis expert. Analyze the following data and provide detailed recommendations for improving student performance.

Class Statistics:
- Total students: ${students.length}
- Weak/Acceptable students: ${weakStudents.length}
- Excellent/Very Good students: ${strongStudents.length}
- Subjects: ${subjects.join(', ')}
- Max Score: ${maxScore}

Student Data:
${studentSummary}

Provide detailed recommendations on:
1. Overall class level analysis
2. Recommendations for improving weak students
3. Recommendations for supporting excellent students (enrichment plan)
4. Suggested teaching strategies
5. Proposed timeline for improvement

Write the response in English in a clear and organized manner.`;

  return callNvidiaNIM([{ role: 'user', content: prompt }]);
}

export async function generateExercises(
  level: StudentLevel,
  subject: string,
  weakAreas: string[],
  language: 'ar' | 'en',
  maxScore: number
): Promise<ExerciseQuiz> {
  const levelLabel = getLevelLabel(level, language);
  const fallbackTitle = language === 'ar' ? `اختبار تفاعلي - ${subject}` : `Interactive Quiz - ${subject}`;

  const prompt =
    language === 'ar'
      ? `أنت معلم خبير في مادة "${subject}". أنشئ اختباراً تفاعلياً مناسباً لمستوى "${levelLabel}".

معلومات المستوى:
- مستوى الطالب: ${levelLabel}
- المادة: ${subject}
- الجوانب التي تحتاج تحسين: ${weakAreas.join('، ') || 'جميع الجوانب'}
- الدرجة العظمى: ${maxScore}

أعد الإجابة بصيغة JSON فقط دون أي شرح إضافي أو markdown، وبهذا الشكل تماماً:
{
  "title": "عنوان الاختبار",
  "subject": "${subject}",
  "level": "${level}",
  "questions": [
    {
      "question": "نص السؤال",
      "options": ["الخيار 1", "الخيار 2", "الخيار 3", "الخيار 4"],
      "correctAnswerIndex": 0,
      "explanation": "شرح الإجابة الصحيحة"
    }
  ]
}

الشروط:
- أنشئ 5 أسئلة اختيار من متعدد
- كل سؤال يجب أن يحتوي على 4 خيارات فقط
- استخدم correctAnswerIndex بقيمة من 0 إلى 3
- اجعل الشرح واضحاً ومختصراً
- الأسئلة يجب أن تكون مناسبة للمستوى ${levelLabel}`
      : `You are an expert teacher in "${subject}". Create an interactive quiz suitable for the "${levelLabel}" level.

Level Information:
- Student level: ${levelLabel}
- Subject: ${subject}
- Areas needing improvement: ${weakAreas.join(', ') || 'All areas'}
- Max score: ${maxScore}

Return JSON only with no markdown and no extra commentary using exactly this shape:
{
  "title": "Quiz title",
  "subject": "${subject}",
  "level": "${level}",
  "questions": [
    {
      "question": "Question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswerIndex": 0,
      "explanation": "Short explanation of the correct answer"
    }
  ]
}

Requirements:
- Create 5 multiple-choice questions
- Each question must contain exactly 4 options
- Use correctAnswerIndex values from 0 to 3
- Keep explanations clear and concise
- Questions must fit the ${levelLabel} level`;

  const rawResponse = await callNvidiaNIM([{ role: 'user', content: prompt }]);
  const parsedQuiz = JSON.parse(extractJsonObject(rawResponse)) as ExerciseQuiz;
  return normalizeQuiz(parsedQuiz, fallbackTitle, subject, level);
}

export async function generateRemedialPlan(
  students: Student[],
  subjects: string[],
  language: 'ar' | 'en',
  maxScore: number
): Promise<string> {
  const weakStudents = students.filter(s => s.level === 'weak' || s.level === 'acceptable');

  if (weakStudents.length === 0) {
    return language === 'ar' ? 'لا يوجد طلاب ضعاف أو مقبولين في الفصل.' : 'There are no weak or acceptable students in the class.';
  }

  const studentList = weakStudents
    .map(s => {
      const weakSubjects = subjects.filter(sub => (s.grades[sub] ?? 0) < maxScore * 0.6);
      return `- ${s.name}: المواد الضعيفة: ${weakSubjects.join('، ')} | المعدل: ${s.averageScore.toFixed(1)}`;
    })
    .join('\n');

  const prompt =
    language === 'ar'
      ? `أنت خبير تخطيط تعليمي. أعد خطة علاجية شاملة للطلاب التالية أسماؤهم:

${studentList}

المواد: ${subjects.join('، ')}
الدرجة العظمى: ${maxScore}

أعد خطة علاجية تتضمن:
1. أهداف الخطة العلاجية
2. جدول زمني (4 أسابيع)
3. أنشطة علاجية لكل مادة ضعيفة
4. تقييمات دورية
5. آلية المتابعة والدعم
6. معايير نجاح الخطة

اكتب الخطة بشكل مفصل ومنظم باللغة العربية.`
      : `You are an educational planning expert. Prepare a comprehensive remedial plan for the following students:

${studentList}

Subjects: ${subjects.join(', ')}
Max Score: ${maxScore}

Prepare a remedial plan including:
1. Plan objectives
2. Timeline (4 weeks)
3. Remedial activities for each weak subject
4. Periodic assessments
5. Follow-up and support mechanisms
6. Success criteria

Write a detailed and organized plan in English.`;

  return callNvidiaNIM([{ role: 'user', content: prompt }]);
}

export async function generateEnrichmentPlan(
  students: Student[],
  subjects: string[],
  language: 'ar' | 'en',
  _maxScore: number
): Promise<string> {
  const strongStudents = students.filter(s => s.level === 'excellent' || s.level === 'veryGood');

  if (strongStudents.length === 0) {
    return language === 'ar' ? 'لا يوجد طلاب ممتازين أو جيدين جداً في الفصل.' : 'There are no excellent or very good students in the class.';
  }

  const studentList = strongStudents
    .map(s => `- ${s.name}: المعدل: ${s.averageScore.toFixed(1)} | المستوى: ${getLevelLabel(s.level, language)}`)
    .join('\n');

  const prompt =
    language === 'ar'
      ? `أنت خبير تخطيط تعليمي. أعد خطة إثرائية شاملة للطلاب المتميزين التالية أسماؤهم:

${studentList}

المواد: ${subjects.join('، ')}

أعد خطة إثرائية تتضمن:
1. أهداف الخطة الإثرائية
2. جدول زمني (4 أسابيع)
3. أنشطة تحدي وابداع
4. مشاريع بحثية
5. مسابقات وتحديات
6. معايير تقييم الأداء المتقدم

اكتب الخطة بشكل مفصل ومنظم باللغة العربية.`
      : `You are an educational planning expert. Prepare a comprehensive enrichment plan for the following outstanding students:

${studentList}

Subjects: ${subjects.join(', ')}

Prepare an enrichment plan including:
1. Plan objectives
2. Timeline (4 weeks)
3. Challenge and creativity activities
4. Research projects
5. Competitions and challenges
6. Advanced performance evaluation criteria

Write a detailed and organized plan in English.`;

  return callNvidiaNIM([{ role: 'user', content: prompt }]);
}
