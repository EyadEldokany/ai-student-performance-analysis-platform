import { useState, useRef } from 'react';
import { useApp, t } from '../contexts/AppContext';
import { Upload, Image, FileText, Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { analyzeExamImage, generateWorksheetFromSkills, GeneratedWorksheet } from '../utils/api';

export default function WorksheetGenerator() {
  const { state, dispatch } = useApp();
  const { language, students, subjects, maxScore } = state;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<{
    subject: string;
    gradeLevel: string;
    skills: string[];
    topics: string[];
    questionTypes: string[];
    difficulty: string;
    curriculumStandards: string[];
  } | null>(null);
  const [generatedWorksheet, setGeneratedWorksheet] = useState<GeneratedWorksheet | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (file: File) => {
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedImage(result);
      setExtractedSkills(null);
      setGeneratedWorksheet(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files?.[0]) {
      handleImageSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError('');

    try {
      const skills = await analyzeExamImage(selectedImage);
      setExtractedSkills(skills);
    } catch (err) {
      setError(err instanceof Error ? err.message : language === 'ar' ? 'فشل تحليل الصورة' : 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateWorksheet = async () => {
    if (!extractedSkills) return;

    setIsGenerating(true);
    setError('');

    try {
      const studentLevels = Array.from(new Set(students.map(s => s.level)));
      const worksheet = await generateWorksheetFromSkills(
        extractedSkills.skills,
        extractedSkills.topics,
        extractedSkills.subject,
        extractedSkills.gradeLevel,
        studentLevels,
        language,
        maxScore
      );
      setGeneratedWorksheet(worksheet);
    } catch (err) {
      setError(err instanceof Error ? err.message : language === 'ar' ? 'فشل توليد ورقة العمل' : 'Failed to generate worksheet');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetAll = () => {
    setSelectedImage(null);
    setExtractedSkills(null);
    setGeneratedWorksheet(null);
    setError('');
  };

  const renderMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3 py-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-xl shadow-purple-500/25 mb-2">
          <Image className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
          {language === 'ar' ? 'توليد أوراق العمل الذكية' : 'Smart Worksheet Generator'}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          {language === 'ar'
            ? 'ارفع صورة من اختبار لاستخراج المهارات والمواضيع تلقائياً، ثم ولّد أوراق عمل مخصصة بناءً على مستويات الطلاب'
            : 'Upload an exam image to automatically extract skills and topics, then generate customized worksheets based on student levels'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <p className="font-medium text-red-700 dark:text-red-300">
                {language === 'ar' ? 'خطأ' : 'Error'}
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Upload Image */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
            1
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            {language === 'ar' ? 'رفع صورة الاختبار' : 'Upload Exam Image'}
          </h3>
        </div>

        {!selectedImage ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10"
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
              className="hidden"
            />
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-300 font-medium">
              {language === 'ar' ? 'اسحب وأفلت الصورة هنا أو انقر للتصفح' : 'Drag and drop image here or click to browse'}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {language === 'ar' ? 'PNG, JPG حتى 5MB' : 'PNG, JPG up to 5MB'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <img src={selectedImage} alt="Selected exam" className="w-full h-64 object-cover" />
            </div>
            <div className="flex gap-3">
              <button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {language === 'ar' ? 'جاري التحليل...' : 'Analyzing...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {language === 'ar' ? 'تحليل الصورة' : 'Analyze Image'}
                  </>
                )}
              </button>
              <button
                onClick={resetAll}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Extracted Skills */}
      {extractedSkills && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-800 dark:bg-emerald-900/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              2
            </div>
            <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
              {language === 'ar' ? 'المهارات المستخرجة' : 'Extracted Skills'}
            </h3>
            <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {language === 'ar' ? 'المادة' : 'Subject'}
              </p>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                {extractedSkills.subject}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {language === 'ar' ? 'المستوى الدراسي' : 'Grade Level'}
              </p>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                {extractedSkills.gradeLevel}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {language === 'ar' ? 'مستوى الصعوبة' : 'Difficulty'}
              </p>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                {extractedSkills.difficulty}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {language === 'ar' ? 'أنواع الأسئلة' : 'Question Types'}
              </p>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                {extractedSkills.questionTypes.join('، ')}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2">
              {language === 'ar' ? 'المهارات المطلوبة' : 'Required Skills'}
            </p>
            <div className="flex flex-wrap gap-2">
              {extractedSkills.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2">
              {language === 'ar' ? 'المواضيع المغطاة' : 'Topics Covered'}
            </p>
            <div className="flex flex-wrap gap-2">
              {extractedSkills.topics.map((topic, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {!generatedWorksheet && (
            <button
              onClick={generateWorksheet}
              disabled={isGenerating || students.length === 0}
              className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {language === 'ar' ? 'جاري التوليد...' : 'Generating...'}
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  {students.length === 0
                    ? language === 'ar'
                      ? 'أدخل بيانات الطلاب أولاً'
                      : 'Enter student data first'
                    : language === 'ar'
                    ? 'توليد ورقة العمل'
                    : 'Generate Worksheet'}
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Step 3: Generated Worksheet */}
      {generatedWorksheet && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {generatedWorksheet.title}
            </h3>
            <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />
          </div>

          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/40 p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'ar' ? 'المادة' : 'Subject'}
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                {generatedWorksheet.subject}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/40 p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'ar' ? 'الوقت المقدر' : 'Estimated Time'}
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                {generatedWorksheet.estimatedTime}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/40 p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'ar' ? 'الدرجة الكلية' : 'Total Points'}
              </p>
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                {generatedWorksheet.totalPoints}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {generatedWorksheet.sections.map((section, sectionIdx) => (
              <div
                key={sectionIdx}
                className="rounded-xl border border-slate-200 dark:border-slate-700 p-4"
              >
                <h4 className="font-bold text-slate-800 dark:text-white mb-2">
                  {section.sectionTitle}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  {language === 'ar' ? 'المهارة المستهدفة:' : 'Target Skill:'} {section.skillFocus}
                </p>
                <div className="space-y-3">
                  {section.questions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="rounded-lg bg-slate-50 dark:bg-slate-900/40 p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          <span className="font-medium">{qIdx + 1}.</span> {q.question}
                        </p>
                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                          {q.points} {language === 'ar' ? 'نقطة' : 'pts'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        <span className="font-medium">{language === 'ar' ? 'النوع:' : 'Type:'}</span>{' '}
                        {q.type}
                      </p>
                      <details className="mt-2">
                        <summary className="text-xs font-medium text-emerald-600 dark:text-emerald-400 cursor-pointer">
                          {language === 'ar' ? 'عرض الإجابة النموذجية' : 'Show model answer'}
                        </summary>
                        <p
                          className="mt-2 text-sm text-emerald-700 dark:text-emerald-300"
                          dangerouslySetInnerHTML={{ __html: renderMarkdown(q.answer) }}
                        />
                      </details>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
            >
              {language === 'ar' ? 'طباعة ورقة العمل' : 'Print Worksheet'}
            </button>
            <button
              onClick={resetAll}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {language === 'ar' ? 'بدء جديد' : 'Start Over'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
