import React, { useState } from "react";
import { Subject, TutorResponse } from "../types";
import {
  Bot,
  Sparkles,
  Send,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  HelpCircle,
  FileText,
  RefreshCw,
} from "lucide-react";

interface TutorViewProps {
  subjects: Subject[];
  gradeLevel: string;
}

export const TutorView: React.FC<TutorViewProps> = ({ subjects, gradeLevel }) => {
  const [selectedSubject, setSelectedSubject] = useState("Physics");
  const [questionInput, setQuestionInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tutorOutput, setTutorOutput] = useState<TutorResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const sampleQuestions = [
    { subject: "Mathematics", q: "How do you derive the quadratic formula ax² + bx + c = 0 by completing the square?" },
    { subject: "Physics", q: "State and derive Ohm's Law V=IR and explain factors affecting resistance." },
    { subject: "Chemistry", q: "Explain Le Chatelier's Principle and how temperature changes affect dynamic equilibrium." },
    { subject: "Computer Science", q: "Compare 'for' loop vs 'while' loop in C programming with code examples." },
    { subject: "Biology", q: "Explain the structure and step-by-step function of a human nephron in urine formation." },
  ];

  const handleAskTutor = async (customQ?: string) => {
    const q = customQ || questionInput;
    if (!q.trim()) return;

    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: selectedSubject,
          question: q,
          gradeLevel,
        }),
      });

      const data = await res.json();
      if (data.success && data.answer) {
        setTutorOutput(data.answer);
      } else {
        setErrorMsg(data.error || "Could not fetch AI solution.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to connect to AI Tutor API.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2 tracking-tight">
          <Bot className="w-6 h-6 text-violet-400" /> Obsidian AI Apex Tutor & Board Solver
        </h1>
        <p className="text-slate-400 text-xs">
          24/7 AI tutor for Matric & High School STEM questions with step-by-step board exam scoring guidelines.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-48">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Select Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-2.5 text-xs font-bold outline-none focus:border-violet-500"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Ask any question, formula, or problem
            </label>
            <input
              type="text"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder="e.g. How to solve quadratic equation by factoring, or explain Coulomb's law..."
              className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-2.5 text-xs outline-none focus:border-violet-500"
            />
          </div>

          <div className="sm:self-end">
            <button
              onClick={() => handleAskTutor()}
              disabled={loading || !questionInput.trim()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-violet-900/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Ask Tutor</span>
            </button>
          </div>
        </div>

        {/* Preset Sample Prompts */}
        <div className="pt-2">
          <span className="text-[11px] font-semibold text-slate-400 block mb-2">High-Yield Exam Samples:</span>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedSubject(sample.subject);
                  setQuestionInput(sample.q);
                  handleAskTutor(sample.q);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-white/5 text-slate-300 transition"
              >
                {sample.subject}: {sample.q.slice(0, 45)}...
              </button>
            ))}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Answer Output */}
      {tutorOutput && (
        <div className="bg-slate-900/90 border border-violet-500/30 rounded-2xl p-6 lg:p-8 space-y-6 shadow-2xl animate-in fade-in duration-300">
          {/* Direct Summary Header */}
          <div className="space-y-3 border-b border-white/10 pb-5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[11px] font-bold">
                {selectedSubject} Apex Tutor Solution
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white leading-snug">{tutorOutput.directAnswer}</h2>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {tutorOutput.keyConcepts.map((concept, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                  #{concept}
                </span>
              ))}
            </div>
          </div>

          {/* Step By Step Breakdown */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" /> Step-by-Step Derivation & Explanation
            </h3>

            <div className="space-y-3">
              {tutorOutput.stepByStepSolution.map((step) => (
                <div key={step.stepNumber} className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-xs font-bold flex items-center justify-center">
                      {step.stepNumber}
                    </span>
                    <h4 className="text-xs font-bold text-white">{step.title}</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-7">{step.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Formulas / Definitions */}
          {tutorOutput.importantFormulasOrDefinitions.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-950/90 border border-blue-500/30 space-y-2">
              <h4 className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4" /> Formulas & Definitions to Memorize
              </h4>
              <ul className="list-disc list-inside text-xs text-slate-200 space-y-1">
                {tutorOutput.importantFormulasOrDefinitions.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Board Exam Scoring Tips */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
            <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" /> Board Exam Scoring Guideline
            </h4>
            <p className="text-xs text-amber-200/90">{tutorOutput.boardExamTips}</p>
          </div>

          {/* Common Pitfalls */}
          {tutorOutput.commonPitfallsToAvoid.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1">
              <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> Common Mistakes to Avoid in Exams
              </h4>
              <ul className="list-disc list-inside text-xs text-rose-200/90 space-y-1">
                {tutorOutput.commonPitfallsToAvoid.map((pitfall, idx) => (
                  <li key={idx}>{pitfall}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Practice Check Question */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
            <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-400" /> Quick Self-Check Practice
            </h4>
            <p className="text-xs text-emerald-200/90">{tutorOutput.practiceCheckQuestion}</p>
          </div>
        </div>
      )}
    </div>
  );
};
