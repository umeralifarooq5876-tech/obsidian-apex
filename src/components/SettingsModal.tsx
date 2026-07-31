import React, { useState } from "react";
import { StudentProfile, Subject, ScheduleSlot, Flashcard, FocusSessionLog, StudyPlan } from "../types";
import { resetAllAppData, saveStudentProfile, saveSubjects } from "../utils/storage";
import {
  X,
  Settings,
  User,
  BookOpen,
  Timer,
  Database,
  Plus,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  Save,
  ShieldAlert,
  Smartphone,
  ExternalLink,
  Sparkles,
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  setProfile: (profile: StudentProfile) => void;
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  schedule: ScheduleSlot[];
  setSchedule: (s: ScheduleSlot[]) => void;
  flashcards: Flashcard[];
  setFlashcards: (f: Flashcard[]) => void;
  focusLogs: FocusSessionLog[];
  setFocusLogs: (l: FocusSessionLog[]) => void;
  setExamDate: (date: string) => void;
  setGradeLevel: (val: string) => void;
  setBoardName: (val: string) => void;
  onOpenWizard: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  setProfile,
  subjects,
  setSubjects,
  schedule,
  setSchedule,
  flashcards,
  setFlashcards,
  focusLogs,
  setFocusLogs,
  setExamDate,
  setGradeLevel,
  setBoardName,
  onOpenWizard,
}) => {
  const [activeTab, setActiveTab] = useState<"profile" | "subjects" | "pomodoro" | "data" | "apk">("apk");

  // Local Profile Form State
  const [studentName, setStudentName] = useState(profile.studentName || "Scholar");
  const [gradeLevel, setGradeState] = useState(profile.gradeLevel || "10th Grade (Matric Part 2)");
  const [boardName, setBoardState] = useState(profile.boardName || "Punjab Board (BISE)");
  const [examDate, setExamDateState] = useState(profile.examTargetDate || "2027-04-15");
  const [targetGoal, setTargetGoal] = useState(profile.targetMarksGoal || "95%+ (A+ Distinction)");
  const [dailyHours, setDailyHours] = useState(profile.dailyStudyHours || 4);
  const [preferredTime, setPreferredTime] = useState(profile.preferredStudyTime || "Evening / Night (7 PM - 12 AM)");

  // Local Pomodoro State
  const [pomodoroMins, setPomodoroMins] = useState(profile.pomodoroMinutes || 25);
  const [shortBreakMins, setShortBreakMins] = useState(profile.shortBreakMinutes || 5);

  // New Subject Form
  const [newSubName, setNewSubName] = useState("");
  const [newSubCode, setNewSubCode] = useState("");
  const [newSubChapters, setNewSubChapters] = useState(10);
  const [selectedSubForTopic, setSelectedSubForTopic] = useState(subjects[0]?.id || "");
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicConfidence, setNewTopicConfidence] = useState<"weak" | "moderate" | "mastered">("weak");

  const [savedSuccessMsg, setSavedSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleSaveProfile = () => {
    const updated: StudentProfile = {
      ...profile,
      studentName,
      gradeLevel,
      boardName,
      examTargetDate: examDate,
      targetMarksGoal: targetGoal,
      dailyStudyHours: dailyHours,
      preferredStudyTime: preferredTime,
      pomodoroMinutes: pomodoroMins,
      shortBreakMinutes: shortBreakMins,
    };
    setProfile(updated);
    saveStudentProfile(updated);
    setExamDate(examDate);
    setGradeLevel(gradeLevel);
    setBoardName(boardName);

    setSavedSuccessMsg("Settings updated successfully!");
    setTimeout(() => setSavedSuccessMsg(""), 3000);
  };

  const handleAddCustomSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubCode.trim()) return;

    const newSub: Subject = {
      id: `sub-${Date.now()}`,
      name: newSubName.trim(),
      code: newSubCode.trim().toUpperCase(),
      color: "from-blue-600 to-indigo-600",
      iconName: "BookOpen",
      totalChapters: newSubChapters,
      completedChapters: 0,
      topics: [
        {
          id: `top-${Date.now()}-1`,
          name: "Chapter 1 Fundamental Concepts",
          completed: false,
          confidence: "moderate",
          importance: "high",
        },
      ],
    };

    const updated = [...subjects, newSub];
    setSubjects(updated);
    saveSubjects(updated);
    setNewSubName("");
    setNewSubCode("");
    setNewSubChapters(10);
  };

  const handleAddCustomTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim() || !selectedSubForTopic) return;

    const updated = subjects.map((sub) => {
      if (sub.id === selectedSubForTopic) {
        return {
          ...sub,
          topics: [
            ...sub.topics,
            {
              id: `top-${Date.now()}`,
              name: newTopicName.trim(),
              completed: false,
              confidence: newTopicConfidence,
              importance: "medium" as const,
            },
          ],
        };
      }
      return sub;
    });

    setSubjects(updated);
    saveSubjects(updated);
    setNewTopicName("");
  };

  const handleDeleteSubject = (subId: string) => {
    if (subjects.length <= 1) return;
    const updated = subjects.filter((s) => s.id !== subId);
    setSubjects(updated);
    saveSubjects(updated);
  };

  const handleExportData = () => {
    const backupObj = {
      profile,
      subjects,
      schedule,
      flashcards,
      focusLogs,
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `obsidian_apex_profile_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.subjects) setSubjects(parsed.subjects);
        if (parsed.schedule) setSchedule(parsed.schedule);
        if (parsed.flashcards) setFlashcards(parsed.flashcards);
        if (parsed.focusLogs) setFocusLogs(parsed.focusLogs);
        alert("Study data imported successfully!");
      } catch (err) {
        alert("Invalid backup file format.");
      }
    };
    reader.readAsText(file);
  };

  const handleResetApp = () => {
    if (confirm("Are you sure you want to reset all app data to fresh defaults?")) {
      resetAllAppData();
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0B0F17] border border-violet-500/40 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-8 flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-900 border-b border-white/10 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-violet-400" />
            <h2 className="text-sm font-extrabold text-white tracking-wide uppercase">
              Obsidian Apex Preferences & Settings
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="bg-slate-950 px-6 py-2 border-b border-white/10 flex items-center gap-2 overflow-x-auto shrink-0">
          {[
            { id: "apk", label: "Android APK & App Store", icon: Smartphone },
            { id: "profile", label: "Academic Profile", icon: User },
            { id: "subjects", label: "Subject Manager", icon: BookOpen },
            { id: "pomodoro", label: "Focus & Audio", icon: Timer },
            { id: "data", label: "Data & Backup", icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                  isActive
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-slate-200">
          {savedSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{savedSuccessMsg}</span>
            </div>
          )}

          {/* TAB 0: Android APK & Mobile App Store Package */}
          {activeTab === "apk" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-gradient-to-r from-violet-900/30 via-slate-900 to-emerald-900/30 border border-violet-500/30 space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Android APK & Google Play Package Generator</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Obsidian Apex is fully configured as a Progressive Web App (PWA) with high-resolution 512x512 app icons, standalone launch mode, and offline caching. You can generate a native <strong className="text-emerald-400">Android APK (.apk)</strong> for phone installation or <strong className="text-violet-400">Android App Bundle (.aab)</strong> for judges & Play Store publishing.
                </p>

                <div className="pt-2 flex flex-wrap gap-3">
                  <a
                    href="https://www.pwabuilder.com/reportcard?site=https://ais-pre-ttyxf2hsihbzjmi2j2elfa-631968782736.asia-northeast1.run.app"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-900/40 flex items-center gap-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download APK on PWABuilder</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href="https://ais-pre-ttyxf2hsihbzjmi2j2elfa-631968782736.asia-northeast1.run.app"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-white/10 flex items-center gap-2 transition"
                  >
                    <ExternalLink className="w-4 h-4 text-violet-400" />
                    <span>Open Live Production App URL</span>
                  </a>
                </div>
              </div>

              {/* Step by Step Guide for Android & Judges */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" /> How to Get the APK / Install on Phone (2 Easy Options)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Option A */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
                    <span className="px-2 py-0.5 rounded bg-violet-600/30 text-violet-300 font-extrabold text-[10px]">
                      METHOD 1 (RECOMMENDED)
                    </span>
                    <h5 className="font-bold text-white text-xs">Generate Native Android APK via PWABuilder</h5>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-400 text-[11px]">
                      <li>Click the <strong>"Download APK on PWABuilder"</strong> button above.</li>
                      <li>Click <strong>"Package For Stores"</strong> → Select <strong>Android</strong>.</li>
                      <li>Click <strong>"Generate APK"</strong> or <strong>"Download Test Package"</strong>.</li>
                      <li>Transfer or open the downloaded <code>.apk</code> file on any Android device to install!</li>
                    </ol>
                  </div>

                  {/* Option B */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-600/30 text-emerald-300 font-extrabold text-[10px]">
                      METHOD 2 (INSTANT 1-TAP PHONE INSTALL)
                    </span>
                    <h5 className="font-bold text-white text-xs">Instant Chrome / Mobile Home Screen Install</h5>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-400 text-[11px]">
                      <li>Open the app on your mobile phone Chrome browser.</li>
                      <li>Tap Chrome's <strong>3 Dots Menu (⋮)</strong> at top right.</li>
                      <li>Tap <strong>"Install App"</strong> or <strong>"Add to Home screen"</strong>.</li>
                      <li>The app will launch full-screen like a native Android APK app!</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: Profile */}
          {activeTab === "profile" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">Student Information</h3>
                  <p className="text-xs text-slate-400">Configure grade, target board, and daily study goal.</p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onOpenWizard();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 text-xs font-bold transition"
                >
                  Rerun Setup Wizard
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Student Name</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-2.5 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Grade Level</label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeState(e.target.value)}
                    className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-2.5 text-xs font-bold outline-none"
                  >
                    <option value="9th Grade (Matric Part 1)">9th Grade (Matric Part 1)</option>
                    <option value="10th Grade (Matric Part 2)">10th Grade (Matric Part 2)</option>
                    <option value="Pre-1st Year / FSC">Pre-1st Year / FSC (11th Grade)</option>
                    <option value="General High School">General High School STEM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Education Board</label>
                  <select
                    value={boardName}
                    onChange={(e) => setBoardState(e.target.value)}
                    className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-2.5 text-xs font-bold outline-none"
                  >
                    <option value="Punjab Board (BISE)">Punjab Board (BISE Lahore / Rawalpindi / Multan)</option>
                    <option value="Federal Board (FBISE)">Federal Board (FBISE Islamabad)</option>
                    <option value="Sindh / KPK / Cambridge">Sindh Board / KPK BISE / Cambridge</option>
                    <option value="General High School">General High School Board</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Board Exam Date</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDateState(e.target.value)}
                    className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-2.5 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Marks Goal</label>
                  <input
                    type="text"
                    value={targetGoal}
                    onChange={(e) => setTargetGoal(e.target.value)}
                    className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-2.5 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Study Hours</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={dailyHours}
                    onChange={(e) => setDailyHours(parseInt(e.target.value, 10) || 4)}
                    className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-2.5 text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md shadow-violet-900/30 flex items-center gap-2 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Custom Subjects & Topics Manager */}
          {activeTab === "subjects" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Add New Subject */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-400" /> Add Custom Subject to Syllabus
                </h4>

                <form onSubmit={handleAddCustomSubject} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Subject Name (e.g. Economics)"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    className="bg-slate-900 text-white border border-white/10 rounded-lg p-2 text-xs outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Code (e.g. ECO-101)"
                    value={newSubCode}
                    onChange={(e) => setNewSubCode(e.target.value)}
                    className="bg-slate-900 text-white border border-white/10 rounded-lg p-2 text-xs outline-none"
                  />
                  <input
                    type="number"
                    min={1}
                    max={50}
                    placeholder="Chapters"
                    value={newSubChapters}
                    onChange={(e) => setNewSubChapters(parseInt(e.target.value, 10) || 10)}
                    className="bg-slate-900 text-white border border-white/10 rounded-lg p-2 text-xs outline-none"
                  />
                  <button
                    type="submit"
                    className="py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition"
                  >
                    Add Subject
                  </button>
                </form>
              </div>

              {/* Add Custom Topic */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-violet-400" /> Add Custom Topic to Subject
                </h4>

                <form onSubmit={handleAddCustomTopic} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <select
                    value={selectedSubForTopic}
                    onChange={(e) => setSelectedSubForTopic(e.target.value)}
                    className="bg-slate-900 text-white border border-white/10 rounded-lg p-2 text-xs outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Topic Name..."
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    className="bg-slate-900 text-white border border-white/10 rounded-lg p-2 text-xs outline-none sm:col-span-2"
                  />

                  <button
                    type="submit"
                    className="py-2 rounded-lg bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 transition"
                  >
                    Add Topic
                  </button>
                </form>
              </div>

              {/* Existing Subjects List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Subjects & Topics</h4>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {subjects.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white">{sub.name}</span>
                        <span className="text-slate-400 ml-2 font-mono text-[11px]">({sub.code})</span>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {sub.totalChapters} Chapters • {sub.topics.length} Key Topics
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteSubject(sub.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Delete subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Pomodoro & Audio */}
          {activeTab === "pomodoro" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-sm font-bold text-white">Focus Room & Audio Defaults</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Pomodoro Work Sprint (Minutes)</label>
                  <select
                    value={pomodoroMins}
                    onChange={(e) => setPomodoroMins(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-2.5 text-xs font-bold outline-none"
                  >
                    <option value={15}>15 Minutes (Short)</option>
                    <option value={25}>25 Minutes (Standard Pomodoro)</option>
                    <option value={35}>35 Minutes (Extended)</option>
                    <option value={50}>50 Minutes (Deep Focus Sprint)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Short Rest Break (Minutes)</label>
                  <select
                    value={shortBreakMins}
                    onChange={(e) => setShortBreakMins(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 text-white border border-white/10 rounded-xl p-2.5 text-xs font-bold outline-none"
                  >
                    <option value={5}>5 Minutes (Standard)</option>
                    <option value={10}>10 Minutes (Longer Rest)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md flex items-center gap-2 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Pomodoro Preferences</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Data & Backup */}
          {activeTab === "data" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-400" /> Export Profile & Study Backup JSON
                </h4>
                <p className="text-xs text-slate-400">
                  Download a complete backup file of your subjects, timetable, flashcards, and focus logs.
                </p>
                <button
                  onClick={handleExportData}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Backup JSON</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-violet-400" /> Restore Profile from Backup JSON
                </h4>
                <p className="text-xs text-slate-400">Upload a previously saved `.json` backup file.</p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-violet-600 file:text-white hover:file:bg-violet-500"
                />
              </div>

              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-3">
                <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" /> Danger Zone: Reset App to Starter Defaults
                </h4>
                <p className="text-xs text-rose-200/80">
                  Clears local storage cache and restores original starter matric datasets.
                </p>
                <button
                  onClick={handleResetApp}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset All App Data</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
