import React, { useState } from "react";
import { Subject, ScheduleSlot, ActiveTab } from "../types";
import {
  Clock,
  CheckCircle2,
  Play,
  Sparkles,
  Flame,
  Target,
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Award,
  Zap,
  Calendar,
  Layers,
} from "lucide-react";

interface DashboardViewProps {
  subjects: Subject[];
  schedule: ScheduleSlot[];
  onToggleScheduleItem: (id: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
  examDate: string;
  setExamDate: (date: string) => void;
  gradeLevel: string;
  boardName: string;
  streak: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  subjects,
  schedule,
  onToggleScheduleItem,
  setActiveTab,
  examDate,
  setExamDate,
  gradeLevel,
  boardName,
  streak,
}) => {
  const [isEditingExamDate, setIsEditingExamDate] = useState(false);

  // Calculate stats
  const totalChapters = subjects.reduce((acc, s) => acc + s.totalChapters, 0);
  const completedChapters = subjects.reduce((acc, s) => acc + s.completedChapters, 0);
  const overallProgressPercent = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

  const todaySlots = schedule;
  const completedTodaySlots = todaySlots.filter((s) => s.completed).length;
  const todayProgressPercent = todaySlots.length > 0 ? Math.round((completedTodaySlots / todaySlots.length) * 100) : 0;

  // Weak topics count
  const weakTopics = subjects.flatMap((s) => s.topics).filter((t) => t.confidence === "weak");

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Hero Banner: Student Goal & Exam Timer */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-white/10 p-6 lg:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>{gradeLevel} • {boardName}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Welcome back to <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-emerald-400">Obsidian Apex</span>
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Your AI-powered study command center. Stay ahead of your annual syllabus, track board exam deadlines, and master weak topics efficiently.
            </p>
          </div>

          {/* Exam Countdown Card */}
          <div className="bg-slate-900/90 border border-violet-500/30 p-4 rounded-xl flex flex-col justify-between min-w-[260px] shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Target className="w-4 h-4 text-violet-400" /> Board Exam Target
              </span>
              <button
                onClick={() => setIsEditingExamDate(!isEditingExamDate)}
                className="text-violet-400 hover:text-violet-300 underline font-semibold text-[11px]"
              >
                {isEditingExamDate ? "Done" : "Change Date"}
              </button>
            </div>

            {isEditingExamDate ? (
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="bg-slate-800 text-white border border-violet-500/50 rounded-lg p-2 text-sm w-full outline-none focus:ring-2 focus:ring-violet-500"
              />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                  {Math.max(
                    0,
                    Math.floor((new Date(examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  )}
                </span>
                <span className="text-sm font-bold text-slate-300">Days Left</span>
                <span className="text-xs text-slate-400 ml-auto font-mono">({examDate})</span>
              </div>
            )}

            <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/5">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(10, overallProgressPercent))}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>Syllabus Covered</span>
              <span className="text-emerald-400 font-bold">{overallProgressPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Total Subjects</p>
            <p className="text-2xl font-black text-white mt-1">{subjects.length}</p>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <BookOpen className="w-3 h-3" /> All High School Core
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Chapters Completed</p>
            <p className="text-2xl font-black text-white mt-1">
              {completedChapters} <span className="text-xs font-normal text-slate-400">/ {totalChapters}</span>
            </p>
            <p className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> {overallProgressPercent}% Complete
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Study Streak</p>
            <p className="text-2xl font-black text-amber-400 mt-1">{streak} Days</p>
            <p className="text-[11px] text-amber-300 flex items-center gap-1 mt-0.5">
              <Flame className="w-3 h-3 fill-amber-400" /> Active Fire Streak
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Priority Weak Topics</p>
            <p className="text-2xl font-black text-rose-400 mt-1">{weakTopics.length}</p>
            <p className="text-[11px] text-rose-300 flex items-center gap-1 mt-0.5">
              <AlertTriangle className="w-3 h-3" /> Requires AI Diagnostic
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Schedule & Quick AI Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Smart Timetable */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-violet-400" /> Today's Smart Timetable Schedule
              </h2>
              <p className="text-xs text-slate-400">
                Check off your study slots as you complete them. Built around active recall and subject rotation.
              </p>
            </div>
            <button
              id="btn-schedule-tab"
              onClick={() => setActiveTab("schedule")}
              className="px-3 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <span>AI Re-Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Today's Progress Ring Bar */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-emerald-500 flex items-center justify-center text-xs font-bold text-emerald-400">
                {todayProgressPercent}%
              </div>
              <div>
                <p className="text-xs font-bold text-white">Daily Target Completion</p>
                <p className="text-[11px] text-slate-400">
                  {completedTodaySlots} of {todaySlots.length} slots completed today
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("focus")}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/30 hover:bg-emerald-500 transition"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start Focus Sprint</span>
            </button>
          </div>

          {/* Schedule Slots List */}
          <div className="space-y-3">
            {todaySlots.map((slot) => {
              const subj = subjects.find((s) => s.name === slot.subject);
              return (
                <div
                  key={slot.id}
                  onClick={() => onToggleScheduleItem(slot.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    slot.completed
                      ? "bg-slate-900/40 border-emerald-500/30 opacity-75"
                      : "bg-slate-950/80 border-white/10 hover:border-violet-500/50 hover:bg-slate-900/90"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <input
                      type="checkbox"
                      checked={slot.completed}
                      onChange={() => {}} // parent onClick handles
                      className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-300">{slot.timeSlot}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-medium">
                          {slot.activityType}
                        </span>
                      </div>
                      <h4 className={`text-sm font-bold text-white mt-0.5 ${slot.completed ? "line-through text-slate-400" : ""}`}>
                        {slot.subject}: <span className="text-slate-200 font-normal">{slot.topic}</span>
                      </h4>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-400">{slot.durationMinutes} min</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Quick AI Tools & Weak Topic Alerts */}
        <div className="space-y-6">
          {/* AI Tools Palette */}
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Sparkles className="w-4 h-4 text-violet-400" /> Apex AI Toolkit
            </h3>

            <button
              onClick={() => setActiveTab("tutor")}
              className="w-full text-left p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/90 border border-white/5 hover:border-violet-500/30 transition group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-110 transition">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">AI Homework & Tutor Solver</h4>
                  <p className="text-[11px] text-slate-400">Step-by-step problem explanations</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition" />
            </button>

            <button
              onClick={() => setActiveTab("quiz")}
              className="w-full text-left p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/90 border border-white/5 hover:border-violet-500/30 transition group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">AI Practice Quiz & Flashcards</h4>
                  <p className="text-[11px] text-slate-400">Board exam MCQ practice generator</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
            </button>

            <button
              onClick={() => setActiveTab("diagnostics")}
              className="w-full text-left p-3 rounded-xl bg-slate-950/80 hover:bg-slate-800/90 border border-white/5 hover:border-violet-500/30 transition group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Weak Topic AI Diagnostic</h4>
                  <p className="text-[11px] text-slate-400">7-day emergency focus plan</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
            </button>
          </div>

          {/* Weak Topics Alert Box */}
          <div className="bg-slate-900/80 border border-rose-500/20 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> High-Priority Revision Queue
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                {weakTopics.length} Needed
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {weakTopics.slice(0, 4).map((topic) => (
                <div key={topic.id} className="p-2.5 rounded-lg bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium truncate max-w-[170px]">{topic.name}</span>
                  <span className="text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                    Weak
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subject Progress Overview */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" /> Subject Masteries & Progress Breakdown
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => {
            const pct = Math.round((sub.completedChapters / sub.totalChapters) * 100);
            return (
              <div key={sub.id} className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-3 hover:border-white/20 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-bold text-violet-300">
                      {sub.code.split("-")[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{sub.name}</h4>
                      <p className="text-[11px] text-slate-400">{sub.completedChapters} of {sub.totalChapters} Chapters</p>
                    </div>
                  </div>
                  <span className="text-sm font-black text-emerald-400">{pct}%</span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/5">
                  <div
                    className="bg-gradient-to-r from-violet-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
