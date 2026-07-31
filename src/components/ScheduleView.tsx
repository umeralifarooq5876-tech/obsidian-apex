import React, { useState } from "react";
import { Subject, ScheduleSlot, StudyPlan } from "../types";
import {
  Sparkles,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  RefreshCw,
  Layers,
  Award,
  Sliders,
  Check,
} from "lucide-react";

interface ScheduleViewProps {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  schedule: ScheduleSlot[];
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleSlot[]>>;
  activePlan: StudyPlan | null;
  setActivePlan: (plan: StudyPlan) => void;
  gradeLevel: string;
  setGradeLevel: (val: string) => void;
  boardName: string;
  setBoardName: (val: string) => void;
  examDate: string;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  subjects,
  setSubjects,
  schedule,
  setSchedule,
  activePlan,
  setActivePlan,
  gradeLevel,
  setGradeLevel,
  boardName,
  setBoardName,
  examDate,
}) => {
  const [dailyHours, setDailyHours] = useState(4);
  const [weakTopicsInput, setWeakTopicsInput] = useState(
    "Mathematics Trigonometry & Circle Theorems, Physics Electrostatics, Organic Chemistry"
  );
  const [learningStyle, setLearningStyle] = useState("Balanced Pomodoro focus blocks");

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGenerateAIPlan = async () => {
    setIsGenerating(true);
    setErrorMsg("");

    try {
      const selectedSubjectNames = subjects.map((s) => s.name);
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gradeLevel,
          board: boardName,
          examDate,
          dailyHours,
          subjects: selectedSubjectNames,
          weakTopics: weakTopicsInput,
          learningStyle,
        }),
      });

      const data = await res.json();
      if (data.success && data.plan) {
        setActivePlan(data.plan);

        // Convert generated AI schedule slots into app schedule state
        if (data.plan.scheduleSlots && data.plan.scheduleSlots.length > 0) {
          const newSlots: ScheduleSlot[] = data.plan.scheduleSlots.map((slot: any, idx: number) => ({
            id: `ai-slot-${Date.now()}-${idx}`,
            timeSlot: slot.timeSlot,
            subject: slot.subject,
            topic: slot.topic,
            activityType: slot.activityType || "Concept Mastery",
            durationMinutes: slot.durationMinutes || 60,
            completed: false,
            day: "Today",
          }));
          setSchedule(newSlots);
        }
      } else {
        setErrorMsg(data.error || "Failed to generate plan. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Error communicating with AI service.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleTopicCompleted = (subjectId: string, topicId: string) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        const updatedTopics = s.topics.map((t) =>
          t.id === topicId ? { ...t, completed: !t.completed } : t
        );
        const completedCount = updatedTopics.filter((t) => t.completed).length;
        return {
          ...s,
          topics: updatedTopics,
          completedChapters: Math.min(s.totalChapters, completedCount),
        };
      })
    );
  };

  const handleTopicConfidenceChange = (
    subjectId: string,
    topicId: string,
    conf: "weak" | "moderate" | "mastered"
  ) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        const updatedTopics = s.topics.map((t) =>
          t.id === topicId ? { ...t, confidence: conf } : t
        );
        return { ...s, topics: updatedTopics };
      })
    );
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2 tracking-tight">
            <Calendar className="w-6 h-6 text-violet-400" /> AI Study Schedule & Syllabus Manager
          </h1>
          <p className="text-slate-400 text-xs">
            Generate custom daily study timetables tailored for Matric & Board exam grading criteria.
          </p>
        </div>

        <button
          onClick={handleGenerateAIPlan}
          disabled={isGenerating}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-violet-900/30 flex items-center gap-2 transition disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Generating AI Schedule...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Timetable</span>
            </>
          )}
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Planner Controls Form */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <Sliders className="w-4 h-4 text-violet-400" /> Academic Profile & Study Budget Setup
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Grade / Level</label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-2.5 text-xs outline-none focus:border-violet-500"
            >
              <option value="9th Grade (Matric Part 1)">9th Grade (Matric Part 1)</option>
              <option value="10th Grade (Matric Part 2)">10th Grade (Matric Part 2)</option>
              <option value="Pre-1st Year / FSC">Pre-1st Year / FSC</option>
              <option value="General High School">General High School</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Education Board</label>
            <select
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-2.5 text-xs outline-none focus:border-violet-500"
            >
              <option value="Punjab Board (BISE)">Punjab Board (BISE Lahore/Rawalpindi)</option>
              <option value="Federal Board (FBISE)">Federal Board (FBISE Islamabad)</option>
              <option value="Sindh / KPK / Cambridge">Sindh / KPK / Cambridge O Levels</option>
              <option value="General High School">General High School</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Daily Study Hours: <span className="text-violet-400 font-bold">{dailyHours} Hours</span>
            </label>
            <input
              type="range"
              min={2}
              max={10}
              value={dailyHours}
              onChange={(e) => setDailyHours(Number(e.target.value))}
              className="w-full accent-violet-500 bg-slate-950 h-2 rounded-lg cursor-pointer mt-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Weak Topics & High-Priority Exam Target Areas
          </label>
          <input
            type="text"
            value={weakTopicsInput}
            onChange={(e) => setWeakTopicsInput(e.target.value)}
            placeholder="e.g. Physics Geometrical Optics, Math Circle Theorems, Organic Reactions..."
            className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-2.5 text-xs outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* Generated Plan Section */}
      {activePlan ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-violet-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">AI Active Plan</span>
                <h2 className="text-xl font-extrabold text-white mt-0.5">{activePlan.planTitle}</h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Target Budget</span>
                <p className="text-sm font-bold text-emerald-400">{activePlan.dailyTargetHours} Hours / Day</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{activePlan.overview}</p>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-300">
              <strong className="text-violet-300">Weekly Strategy: </strong>
              {activePlan.weeklyStrategy}
            </div>

            {/* Subject Allocation Breakdown */}
            <div className="pt-2">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" /> Weekly Subject Hours & Exam Focus
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {activePlan.subjectBreakdown.map((sb, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{sb.subject}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-bold uppercase">
                        {sb.priority}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-400 font-medium">
                      Allocated: {sb.allocatedWeeklyHours} hours/week
                    </p>
                    <div className="text-[11px] text-slate-400">
                      <strong>Focus Topics: </strong>
                      {sb.keyFocusTopics.join(", ")}
                    </div>
                    <div className="text-[11px] text-amber-300 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                      💡 {sb.examTip}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Exam Countdown Milestone Phases */}
            <div className="pt-2">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" /> Exam Road to Apex Milestones
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {activePlan.examCountdownStrategy.map((phase, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 space-y-1">
                    <span className="text-[10px] text-violet-400 font-bold uppercase">{phase.timeframe}</span>
                    <h4 className="text-xs font-bold text-white">{phase.phase}</h4>
                    <p className="text-[11px] text-slate-300">{phase.goal}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Today's Timetable Grid */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" /> Daily Time Slot Schedule
          </h2>
          <span className="text-xs text-slate-400">{schedule.length} Time Blocks Configured</span>
        </div>

        <div className="space-y-3">
          {schedule.map((slot) => (
            <div
              key={slot.id}
              className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                slot.completed ? "bg-slate-950/40 border-emerald-500/30 opacity-70" : "bg-slate-950/80 border-white/10"
              }`}
            >
              <div className="flex items-start md:items-center gap-3">
                <input
                  type="checkbox"
                  checked={slot.completed}
                  onChange={() =>
                    setSchedule((prev) =>
                      prev.map((s) => (s.id === slot.id ? { ...s, completed: !s.completed } : s))
                    )
                  }
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer mt-1 md:mt-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-violet-400">{slot.timeSlot}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                      {slot.activityType}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-0.5">
                    {slot.subject}: <span className="text-slate-300 font-normal">{slot.topic}</span>
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400">{slot.durationMinutes} mins</span>
                <button
                  onClick={() => setSchedule((prev) => prev.filter((s) => s.id !== slot.id))}
                  className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Remove Slot"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subject Syllabus Topic Manager */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-6">
        <div className="border-b border-white/10 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-violet-400" /> High School Subject Syllabus & Topic Diagnostics
          </h2>
          <p className="text-xs text-slate-400">
            Click topics to toggle completion, or adjust confidence levels (Weak, Moderate, Mastered) to fuel the AI engine.
          </p>
        </div>

        <div className="space-y-6">
          {subjects.map((subj) => (
            <div key={subj.id} className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{subj.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                    {subj.code}
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-400">
                  {subj.completedChapters} / {subj.totalChapters} Chapters Done
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {subj.topics.map((top) => (
                  <div
                    key={top.id}
                    className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition ${
                      top.completed
                        ? "bg-slate-900/40 border-emerald-500/20 text-slate-400"
                        : "bg-slate-900/90 border-white/5 text-slate-200"
                    }`}
                  >
                    <div
                      className="flex items-center gap-2 cursor-pointer flex-1 mr-2"
                      onClick={() => handleToggleTopicCompleted(subj.id, top.id)}
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border ${
                          top.completed
                            ? "bg-emerald-500 border-emerald-400 text-white"
                            : "border-slate-600 bg-slate-800"
                        }`}
                      >
                        {top.completed && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className={top.completed ? "line-through text-slate-400" : "font-medium"}>
                        {top.name}
                      </span>
                    </div>

                    {/* Confidence Selector */}
                    <select
                      value={top.confidence}
                      onChange={(e) =>
                        handleTopicConfidenceChange(
                          subj.id,
                          top.id,
                          e.target.value as "weak" | "moderate" | "mastered"
                        )
                      }
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border outline-none bg-slate-950 ${
                        top.confidence === "weak"
                          ? "text-rose-400 border-rose-500/30"
                          : top.confidence === "moderate"
                          ? "text-amber-400 border-amber-500/30"
                          : "text-emerald-400 border-emerald-500/30"
                      }`}
                    >
                      <option value="weak">Weak</option>
                      <option value="moderate">Moderate</option>
                      <option value="mastered">Mastered</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
