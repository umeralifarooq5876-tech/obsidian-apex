import React, { useState } from "react";
import { Subject, ScheduleSlot, StudyPlan, StudentProfile } from "../types";
import {
  Sparkles,
  X,
  User,
  GraduationCap,
  Calendar,
  Clock,
  Target,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Zap,
  Flame,
  Award,
  Layers,
} from "lucide-react";

interface PlanSetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  setProfile: (profile: StudentProfile) => void;
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  setSchedule: (schedule: ScheduleSlot[]) => void;
  setActivePlan: (plan: StudyPlan) => void;
  setExamDate: (date: string) => void;
  setGradeLevel: (val: string) => void;
  setBoardName: (val: string) => void;
}

export const PlanSetupWizardModal: React.FC<PlanSetupWizardModalProps> = ({
  isOpen,
  onClose,
  profile,
  setProfile,
  subjects,
  setSubjects,
  setSchedule,
  setActivePlan,
  setExamDate,
  setGradeLevel,
  setBoardName,
}) => {
  const [step, setStep] = useState(1);

  // Form State initialized from current profile
  const [studentName, setStudentName] = useState(profile.studentName || "Scholar");
  const [gradeLevel, setGradeState] = useState(profile.gradeLevel || "10th Grade (Matric Part 2)");
  const [boardName, setBoardState] = useState(profile.boardName || "Punjab Board (BISE)");
  const [examDate, setExamDateState] = useState(profile.examTargetDate || "2027-04-15");
  const [targetGoal, setTargetGoal] = useState(profile.targetMarksGoal || "95%+ (A+ Distinction)");
  const [dailyHours, setDailyHours] = useState(profile.dailyStudyHours || 4);
  const [preferredTime, setPreferredTime] = useState(profile.preferredStudyTime || "Evening / Night (7 PM - 12 AM)");
  const [studyPace, setStudyPace] = useState(profile.studyPace || "Balanced Pomodoro (25m Focus / 5m Rest)");
  const [weakTopicsInput, setWeakTopicsInput] = useState(
    "Mathematics Quadratic equations & derivations, Physics numericals, Organic Chemistry reactions"
  );

  const [selectedSubjectNames, setSelectedSubjectNames] = useState<string[]>(
    subjects.map((s) => s.name)
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const toggleSubject = (name: string) => {
    if (selectedSubjectNames.includes(name)) {
      if (selectedSubjectNames.length === 1) return; // Keep at least one
      setSelectedSubjectNames(selectedSubjectNames.filter((s) => s !== name));
    } else {
      setSelectedSubjectNames([...selectedSubjectNames, name]);
    }
  };

  const handleGenerateCustomPlan = async () => {
    setIsGenerating(true);
    setErrorMsg("");

    setGenerationPhase("Analyzing syllabus weights & board exam requirements...");

    try {
      setTimeout(() => setGenerationPhase("Allocating daily time-slots around your preferred hours..."), 1200);
      setTimeout(() => setGenerationPhase("Synthesizing step-by-step topic targets with Gemini 3.6 Flash..."), 2400);

      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          gradeLevel,
          board: boardName,
          examDate,
          targetGoal,
          dailyHours,
          preferredTime,
          subjects: selectedSubjectNames,
          weakTopics: weakTopicsInput,
          learningStyle: studyPace,
        }),
      });

      const data = await res.json();
      if (data.success && data.plan) {
        // Save new active plan
        setActivePlan(data.plan);

        // Convert generated schedule slots into app schedule state
        if (data.plan.scheduleSlots && data.plan.scheduleSlots.length > 0) {
          const newSlots: ScheduleSlot[] = data.plan.scheduleSlots.map(
            (slot: any, idx: number) => ({
              id: `wiz-slot-${Date.now()}-${idx}`,
              timeSlot: slot.timeSlot,
              subject: slot.subject,
              topic: slot.topic,
              activityType: slot.activityType || "Concept Mastery",
              durationMinutes: slot.durationMinutes || 45,
              completed: false,
              day: "Daily",
            })
          );
          setSchedule(newSlots);
        }

        // Update profile
        const updatedProfile: StudentProfile = {
          studentName,
          gradeLevel,
          boardName,
          examTargetDate: examDate,
          targetMarksGoal: targetGoal,
          dailyStudyHours: dailyHours,
          preferredStudyTime: preferredTime,
          studyPace,
          pomodoroMinutes: studyPace.includes("50m") ? 50 : 25,
          shortBreakMinutes: studyPace.includes("50m") ? 10 : 5,
          hasCompletedWizard: true,
        };

        setProfile(updatedProfile);
        setGradeLevel(gradeLevel);
        setBoardName(boardName);
        setExamDate(examDate);

        // Filter subjects state
        setSubjects((prev) => prev.filter((s) => selectedSubjectNames.includes(s.name)));

        setIsGenerating(false);
        onClose();
      } else {
        setErrorMsg(data.error || "Could not synthesize plan.");
        setIsGenerating(false);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Network error connecting to AI Study Plan Generator.");
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0B0F17] border border-violet-500/40 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8 flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="bg-slate-900 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-emerald-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white tracking-wide uppercase">
                AI Student Setup & Plan Creator
              </h2>
              <p className="text-[11px] text-slate-400">Step {step} of 4 — Personalizing your study routine</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="bg-slate-950 px-6 py-2.5 border-b border-white/5 flex items-center justify-between text-xs">
          {[
            { num: 1, label: "Profile" },
            { num: 2, label: "Goals" },
            { num: 3, label: "Routine" },
            { num: 4, label: "Subjects & AI" },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-2 ${
                step === s.num
                  ? "text-violet-400 font-bold"
                  : step > s.num
                  ? "text-emerald-400 font-medium"
                  : "text-slate-500"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                  step === s.num
                    ? "bg-violet-600 text-white"
                    : step > s.num
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 text-slate-200 min-h-[320px] flex flex-col justify-between">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: Profile & Identity */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-violet-400" /> Student Name / Preferred Handle
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Aisha / Umer"
                  className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-3 text-xs font-bold outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-violet-400" /> Academic Grade Level
                </label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeState(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-3 text-xs font-bold outline-none focus:border-violet-500"
                >
                  <option value="9th Grade (Matric Part 1)">9th Grade (Matric Part 1)</option>
                  <option value="10th Grade (Matric Part 2)">10th Grade (Matric Part 2)</option>
                  <option value="Pre-1st Year / FSC">Pre-1st Year / FSC (11th Grade)</option>
                  <option value="General High School">General High School STEM</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" /> Education Examination Board
                </label>
                <select
                  value={boardName}
                  onChange={(e) => setBoardState(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-3 text-xs font-bold outline-none focus:border-violet-500"
                >
                  <option value="Punjab Board (BISE)">Punjab Board (BISE Lahore / Rawalpindi / Multan)</option>
                  <option value="Federal Board (FBISE)">Federal Board (FBISE Islamabad)</option>
                  <option value="Sindh / KPK / Cambridge">Sindh Board / KPK BISE / Cambridge</option>
                  <option value="General High School">General High School Board</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: Target Goals & Timeline */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-violet-400" /> Target Board Exam Date
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDateState(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-3 text-xs font-bold outline-none focus:border-violet-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Countdown algorithm will build your 3-phase exam preparation schedule around this date.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-amber-400" /> Desired Percentage & Marks Target Goal
                </label>
                <select
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-3 text-xs font-bold outline-none focus:border-violet-500"
                >
                  <option value="95%+ (A+ Top Position Goal)">95%+ (A+ Board Position / Top Distinction)</option>
                  <option value="90%+ (A+ High Marks)">90%+ (A+ Grade High Marks Target)</option>
                  <option value="85%+ (Solid A Grade)">85%+ (Solid A Grade & Distinction)</option>
                  <option value="75%+ (Confident Pass)">75%+ (Confident Exam Preparation Pass)</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: Daily Routine & Pace */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-violet-400" /> Daily Available Study Hours
                  </span>
                  <span className="text-violet-400 font-extrabold">{dailyHours} Hours / Day</span>
                </label>
                <input
                  type="range"
                  min={2}
                  max={10}
                  step={1}
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseInt(e.target.value, 10))}
                  className="w-full accent-violet-500 bg-slate-950 rounded-lg cursor-pointer h-2"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>2 Hours (Light)</span>
                  <span>4 Hours (Standard)</span>
                  <span>6 Hours (Intensive)</span>
                  <span>10 Hours (Full Sprint)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" /> Preferred Study Time Slot of Day
                </label>
                <select
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-3 text-xs font-bold outline-none focus:border-violet-500"
                >
                  <option value="Early Morning (6 AM - 12 PM)">Early Morning (6 AM - 12 PM)</option>
                  <option value="Afternoon (1 PM - 6 PM)">Afternoon (1 PM - 6 PM)</option>
                  <option value="Evening / Night (7 PM - 12 AM)">Evening / Night Owl (7 PM - 12 AM)</option>
                  <option value="Flexible Split Shift">Flexible Split Shifts throughout day</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" /> Focus Technique & Pace
                </label>
                <select
                  value={studyPace}
                  onChange={(e) => setStudyPace(e.target.value)}
                  className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-3 text-xs font-bold outline-none focus:border-violet-500"
                >
                  <option value="Balanced Pomodoro (25m Focus / 5m Rest)">Balanced Pomodoro (25m Focus / 5m Rest)</option>
                  <option value="Deep Focus Sprints (50m Focus / 10m Rest)">Deep Focus Sprints (50m Focus / 10m Rest)</option>
                  <option value="High-Yield Board Exam Cram Mode">High-Yield Board Exam Revision Sprint Mode</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 4: Subjects & AI Confirmation */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-400" /> Select Subjects to Include in Schedule
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {subjects.map((sub) => {
                    const isSelected = selectedSubjectNames.includes(sub.name);
                    return (
                      <button
                        key={sub.id}
                        onClick={() => toggleSubject(sub.name)}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left flex items-center justify-between transition ${
                          isSelected
                            ? "bg-violet-600/20 border-violet-500 text-white"
                            : "bg-slate-950 border-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        <span>{sub.name}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Flag Priority / Weak Topics for AI Extra Focus Allocation
                </label>
                <textarea
                  value={weakTopicsInput}
                  onChange={(e) => setWeakTopicsInput(e.target.value)}
                  rows={2}
                  placeholder="e.g. Physics Ohm's law numericals, Chemistry stoichiometry, Math calculus..."
                  className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-3 text-xs outline-none focus:border-violet-500 resize-none"
                />
              </div>

              {/* Generating Animation overlay */}
              {isGenerating && (
                <div className="p-4 rounded-xl bg-violet-600/10 border border-violet-500/30 text-center space-y-2 animate-pulse">
                  <RefreshCw className="w-6 h-6 text-violet-400 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-violet-300">{generationPhase}</p>
                </div>
              )}
            </div>
          )}

          {/* Bottom Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4">
            {step > 1 ? (
              <button
                disabled={isGenerating}
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-violet-900/30 transition"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                disabled={isGenerating}
                onClick={handleGenerateCustomPlan}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-900/40 transition disabled:opacity-50"
              >
                {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Build My AI Plan</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
