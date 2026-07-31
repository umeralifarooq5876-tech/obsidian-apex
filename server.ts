import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "10mb" }));
  const PORT = 3000;

  // Initialize Gemini AI safely on server-side
  const getAI = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing in environment variables.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", hasAiKey: !!process.env.GEMINI_API_KEY });
  });

  // 1. AI Study Schedule & Timetable Generator
  app.post("/api/generate-plan", async (req, res) => {
    try {
      const {
        studentName,
        gradeLevel,
        board,
        examDate,
        targetGoal,
        dailyHours,
        preferredTime,
        subjects,
        weakTopics,
        learningStyle,
      } = req.body;

      const ai = getAI();
      const prompt = `You are an elite academic planner and exam preparation strategist for Matric and High School students.
Student Name: ${studentName || "Scholar"}
Grade Level: ${gradeLevel || "10th Grade / Matric Part 2"}
Education Board: ${board || "Punjab Board (BISE)"}
Target Exam Date: ${examDate || "April 2027"}
Target Grade / Percentage Goal: ${targetGoal || "95%+ / Top Position"}
Daily Available Study Hours: ${dailyHours || 4} hours/day
Preferred Time Slot of Day: ${preferredTime || "Evening/Night (7 PM - 12 AM)"}
Subjects included: ${JSON.stringify(subjects || [])}.
Weak/Priority topics to focus on: "${weakTopics || "Core concepts, Math derivations, Physics numericals, Organic Chemistry"}".
Learning Style & Pace: "${learningStyle || "Balanced Pomodoro focus blocks with active recall"}".

Create a comprehensive, highly structured weekly study plan and daily timetable schedule specifically customized for ${studentName || "the student"}'s schedule preferences and target goals.
Return JSON strictly adhering to the schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              planTitle: { type: Type.STRING },
              overview: { type: Type.STRING },
              weeklyStrategy: { type: Type.STRING },
              dailyTargetHours: { type: Type.NUMBER },
              subjectBreakdown: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    subject: { type: Type.STRING },
                    priority: { type: Type.STRING, description: "High, Medium, or Maintenance" },
                    allocatedWeeklyHours: { type: Type.NUMBER },
                    keyFocusTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
                    examTip: { type: Type.STRING },
                  },
                  required: ["subject", "priority", "allocatedWeeklyHours", "keyFocusTopics", "examTip"],
                },
              },
              scheduleSlots: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    timeSlot: { type: Type.STRING, description: "e.g. 04:00 PM - 05:00 PM" },
                    subject: { type: Type.STRING },
                    topic: { type: Type.STRING },
                    activityType: { type: Type.STRING, description: "Concept Mastery, Numerical Practice, Revision, or Quiz" },
                    durationMinutes: { type: Type.NUMBER },
                  },
                  required: ["timeSlot", "subject", "topic", "activityType", "durationMinutes"],
                },
              },
              examCountdownStrategy: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phase: { type: Type.STRING },
                    timeframe: { type: Type.STRING },
                    goal: { type: Type.STRING },
                  },
                  required: ["phase", "timeframe", "goal"],
                },
              },
            },
            required: [
              "planTitle",
              "overview",
              "weeklyStrategy",
              "dailyTargetHours",
              "subjectBreakdown",
              "scheduleSlots",
              "examCountdownStrategy",
            ],
          },
        },
      });

      const data = JSON.parse(response.text || "{}");
      res.json({ success: true, plan: data });
    } catch (err: any) {
      console.error("Error in /api/generate-plan:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to generate study plan" });
    }
  });

  // 2. AI Tutor & Homework Problem Solver
  app.post("/api/ai-tutor", async (req, res) => {
    try {
      const { subject, question, gradeLevel } = req.body;
      if (!question) {
        return res.status(400).json({ success: false, error: "Question is required." });
      }

      const ai = getAI();
      const prompt = `You are Apex Tutor, an expert AI tutor specializing in Matric and High School academic subjects (${subject || "General Science & Math"}, Grade: ${gradeLevel || "Matric"}).
Provide a friendly, structured, step-by-step academic explanation for this question:
"${question}"

Format your response in JSON according to the schema. Make the explanation crisp, clear, and easy for high school exam scoring.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              directAnswer: { type: Type.STRING, description: "Clear short core answer summary" },
              keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
              stepByStepSolution: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stepNumber: { type: Type.NUMBER },
                    title: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                  },
                  required: ["stepNumber", "title", "explanation"],
                },
              },
              importantFormulasOrDefinitions: { type: Type.ARRAY, items: { type: Type.STRING } },
              boardExamTips: { type: Type.STRING, description: "How to write this answer to get maximum marks in board exams" },
              commonPitfallsToAvoid: { type: Type.ARRAY, items: { type: Type.STRING } },
              practiceCheckQuestion: { type: Type.STRING, description: "A quick test question to verify understanding" },
            },
            required: [
              "directAnswer",
              "keyConcepts",
              "stepByStepSolution",
              "importantFormulasOrDefinitions",
              "boardExamTips",
              "commonPitfallsToAvoid",
              "practiceCheckQuestion",
            ],
          },
        },
      });

      const data = JSON.parse(response.text || "{}");
      res.json({ success: true, answer: data });
    } catch (err: any) {
      console.error("Error in /api/ai-tutor:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to process tutor question" });
    }
  });

  // 3. AI Quiz & Practice Generator
  app.post("/api/generate-quiz", async (req, res) => {
    try {
      const { subject, topic, questionCount, difficulty } = req.body;

      const ai = getAI();
      const prompt = `Generate a high-yield exam practice quiz for Matric / High School level.
Subject: ${subject || "Physics"}
Topic: ${topic || "Work, Energy & Power"}
Difficulty: ${difficulty || "Medium"}
Count: ${questionCount || 5} questions.

Strictly format the JSON to match the schema. Each question must have exactly 4 options, a correct option index (0-3), detailed solution, and relevant board exam tip.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              quizTitle: { type: Type.STRING },
              subject: { type: Type.STRING },
              topic: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    questionText: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.NUMBER },
                    explanation: { type: Type.STRING },
                    examTip: { type: Type.STRING },
                  },
                  required: ["id", "questionText", "options", "correctIndex", "explanation", "examTip"],
                },
              },
            },
            required: ["quizTitle", "subject", "topic", "questions"],
          },
        },
      });

      const data = JSON.parse(response.text || "{}");
      res.json({ success: true, quiz: data });
    } catch (err: any) {
      console.error("Error in /api/generate-quiz:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to generate quiz" });
    }
  });

  // 4. AI Flashcards & Chapter Summarizer
  app.post("/api/generate-summary", async (req, res) => {
    try {
      const { subject, chapterTitle, notesText } = req.body;

      const ai = getAI();
      const prompt = `Summarize and create high-retention flashcards for Matric/High School exam review.
Subject: ${subject || "Chemistry"}
Chapter/Topic: ${chapterTitle || "Chemical Bonding"}
Notes/Text Content: "${notesText || "Types of chemical bonds: Ionic, Covalent, Coordinate Covalent, Metallic. Electrostatic forces, sharing of valence electrons, Lewis structures, polar vs non-polar molecules."}"

Generate key chapter takeaways, 5 critical definitions, and 6 flashcards (Front prompt, Back answer). Return strict JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              chapterTitle: { type: Type.STRING },
              subject: { type: Type.STRING },
              summaryPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              keyTerms: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING },
                    definition: { type: Type.STRING },
                  },
                  required: ["term", "definition"],
                },
              },
              flashcards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    front: { type: Type.STRING },
                    back: { type: Type.STRING },
                    category: { type: Type.STRING },
                  },
                  required: ["id", "front", "back", "category"],
                },
              },
            },
            required: ["chapterTitle", "subject", "summaryPoints", "keyTerms", "flashcards"],
          },
        },
      });

      const data = JSON.parse(response.text || "{}");
      res.json({ success: true, summary: data });
    } catch (err: any) {
      console.error("Error in /api/generate-summary:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to generate summary" });
    }
  });

  // 5. AI Weak Topic Diagnostic & Exam Readiness
  app.post("/api/diagnostic-report", async (req, res) => {
    try {
      const { subjectPerformances, examDaysLeft } = req.body;

      const ai = getAI();
      const prompt = `You are the lead academic analyst for Obsidian Apex.
Analyze the following student progress data:
Days until board exams: ${examDaysLeft || 60}
Subject Confidence & Quiz History: ${JSON.stringify(subjectPerformances || [])}

Perform an AI diagnostic analysis. Estimate board exam readiness score (0-100%), identify top 3 weak areas, and generate a 7-day emergency focus blueprint. Return strict JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              readinessScore: { type: Type.NUMBER },
              gradePrediction: { type: Type.STRING, description: "e.g. A+ Grade (85-95% expected)" },
              overallStatus: { type: Type.STRING },
              criticalWeakAreas: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    subject: { type: Type.STRING },
                    topic: { type: Type.STRING },
                    riskLevel: { type: Type.STRING },
                    recommendedAction: { type: Type.STRING },
                  },
                  required: ["subject", "topic", "riskLevel", "recommendedAction"],
                },
              },
              actionPlan7Days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayNumber: { type: Type.NUMBER },
                    task: { type: Type.STRING },
                    targetHours: { type: Type.NUMBER },
                  },
                  required: ["dayNumber", "task", "targetHours"],
                },
              },
              motivationalDirective: { type: Type.STRING },
            },
            required: [
              "readinessScore",
              "gradePrediction",
              "overallStatus",
              "criticalWeakAreas",
              "actionPlan7Days",
              "motivationalDirective",
            ],
          },
        },
      });

      const data = JSON.parse(response.text || "{}");
      res.json({ success: true, report: data });
    } catch (err: any) {
      console.error("Error in /api/diagnostic-report:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to run diagnostic" });
    }
  });

  // Vite middleware for dev or static serving for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Obsidian Apex server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
