import React, { useState } from "react";
import { Subject, Flashcard, Quiz } from "../types";
import { DEFAULT_QUIZ } from "../data/defaultData";
import {
  BrainCircuit,
  Sparkles,
  Award,
  Layers,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Plus,
  BookOpen,
} from "lucide-react";

interface QuizVaultViewProps {
  subjects: Subject[];
  flashcards: Flashcard[];
  setFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
}

export const QuizVaultView: React.FC<QuizVaultViewProps> = ({
  subjects,
  flashcards,
  setFlashcards,
}) => {
  const [activeTabMode, setActiveTabMode] = useState<"quiz" | "flashcards">("quiz");

  // Quiz State
  const [activeQuiz, setActiveQuiz] = useState<Quiz>(DEFAULT_QUIZ);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // AI Quiz Generator Form
  const [quizSubject, setQuizSubject] = useState("Physics");
  const [quizTopic, setQuizTopic] = useState("Current Electricity & Waves");
  const [quizDiff, setQuizDiff] = useState("Medium");
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  // Flashcard State
  const [selectedFCSubject, setSelectedFCSubject] = useState<string>("All");
  const [currentFCIndex, setCurrentFCIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // AI Summary & Flashcard Generator Form
  const [fcSubjectInput, setFcSubjectInput] = useState("Chemistry");
  const [fcChapterInput, setFcChapterInput] = useState("Organic Chemistry & Hydrocarbons");
  const [isGeneratingFC, setIsGeneratingFC] = useState(false);

  const handleGenerateAIQuiz = async () => {
    setIsGeneratingQuiz(true);
    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: quizSubject,
          topic: quizTopic,
          difficulty: quizDiff,
          questionCount: 5,
        }),
      });
      const data = await res.json();
      if (data.success && data.quiz) {
        setActiveQuiz(data.quiz);
        setUserAnswers({});
        setIsSubmitted(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleGenerateAIFlashcards = async () => {
    setIsGeneratingFC(true);
    try {
      const res = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: fcSubjectInput,
          chapterTitle: fcChapterInput,
        }),
      });
      const data = await res.json();
      if (data.success && data.summary && data.summary.flashcards) {
        const newCards: Flashcard[] = data.summary.flashcards.map((fc: any) => ({
          id: `fc-${Date.now()}-${Math.random()}`,
          subject: fcSubjectInput,
          front: fc.front,
          back: fc.back,
          category: fc.category || fcChapterInput,
        }));
        setFlashcards((prev) => [...newCards, ...prev]);
        setSelectedFCSubject(fcSubjectInput);
        setCurrentFCIndex(0);
        setIsFlipped(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingFC(false);
    }
  };

  // Calculate Quiz Score
  const calculateScore = () => {
    let score = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) score++;
    });
    return score;
  };

  const filteredFlashcards =
    selectedFCSubject === "All"
      ? flashcards
      : flashcards.filter((f) => f.subject === selectedFCSubject);

  const currentCard = filteredFlashcards[currentFCIndex] || filteredFlashcards[0];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header & Sub-Nav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2 tracking-tight">
            <BrainCircuit className="w-6 h-6 text-emerald-400" /> Exam Practice & Flashcard Vault
          </h1>
          <p className="text-slate-400 text-xs">
            Test yourself with AI board exam MCQs and memorization flashcards.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-white/10">
          <button
            onClick={() => setActiveTabMode("quiz")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTabMode === "quiz"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            MCQ Exam Simulator
          </button>
          <button
            onClick={() => setActiveTabMode("flashcards")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTabMode === "flashcards"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Flashcards Vault ({flashcards.length})
          </button>
        </div>
      </div>

      {/* Mode A: MCQ Quiz Simulator */}
      {activeTabMode === "quiz" && (
        <div className="space-y-6">
          {/* AI Quiz Generator Config Box */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Sparkles className="w-4 h-4 text-emerald-400" /> AI Board MCQ Generator
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                <select
                  value={quizSubject}
                  onChange={(e) => setQuizSubject(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-2.5 text-xs font-bold outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Chapter / Topic</label>
                <input
                  type="text"
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  placeholder="e.g. Current Electricity & Waves..."
                  className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-2.5 text-xs outline-none"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleGenerateAIQuiz}
                  disabled={isGeneratingQuiz}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-900/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isGeneratingQuiz ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>Generate AI Quiz</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Quiz Card */}
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6 lg:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  {activeQuiz.subject} MCQ Practice
                </span>
                <h2 className="text-lg font-extrabold text-white mt-0.5">{activeQuiz.quizTitle}</h2>
              </div>

              {isSubmitted && (
                <div className="text-right">
                  <span className="text-xs text-slate-400">Score</span>
                  <p className="text-xl font-black text-emerald-400">
                    {calculateScore()} / {activeQuiz.questions.length}
                  </p>
                </div>
              )}
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {activeQuiz.questions.map((q, qIdx) => (
                <div key={q.id} className="p-5 rounded-xl bg-slate-950/80 border border-white/10 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      Q{qIdx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-white leading-relaxed">{q.questionText}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = userAnswers[qIdx] === optIdx;
                      const isCorrect = q.correctIndex === optIdx;

                      let btnStyle = "bg-slate-900 border-white/10 text-slate-300 hover:bg-slate-800";
                      if (isSelected) {
                        btnStyle = "bg-violet-600/30 border-violet-500 text-white font-bold";
                      }
                      if (isSubmitted) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-600/30 border-emerald-500 text-emerald-300 font-bold";
                        } else if (isSelected && !isCorrect) {
                          btnStyle = "bg-rose-600/30 border-rose-500 text-rose-300";
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={isSubmitted}
                          onClick={() => setUserAnswers({ ...userAnswers, [qIdx]: optIdx })}
                          className={`p-3 rounded-xl border text-xs text-left transition flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {isSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          {isSubmitted && isSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-rose-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {isSubmitted && (
                    <div className="mt-3 p-3 rounded-lg bg-slate-900 border border-white/5 text-xs text-slate-300 space-y-1">
                      <p className="font-semibold text-emerald-400">Explanation: {q.explanation}</p>
                      <p className="text-[11px] text-amber-300">💡 Exam Tip: {q.examTip}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Submit / Reset Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              {isSubmitted ? (
                <button
                  onClick={() => {
                    setUserAnswers({});
                    setIsSubmitted(false);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retake Quiz</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsSubmitted(true)}
                  disabled={Object.keys(userAnswers).length === 0}
                  className="px-8 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-900/30 disabled:opacity-50"
                >
                  Submit & Score Answers
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mode B: Flashcards Vault */}
      {activeTabMode === "flashcards" && (
        <div className="space-y-6">
          {/* AI Flashcards Generator Form */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Sparkles className="w-4 h-4 text-violet-400" /> AI Flashcard Deck Generator
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                <select
                  value={fcSubjectInput}
                  onChange={(e) => setFcSubjectInput(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-2.5 text-xs font-bold outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Chapter Title / Concept</label>
                <input
                  type="text"
                  value={fcChapterInput}
                  onChange={(e) => setFcChapterInput(e.target.value)}
                  placeholder="e.g. Le Chatelier's Principle or Trigonometric Identities..."
                  className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-2.5 text-xs outline-none"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleGenerateAIFlashcards}
                  disabled={isGeneratingFC}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-violet-900/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  {isGeneratingFC ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>Generate Deck</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-xs text-slate-400 font-semibold mr-2">Subject Filter:</span>
            {["All", ...subjects.map((s) => s.name)].map((sub) => (
              <button
                key={sub}
                onClick={() => {
                  setSelectedFCSubject(sub);
                  setCurrentFCIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedFCSubject === sub
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Flashcard Flip Interface */}
          {filteredFlashcards.length > 0 && currentCard ? (
            <div className="max-w-2xl mx-auto space-y-6">
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full min-h-[280px] rounded-2xl bg-gradient-to-b from-slate-900 to-indigo-950/60 border border-violet-500/30 p-8 flex flex-col items-center justify-center text-center cursor-pointer shadow-2xl transition-all duration-300 hover:border-violet-500/60 relative group"
              >
                <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-500/20 text-violet-300">
                  {currentCard.subject} • {currentCard.category}
                </span>

                <span className="absolute top-4 right-4 text-xs text-slate-500">
                  Click card to flip
                </span>

                <div className="my-auto px-4">
                  {!isFlipped ? (
                    <div className="space-y-3">
                      <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest">
                        FRONT (QUESTION / PROMPT)
                      </span>
                      <h3 className="text-xl font-extrabold text-white leading-relaxed">
                        {currentCard.front}
                      </h3>
                    </div>
                  ) : (
                    <div className="space-y-3 animate-in fade-in duration-200">
                      <span className="text-xs text-violet-400 font-bold uppercase tracking-widest">
                        BACK (ANSWER & KEY RECALL)
                      </span>
                      <p className="text-base font-medium text-slate-200 leading-relaxed">
                        {currentCard.back}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation & Spaced Repetition Buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setCurrentFCIndex((prev) => (prev > 0 ? prev - 1 : filteredFlashcards.length - 1));
                    setIsFlipped(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition border border-white/10"
                >
                  Previous
                </button>

                <span className="text-xs font-bold text-slate-400">
                  Card {currentFCIndex + 1} of {filteredFlashcards.length}
                </span>

                <button
                  onClick={() => {
                    setCurrentFCIndex((prev) => (prev < filteredFlashcards.length - 1 ? prev + 1 : 0));
                    setIsFlipped(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition shadow-md shadow-violet-900/30"
                >
                  Next Card
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 text-slate-400 text-xs">
              No flashcards found for this category. Click "Generate Deck" above!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
