import { useMemo, useState } from 'react';
import { useApp, t } from '../contexts/AppContext';
import { ExerciseQuiz, StudentLevel } from '../types';
import { getLevelLabel } from '../utils/analysis';
import { generateRecommendations, generateRemedialPlan, generateEnrichmentPlan, generateExercises } from '../utils/api';
import { Sparkles, BookOpen, Rocket, Dumbbell, AlertTriangle, Loader2, FileText, Trash2, CheckCircle2, XCircle } from 'lucide-react';

type Tab = 'recommendations' | 'remedial' | 'enrichment' | 'exercise';

function InteractiveQuiz({ quiz }: { quiz: ExerciseQuiz }) {
  const { state } = useApp();
  const { language } = state;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = quiz.questions[currentIndex];
  const selectedAnswer = selectedAnswers[currentIndex];
  const isRevealed = Boolean(revealedAnswers[currentIndex]);
  const answeredCount = Object.keys(revealedAnswers).length;
  const correctCount = quiz.questions.reduce((total, question, index) => {
    return total + (revealedAnswers[index] && selectedAnswers[index] === question.correctAnswerIndex ? 1 : 0);
  }, 0);

  const progressPercent = ((currentIndex + 1) / quiz.questions.length) * 100;
  const scorePercent = quiz.questions.length === 0 ? 0 : Math.round((correctCount / quiz.questions.length) * 100);

  const selectAnswer = (optionIndex: number) => {
    if (isRevealed) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const revealAnswer = () => {
    if (selectedAnswer === undefined) return;
    setRevealedAnswers(prev => ({ ...prev, [currentIndex]: true }));
  };

  const goNext = () => {
    if (currentIndex === quiz.questions.length - 1) {
      setIsFinished(true);
      return;
    }

    setCurrentIndex(prev => prev + 1);
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setRevealedAnswers({});
    setIsFinished(false);
  };

  if (!quiz.questions.length) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
        {language === 'ar' ? 'لم يتم إنشاء أسئلة صالحة لهذا الاختبار.' : 'No valid questions were generated for this quiz.'}
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800/50 dark:bg-emerald-900/20">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            <div>
              <h4 className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{t('quizComplete', language)}</h4>
              <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80">{t('finalResult', language)}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white/70 p-4 dark:bg-slate-900/40">
              <p className="text-xs text-slate-500 dark:text-slate-400">{language === 'ar' ? 'الإجابات الصحيحة' : 'Correct answers'}</p>
              <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">
                {correctCount}/{quiz.questions.length}
              </p>
            </div>
            <div className="rounded-xl bg-white/70 p-4 dark:bg-slate-900/40">
              <p className="text-xs text-slate-500 dark:text-slate-400">{language === 'ar' ? 'النسبة' : 'Score'}</p>
              <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-white">{scorePercent}%</p>
            </div>
            <div className="rounded-xl bg-white/70 p-4 dark:bg-slate-900/40">
              <p className="text-xs text-slate-500 dark:text-slate-400">{language === 'ar' ? 'المادة / المستوى' : 'Subject / Level'}</p>
              <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-white">
                {quiz.subject} / {getLevelLabel(quiz.level, language)}
              </p>
            </div>
          </div>

          <button
            onClick={restartQuiz}
            className="mt-5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            {t('restartQuiz', language)}
          </button>
        </div>

        <div className="space-y-3">
          {quiz.questions.map((question, index) => {
            const selected = selectedAnswers[index];
            const isCorrect = selected === question.correctAnswerIndex;

            return (
              <div key={`${quiz.title}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700/50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between gap-3">
                  <h5 className="font-bold text-slate-800 dark:text-white">
                    {t('questionLabel', language)} {index + 1}
                  </h5>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                    }`}
                  >
                    {isCorrect ? (language === 'ar' ? 'صحيحة' : 'Correct') : language === 'ar' ? 'غير صحيحة' : 'Incorrect'}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">{question.question}</p>
                <div className="mt-3 space-y-2">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = selected === optionIndex;
                    const isCorrectOption = question.correctAnswerIndex === optionIndex;

                    return (
                      <div
                        key={optionIndex}
                        className={`rounded-xl border px-3 py-2 text-sm ${
                          isCorrectOption
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                            : isSelected
                              ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-300'
                              : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-300'
                        }`}
                      >
                        {option}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-700 dark:border-indigo-800/50 dark:bg-indigo-900/20 dark:text-indigo-300">
                  <p className="font-semibold">{t('explanation', language)}</p>
                  <p className="mt-1">{question.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700/50 dark:bg-slate-800/50">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('quizProgress', language)}</p>
          <p className="text-sm font-bold text-slate-800 dark:text-white">
            {t('questionLabel', language)} {currentIndex + 1} / {quiz.questions.length}
          </p>
        </div>
        <div className="text-right text-xs text-slate-500 dark:text-slate-400">
          <p>
            {language === 'ar' ? 'تمت مراجعة' : 'Reviewed'}: {answeredCount}/{quiz.questions.length}
          </p>
        </div>
      </div>

      <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
        <h4 className="text-lg font-bold text-slate-800 dark:text-white">{currentQuestion.question}</h4>

        <div className="mt-4 space-y-3">
          {currentQuestion.options.map((option, optionIndex) => {
            const isSelected = selectedAnswer === optionIndex;
            const isCorrectOption = currentQuestion.correctAnswerIndex === optionIndex;

            return (
              <button
                key={optionIndex}
                type="button"
                onClick={() => selectAnswer(optionIndex)}
                disabled={isRevealed}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                  isRevealed
                    ? isCorrectOption
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                      : isSelected
                        ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-300'
                        : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-900/30 dark:text-slate-400'
                    : isSelected
                      ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/60 dark:border-slate-700 dark:bg-slate-900/20 dark:text-slate-200 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/10'
                }`}
              >
                <span>{option}</span>
                {isRevealed && isCorrectOption && <CheckCircle2 className="h-4 w-4" />}
                {isRevealed && isSelected && !isCorrectOption && <XCircle className="h-4 w-4" />}
              </button>
            );
          })}
        </div>

        {isRevealed && (
          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('yourAnswer', language)}</p>
              <p className="mt-1 text-sm font-medium text-slate-800 dark:text-white">
                {selectedAnswer !== undefined ? currentQuestion.options[selectedAnswer] : '-'}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/50 dark:bg-emerald-900/20">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{t('correctAnswer', language)}</p>
              <p className="mt-1 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                {currentQuestion.options[currentQuestion.correctAnswerIndex]}
              </p>
            </div>
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800/50 dark:bg-indigo-900/20">
              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">{t('explanation', language)}</p>
              <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-300">{currentQuestion.explanation}</p>
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          {!isRevealed ? (
            <button
              onClick={revealAnswer}
              disabled={selectedAnswer === undefined}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('showAnswer', language)}
            </button>
          ) : (
            <button
              onClick={goNext}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              {currentIndex === quiz.questions.length - 1 ? t('finishQuiz', language) : t('nextQuestion', language)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PlansExercises() {
  const { state, dispatch } = useApp();
  const { students, subjects, language, aiContents, maxScore } = state;
  const [activeTab, setActiveTab] = useState<Tab>('recommendations');
  const [exerciseLevel, setExerciseLevel] = useState<StudentLevel>('weak');
  const [exerciseSubject, setExerciseSubject] = useState(subjects[0] || '');
  const [error, setError] = useState('');

  const isLoading = state.isLoading;

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'recommendations', label: t('recommendations', language), icon: <Sparkles className="h-4 w-4" /> },
    { key: 'remedial', label: t('remedialPlan', language), icon: <BookOpen className="h-4 w-4" /> },
    { key: 'enrichment', label: t('enrichmentPlan', language), icon: <Rocket className="h-4 w-4" /> },
    { key: 'exercise', label: t('exercises', language), icon: <Dumbbell className="h-4 w-4" /> },
  ];

  const filteredContents = useMemo(() => {
    return aiContents.filter(content => {
      if (activeTab === 'recommendations') return content.type === 'recommendation';
      if (activeTab === 'remedial') return content.type === 'remedial';
      if (activeTab === 'enrichment') return content.type === 'enrichment';
      return content.type === 'exercise';
    });
  }, [activeTab, aiContents]);

  const renderMarkdown = (text: string) => {
    return text
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg my-2 overflow-x-auto"><code>$2</code></pre>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-800 dark:text-white">$1</strong>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-slate-800 dark:text-white mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-slate-800 dark:text-white mt-4 mb-3">$1</h1>')
      .replace(/^\* (.*$)/gm, '<li class="ml-4 list-disc text-slate-600 dark:text-slate-300">$1</li>')
      .replace(/^- (.*$)/gm, '<li class="ml-4 list-disc text-slate-600 dark:text-slate-300">$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal text-slate-600 dark:text-slate-300">$1</li>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  };

  const handleGenerate = async () => {
    setError('');
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      let content = '';
      let title = '';
      let contentType: 'recommendation' | 'remedial' | 'enrichment' | 'exercise' = 'recommendation';
      let quiz: ExerciseQuiz | undefined;

      switch (activeTab) {
        case 'recommendations':
          content = await generateRecommendations(students, subjects, language, maxScore);
          title = language === 'ar' ? 'توصيات تحسين نواتج التعلم' : 'Learning Outcomes Improvement Recommendations';
          contentType = 'recommendation';
          break;
        case 'remedial':
          content = await generateRemedialPlan(students, subjects, language, maxScore);
          title = language === 'ar' ? 'الخطة العلاجية' : 'Remedial Plan';
          contentType = 'remedial';
          break;
        case 'enrichment':
          content = await generateEnrichmentPlan(students, subjects, language, maxScore);
          title = language === 'ar' ? 'الخطة الإثرائية' : 'Enrichment Plan';
          contentType = 'enrichment';
          break;
        case 'exercise': {
          const weakStudent = students.find(student => student.level === exerciseLevel);
          const weakAreas = subjects.filter(subject => (weakStudent?.grades[subject] ?? 0) < maxScore * 0.6);
          quiz = await generateExercises(exerciseLevel, exerciseSubject, weakAreas, language, maxScore);
          title = quiz.title || `${language === 'ar' ? 'اختبار تفاعلي' : 'Interactive Quiz'} - ${exerciseSubject}`;
          content = language === 'ar' ? 'تم إنشاء اختبار تفاعلي.' : 'Interactive quiz generated successfully.';
          contentType = 'exercise';
          break;
        }
      }

      dispatch({
        type: 'ADD_AI_CONTENT',
        payload: {
          id: Date.now().toString(),
          type: contentType,
          level: activeTab === 'exercise' ? exerciseLevel : 'all',
          title,
          content,
          quiz,
          timestamp: Date.now(),
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <FileText className="mb-4 h-16 w-16 opacity-50" />
        <p className="text-lg">{t('noData', language)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-900/20 dark:text-emerald-300">
        {t('apiManagedSecurely', language)}
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setError('');
            }}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'exercise' && (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700/50 dark:bg-slate-800/50">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">{t('selectLevel', language)}</label>
              <select
                value={exerciseLevel}
                onChange={e => setExerciseLevel(e.target.value as StudentLevel)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                {(['excellent', 'veryGood', 'good', 'acceptable', 'weak'] as StudentLevel[]).map(level => (
                  <option key={level} value={level}>
                    {getLevelLabel(level, language)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">{t('selectSubject', language)}</label>
              <select
                value={exerciseSubject}
                onChange={e => setExerciseSubject(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            {language === 'ar'
              ? `سيتم إنشاء اختبار تفاعلي بمستوى ${getLevelLabel(exerciseLevel, language)} في مادة ${exerciseSubject}`
              : `An interactive quiz will be created at ${getLevelLabel(exerciseLevel, language)} level for ${exerciseSubject}`}
          </p>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            {t('generating', language)}
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            {activeTab === 'recommendations' && t('generateRecommendations', language)}
            {activeTab === 'remedial' && `${t('generatePlan', language)} - ${t('remedialPlan', language)}`}
            {activeTab === 'enrichment' && `${t('generatePlan', language)} - ${t('enrichmentPlan', language)}`}
            {activeTab === 'exercise' && t('generateExercises', language)}
          </>
        )}
      </button>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">{language === 'ar' ? 'خطأ' : 'Error'}</p>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      )}

      {filteredContents.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => dispatch({ type: 'CLEAR_AI_CONTENTS' })}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
            {language === 'ar' ? 'مسح الكل' : 'Clear All'}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {filteredContents.map(item => (
          <div key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700/50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 px-5 py-3 dark:border-slate-700/50">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">{item.title}</h3>
              </div>
              <span className="text-xs text-slate-400">
                {new Date(item.timestamp).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
              </span>
            </div>
            <div className="p-5">
              {item.type === 'exercise' && item.quiz ? (
                <InteractiveQuiz quiz={item.quiz} />
              ) : (
                <div
                  className="prose prose-sm max-w-none leading-relaxed text-slate-600 dark:prose-invert dark:text-slate-300"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(item.content) }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredContents.length === 0 && !isLoading && (
        <div className="py-12 text-center text-slate-400">
          <Sparkles className="mx-auto mb-3 h-12 w-12 opacity-50" />
          <p>
            {language === 'ar'
              ? 'اضغط على زر التوليد لإنشاء محتوى بالذكاء الاصطناعي'
              : 'Click the generate button to create AI-powered content'}
          </p>
        </div>
      )}
    </div>
  );
}
