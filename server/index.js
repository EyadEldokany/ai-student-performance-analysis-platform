import cors from "cors";
import express from "express";

const app = express();
const PORT = process.env.PORT || 3001;
const NVIDIA_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const NVIDIA_API_KEY =process.env.NVIDIA_API_KEY;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    aiConfigured: Boolean(NVIDIA_API_KEY),
  });
});

// New endpoint for image analysis (OCR + skills extraction)
app.post("/api/nim/analyze-image", async (req, res) => {
  const { imageData, model } = req.body ?? {};

  if (!NVIDIA_API_KEY || typeof NVIDIA_API_KEY !== "string") {
    return res.status(500).json({ error: "NVIDIA API key is not configured on the server." });
  }

  if (!imageData || typeof imageData !== "string") {
    return res.status(400).json({ error: "Image data (base64) is required." });
  }

  try {
    // Use NVIDIA's vision-capable model for image analysis
    const visionModel = "nvidia/neva-22b";
    
    const response = await fetch(NVIDIA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: visionModel,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `أنت خبير تربوي متخصص في تحليل الاختبارات التعليمية. قم بتحليل صورة الاختبار هذه واستخرج المعلومات التالية بصيغة JSON:
{
  "subject": "اسم المادة الدراسية",
  "gradeLevel": "الصف الدراسي أو المستوى",
  "skills": ["قائمة المهارات المطلوبة في الاختبار"],
  "topics": ["قائمة المواضيع المغطاة"],
  "questionTypes": ["أنواع الأسئلة الموجودة"],
  "difficulty": "مستوى الصعوبة العام",
  "curriculumStandards": ["المعايير التعليمية المستهدفة"]
}

استخرج جميع المهارات والمواضيع بدقة من صورة الاختبار. أعد فقط كائن JSON دون أي نص إضافي.`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 2048,
        top_p: 0.9,
      }),
    });

    const rawText = await response.text();
    let data = null;

    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      data = { raw: rawText };
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || data?.message || "NVIDIA API request failed.",
        details: data,
      });
    }

    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to reach NVIDIA API.",
      details: error instanceof Error ? error.message : "Unknown server error",
    });
  }
});

// New endpoint for generating worksheets based on extracted skills
app.post("/api/nim/generate-worksheet", async (req, res) => {
  const { skills, topics, subject, level, studentLevels, language, maxScore } = req.body ?? {};

  if (!NVIDIA_API_KEY || typeof NVIDIA_API_KEY !== "string") {
    return res.status(500).json({ error: "NVIDIA API key is not configured on the server." });
  }

  if (!Array.isArray(skills) || skills.length === 0) {
    return res.status(400).json({ error: "Skills array is required." });
  }

  try {
    const prompt = language === 'ar' 
      ? `أنت معلم خبير في مادة "${subject}". قم بإنشاء ورقة عمل تعليمية شاملة بناءً على:

المهارات المطلوبة: ${skills.join('، ')}
المواضيع: ${topics ? topics.join('، ') : 'جميع المواضيع'}
المستوى الدراسي: ${level || 'غير محدد'}
مستويات الطلاب: ${studentLevels ? studentLevels.join('، ') : 'جميع المستويات'}
الدرجة العظمى: ${maxScore || 100}

أعد الإجابة بصيغة JSON بهذا الشكل:
{
  "title": "عنوان ورقة العمل",
  "subject": "${subject}",
  "targetSkills": ["${skills.join('", "')}"],
  "sections": [
    {
      "sectionTitle": "عنوان القسم",
      "skillFocus": "المهارة المستهدفة",
      "questions": [
        {
          "question": "نص السؤال",
          "type": "نوع السؤال (اختيار من متعدد/مقال/إكمال)",
          "points": عدد النقاط,
          "answer": "الإجابة النموذجية"
        }
      ]
    }
  ],
  "totalPoints": ${maxScore || 100},
  "estimatedTime": "الوقت المقدر بالدقائق",
  "difficulty": "مستوى الصعوبة"
}

الشروط:
- أنشئ ورقة عمل متكاملة تغطي جميع المهارات المذكورة
- نوّع بين أنواع الأسئلة (اختيار من متعدد، إكمال، مقال قصير)
- خصص نقاطاً لكل سؤال بما لا يتجاوز المجموع الكلي
- اجعل الأسئلة مناسبة لمستويات الطلاب المختلفة
- أضف إجابات نموذجية لجميع الأسئلة`
      : `You are an expert teacher in "${subject}". Create a comprehensive worksheet based on:

Required Skills: ${skills.join(', ')}
Topics: ${topics ? topics.join(', ') : 'All topics'}
Grade Level: ${level || 'Unspecified'}
Student Levels: ${studentLevels ? studentLevels.join(', ') : 'All levels'}
Max Score: ${maxScore || 100}

Return JSON in this exact format:
{
  "title": "Worksheet Title",
  "subject": "${subject}",
  "targetSkills": ["${skills.join('", "')}"],
  "sections": [
    {
      "sectionTitle": "Section Title",
      "skillFocus": "Target skill",
      "questions": [
        {
          "question": "Question text",
          "type": "Question type (multiple-choice/essay/completion)",
          "points": point value,
          "answer": "Model answer"
        }
      ]
    }
  ],
  "totalPoints": ${maxScore || 100},
  "estimatedTime": "Estimated time in minutes",
  "difficulty": "Difficulty level"
}

Requirements:
- Create a complete worksheet covering all mentioned skills
- Vary question types (multiple-choice, completion, short essay)
- Assign points to each question without exceeding total
- Make questions suitable for different student levels
- Include model answers for all questions`;

    const response = await fetch(NVIDIA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model: model || "qwen/qwen3.5-397b-a17b",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 0.9,
      }),
    });

    const rawText = await response.text();
    let data = null;

    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      data = { raw: rawText };
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || data?.message || "NVIDIA API request failed.",
        details: data,
      });
    }

    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to reach NVIDIA API.",
      details: error instanceof Error ? error.message : "Unknown server error",
    });
  }
});

app.post("/api/nim/chat", async (req, res) => {
  const { messages, model, temperature, max_tokens, top_p } = req.body ?? {};

  if (!NVIDIA_API_KEY || typeof NVIDIA_API_KEY !== "string") {
    return res.status(500).json({ error: "NVIDIA API key is not configured on the server." });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  try {
    const response = await fetch(NVIDIA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${NVIDIA_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens,
        top_p,
      }),
    });

    const rawText = await response.text();
    let data = null;

    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      data = { raw: rawText };
    }

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || data?.message || "NVIDIA API request failed.",
        details: data,
      });
    }

    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      error: "Failed to reach NVIDIA API.",
      details: error instanceof Error ? error.message : "Unknown server error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`NVIDIA proxy server listening on http://localhost:${PORT}`);
});
