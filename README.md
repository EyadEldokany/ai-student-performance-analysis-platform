# AI Student Performance Analysis Platform

منصة ذكية لتحليل أداء الطلاب وتوليد أوراق العمل والاختبارات بناءً على المهارات المستخرجة من الصور باستخدام الذكاء الاصطناعي.

A smart platform for analyzing student performance and generating worksheets and quizzes based on skills extracted from images using AI.

## ✨ الميزات الرئيسية | Key Features

### 1. 📊 تحليل أداء الطلاب | Student Performance Analysis
- رفع ملفات Excel أو إدخال البيانات يدوياً
- Upload Excel files or enter data manually
- تصنيف الطلاب حسب المستويات (ممتاز، جيد جداً، جيد، مقبول، ضعيف)
- Student categorization by levels (Excellent, Very Good, Good, Acceptable, Weak)
- تحليل إحصائي شامل (المتوسط، الوسيط، الانحراف المعياري، إلخ)
- Comprehensive statistical analysis (Mean, Median, Standard Deviation, etc.)

### 2. 🖼️ تحليل صور الاختبارات | Exam Image Analysis **(جديد | New)**
- رفع صورة من اختبار لاستخراج المهارات والمواضيع تلقائياً
- Upload an exam image to automatically extract skills and topics
- استخدام NVIDIA NEVA-22B للتعرف البصري على المحتوى التعليمي
- Uses NVIDIA NEVA-22B for visual recognition of educational content
- استخرج:
  - Extracts:
    - المادة الدراسية | Subject
    - المستوى الدراسي | Grade Level
    - المهارات المطلوبة | Required Skills
    - المواضيع المغطاة | Topics Covered
    - أنواع الأسئلة | Question Types
    - مستوى الصعوبة | Difficulty Level
    - المعايير التعليمية | Curriculum Standards

### 3. 📝 توليد أوراق العمل الذكية | Smart Worksheet Generation **(جديد | New)**
- توليد أوراق عمل مخصصة بناءً على المهارات المستخرجة من الصور
- Generate customized worksheets based on skills extracted from images
- تصميم أسئلة متنوعة (اختيار من متعدد، إكمال، مقال قصير)
- Varied question types (Multiple-choice, Completion, Short essay)
- تخصيص المحتوى حسب مستويات الطلاب
- Content customization based on student levels
- إجابات نموذجية لجميع الأسئلة
- Model answers for all questions
- قابلية الطباعة والتصدير
- Printable and exportable

### 4. 🎯 الخطط العلاجية والإثرائية | Remedial & Enrichment Plans
- خطط علاجية للطلاب الضعاف
- Remedial plans for weak students
- خطط إثرائية للطلاب المتميزين
- Enrichment plans for outstanding students
- توصيات ذكية لتحسين نواتج التعلم
- Smart recommendations for improving learning outcomes

### 5. 📚 الاختبارات التفاعلية | Interactive Quizzes
- توليد اختبارات تفاعلية حسب المادة والمستوى
- Generate interactive quizzes by subject and level
- تصحيح تلقائي مع شرح الإجابات
- Auto-correction with answer explanations
- تتبع التقدم والنتائج
- Progress and score tracking

## 🛠️ التقنيات المستخدمة | Technologies Used

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS
- **Backend**: Express.js, Node.js
- **AI**: NVIDIA NIM API (Qwen 3.5, NEVA-22B)
- **Data Processing**: XLSX for Excel parsing

## 🚀 البدء السريع | Quick Start

### المتطلبات | Prerequisites
- Node.js 18+
- NVIDIA API Key (احصل عليه من https://build.nvidia.com)

### التثبيت | Installation

```bash
# تثبيت المكتبات | Install dependencies
npm install

# تشغيل التطبيق في وضع التطوير | Run in development mode
npm run dev

# البناء للإنتاج | Build for production
npm run build

# تشغيل الخادم | Start server
npm run start:server
```

### إعداد مفتاح NVIDIA | NVIDIA API Key Setup

1. احصل على مفتاح API من https://build.nvidia.com
2. Set the environment variable:
   ```bash
   export NVIDIA_API_KEY="your-api-key-here"
   ```

## 📋 كيفية الاستخدام | How to Use

### تحليل صورة اختبار وتوليد ورقة عمل | Analyze Exam Image & Generate Worksheet

1. انتقل إلى تبويب "أوراق العمل" | Go to "Worksheets" tab
2. ارفع صورة من اختبار | Upload an exam image
3. انقر على "تحليل الصورة" | Click "Analyze Image"
4. راجع المهارات المستخرجة | Review extracted skills
5. انقر على "توليد ورقة العمل" | Click "Generate Worksheet"
6. اطبع أو احفظ ورقة العمل | Print or save the worksheet

### رفع بيانات الطلاب | Upload Student Data

1. انتقل إلى تبويب "إدخال البيانات" | Go to "Data Input" tab
2. اختر "رفع ملف Excel" أو "إدخال يدوي" | Choose "Upload Excel" or "Manual Entry"
3. اتبع التنسيق المطلوب | Follow the required format
4. انقر على "تحميل بيانات تجريبية" للتجربة | Click "Load Sample Data" to try

## 📁 تنسيق ملف Excel | Excel File Format

| الاسم | الرياضيات | العلوم | اللغة العربية | اللغة الإنجليزية |
|-------|-----------|-------|---------------|------------------|
| أحمد | 85 | 90 | 78 | 88 |
| فاطمة | 92 | 88 | 95 | 91 |

## 🔌 نقاط النهاية للخادم | Server Endpoints

- `GET /api/health` - فحص حالة النظام | Health check
- `POST /api/nim/chat` - محادثة عامة مع NVIDIA NIM | General chat with NVIDIA NIM
- `POST /api/nim/analyze-image` - تحليل صور الاختبارات **(جديد | New)** | Analyze exam images
- `POST /api/nim/generate-worksheet` - توليد أوراق العمل **(جديد | New)** | Generate worksheets

## 📝 الترخيص | License

MIT License

## 👨‍💻 المساهمة | Contributing

المساهمات مرحب بها! يرجى فتح issue أو pull request.

Contributions are welcome! Please open an issue or pull request.