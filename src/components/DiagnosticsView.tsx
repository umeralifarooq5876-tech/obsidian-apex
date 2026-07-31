import React, { useState } from "react";
import { Subject, DiagnosticReport } from "../types";
import {
  BarChart3,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Award,
  Calendar,
  RefreshCw,
  CheckCircle2,
  Layers,
  ArrowRight,
} from "lucide-react";

interface DiagnosticsViewProps {
  subjects: Subject[];
  examDate: string;
  activeReport: DiagnosticReport | null;
  setActiveReport: (report: DiagnosticReport) => void;
}

export const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({
  subjects,
  examDate,
  activeReport,
  setActiveReport,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const daysLeft = Math.max(
    0,
    Math.floor((new Date(examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  );

  const handleRunAIDiagnostic = async () => {
    setIsAnalyzing(true);
    setErrorMsg("");

    try {
      const subjectPerformances = subjects.map((s) => ({
        subject: s.name,
        completedChapters: s.completedChapters,
        totalChapters: s.totalChapters,
        weakTopicCount: s.topics.filter((t) => t.confidence === "weak").length,
        masteredTopicCount: s.topics.filter((t) => t.confidence === "mastered").length,
      }));

      const res = await fetch("/api/diagnostic-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectPerformances,
          examDaysLeft: daysLeft,
        }),
      });

      const data = await res.json();
      if (data.success && data.report) {
        setActiveReport(data.report);
      } else {
        setErrorMsg(data.error || "Failed to generate diagnostic report.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Error communicating with AI Diagnostic service.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2 tracking-tight">
            <BarChart3 className="w-6 h-6 text-amber-400" /> Subject Mastery & AI Weak Area Diagnostic
          </h1>
          <p className="text-slate-400 text-xs">
            Analyze your syllabus coverage, predict board exam readiness, and generate an emergency revision strategy.
          </p>
        </div>

        <button
          onClick={handleRunAIDiagnostic}
          disabled={isAnalyzing}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-900/30 flex items-center gap-2 transition disabled:opacity-50"
        >
          {isAnalyzing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>Run AI Diagnostic Report</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Subject Mastery Visual Matrix */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-violet-400" /> Subject Completion & Confidence Matrix
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((sub) => {
            const total = sub.topics.length || 1;
            const weakCount = sub.topics.filter((t) => t.confidence === "weak").length;
            const modCount = sub.topics.filter((t) => t.confidence === "moderate").length;
            const masterCount = sub.topics.filter((t) => t.confidence === "mastered").length;

            return (
              <div key={sub.id} className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{sub.name}</span>
                  <span className="text-xs text-slate-400 font-mono">
                    {sub.completedChapters}/{sub.totalChapters} Ch.
                  </span>
                </div>

                {/* Multi-segment confidence bar */}
                <div className="w-full bg-slate-800 rounded-full h-3 flex overflow-hidden border border-white/5">
                  <div
                    style={{ width: `${(masterCount / total) * 100}%` }}
                    className="bg-emerald-500 h-full"
                    title={`Mastered: ${masterCount}`}
                  />
                  <div
                    style={{ width: `${(modCount / total) * 100}%` }}
                    className="bg-amber-500 h-full"
                    title={`Moderate: ${modCount}`}
                  />
                  <div
                    style={{ width: `${(weakCount / total) * 100}%` }}
                    className="bg-rose-500 h-full"
                    title={`Weak: ${weakCount}`}
                  />
                </div>

                <div className="flex justify-between text-[11px] font-semibold text-slate-400">
                  <span className="text-emerald-400">Mastered ({masterCount})</span>
                  <span className="text-amber-400">Moderate ({modCount})</span>
                  <span className="text-rose-400">Weak ({weakCount})</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Diagnostic Report */}
      {activeReport ? (
        <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/30 rounded-2xl p-6 lg:p-8 space-y-6 shadow-2xl animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                AI Diagnostic Summary
              </span>
              <h2 className="text-xl font-extrabold text-white mt-0.5">Board Exam Readiness Assessment</h2>
            </div>

            <div className="flex items-center gap-4 bg-slate-950/80 p-3 rounded-xl border border-white/10">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Predicted Grade</span>
                <span className="text-base font-black text-amber-400">{activeReport.gradePrediction}</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Readiness Score</span>
                <span className="text-base font-black text-emerald-400">{activeReport.readinessScore}%</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 text-xs text-slate-300">
            <strong className="text-amber-300">Status Overview: </strong>
            {activeReport.overallStatus}
          </div>

          {/* Critical Weak Areas */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" /> High Risk Weak Topics & Interventions
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeReport.criticalWeakAreas.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/90 border border-rose-500/20 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{item.subject}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold uppercase">
                      {item.riskLevel} Risk
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-200">{item.topic}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">{item.recommendedAction}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 7-Day Emergency Action Blueprint */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" /> 7-Day High-Yield Revision Blueprint
            </h3>

            <div className="space-y-2">
              {activeReport.actionPlan7Days.map((day) => (
                <div
                  key={day.dayNumber}
                  className="p-3 rounded-xl bg-slate-950/80 border border-white/10 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center shrink-0">
                      D{day.dayNumber}
                    </span>
                    <span className="text-slate-200 font-semibold">{day.task}</span>
                  </div>
                  <span className="text-emerald-400 font-mono font-bold shrink-0">
                    {day.targetHours} Hours
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Motivational Directive */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-violet-500/30 text-xs text-violet-200 flex items-center gap-3">
            <Award className="w-6 h-6 text-violet-400 shrink-0" />
            <div>
              <strong className="text-white block">Apex Mentor Motto:</strong>
              {activeReport.motivationalDirective}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
