import React, { useState, useEffect } from "react";
import { ActiveTab, Subject, ScheduleSlot, Flashcard, FocusSessionLog, StudyPlan, DiagnosticReport, StudentProfile } from "./types";
import {
  loadSubjects,
  saveSubjects,
  loadSchedule,
  saveSchedule,
  loadFlashcards,
  saveFlashcards,
  loadFocusLogs,
  saveFocusLogs,
  loadActiveStudyPlan,
  saveActiveStudyPlan,
  loadDiagnosticReport,
  saveDiagnosticReport,
  getExamTargetDate,
  setExamTargetDate,
  getGradeLevel,
  setGradeLevel,
  getBoardName,
  setBoardName,
  getStreakCount,
  setStreakCount,
  loadStudentProfile,
  saveStudentProfile,
} from "./utils/storage";

import { Navbar } from "./components/Navbar";
import { DashboardView } from "./components/DashboardView";
import { ScheduleView } from "./components/ScheduleView";
import { FocusRoomView } from "./components/FocusRoomView";
import { TutorView } from "./components/TutorView";
import { QuizVaultView } from "./components/QuizVaultView";
import { DiagnosticsView } from "./components/DiagnosticsView";
import { CompetitionDossierModal } from "./components/CompetitionDossierModal";
import { PlanSetupWizardModal } from "./components/PlanSetupWizardModal";
import { SettingsModal } from "./components/SettingsModal";
import {
  LayoutDashboard,
  CalendarDays,
  Timer,
  Bot,
  BrainCircuit,
  BarChart3,
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");

  // Persistent App State
  const [profile, setProfileState] = useState<StudentProfile>(loadStudentProfile);
  const [subjects, setSubjects] = useState<Subject[]>(loadSubjects);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>(loadSchedule);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(loadFlashcards);
  const [focusLogs, setFocusLogs] = useState<FocusSessionLog[]>(loadFocusLogs);
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(loadActiveStudyPlan);
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticReport | null>(loadDiagnosticReport);

  const [examDate, setExamDateState] = useState<string>(getExamTargetDate);
  const [gradeLevel, setGradeLevelState] = useState<string>(getGradeLevel);
  const [boardName, setBoardNameState] = useState<string>(getBoardName);
  const [streak, setStreakState] = useState<number>(getStreakCount);

  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    saveStudentProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveSubjects(subjects);
  }, [subjects]);

  useEffect(() => {
    saveSchedule(schedule);
  }, [schedule]);

  useEffect(() => {
    saveFlashcards(flashcards);
  }, [flashcards]);

  useEffect(() => {
    saveFocusLogs(focusLogs);
  }, [focusLogs]);

  useEffect(() => {
    if (activePlan) saveActiveStudyPlan(activePlan);
  }, [activePlan]);

  useEffect(() => {
    if (diagnosticReport) saveDiagnosticReport(diagnosticReport);
  }, [diagnosticReport]);

  const setProfile = (newProf: StudentProfile) => {
    setProfileState(newProf);
    saveStudentProfile(newProf);
  };

  const setExamDate = (date: string) => {
    setExamDateState(date);
    setExamTargetDate(date);
    setProfileState((prev) => ({ ...prev, examTargetDate: date }));
  };

  const setGradeLevel = (val: string) => {
    setGradeLevelState(val);
    setGradeLevel(val);
    setProfileState((prev) => ({ ...prev, gradeLevel: val }));
  };

  const setBoardName = (val: string) => {
    setBoardNameState(val);
    setBoardName(val);
    setProfileState((prev) => ({ ...prev, boardName: val }));
  };

  const setStreak = (val: number) => {
    setStreakState(val);
    setStreakCount(val);
  };

  // Toggle schedule item completed
  const handleToggleScheduleItem = (id: string) => {
    setSchedule((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 font-sans selection:bg-violet-500 selection:text-white flex flex-col">
      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        examDate={examDate}
        streak={streak}
        onOpenDossier={() => setIsDossierOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenWizard={() => setIsWizardOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {activeTab === "dashboard" && (
          <DashboardView
            subjects={subjects}
            schedule={schedule}
            onToggleScheduleItem={handleToggleScheduleItem}
            setActiveTab={setActiveTab}
            examDate={examDate}
            setExamDate={setExamDate}
            gradeLevel={gradeLevel}
            boardName={boardName}
            streak={streak}
          />
        )}

        {activeTab === "schedule" && (
          <ScheduleView
            subjects={subjects}
            setSubjects={setSubjects}
            schedule={schedule}
            setSchedule={setSchedule}
            activePlan={activePlan}
            setActivePlan={setActivePlan}
            gradeLevel={gradeLevel}
            setGradeLevel={setGradeLevel}
            boardName={boardName}
            setBoardName={setBoardName}
            examDate={examDate}
          />
        )}

        {activeTab === "focus" && (
          <FocusRoomView
            subjects={subjects}
            focusLogs={focusLogs}
            setFocusLogs={setFocusLogs}
            streak={streak}
            setStreak={setStreak}
          />
        )}

        {activeTab === "tutor" && (
          <TutorView subjects={subjects} gradeLevel={gradeLevel} />
        )}

        {activeTab === "quiz" && (
          <QuizVaultView
            subjects={subjects}
            flashcards={flashcards}
            setFlashcards={setFlashcards}
          />
        )}

        {activeTab === "diagnostics" && (
          <DiagnosticsView
            subjects={subjects}
            examDate={examDate}
            activeReport={diagnosticReport}
            setActiveReport={setDiagnosticReport}
          />
        )}
      </main>

      {/* Competition Dossier PDF Modal */}
      <CompetitionDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        gradeLevel={gradeLevel}
        boardName={boardName}
      />

      {/* Plan Setup Wizard Modal */}
      <PlanSetupWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        profile={profile}
        setProfile={setProfile}
        subjects={subjects}
        setSubjects={setSubjects}
        setSchedule={setSchedule}
        setActivePlan={setActivePlan}
        setExamDate={setExamDate}
        setGradeLevel={setGradeLevel}
        setBoardName={setBoardName}
      />

      {/* Application & Profile Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        setProfile={setProfile}
        subjects={subjects}
        setSubjects={setSubjects}
        schedule={schedule}
        setSchedule={setSchedule}
        flashcards={flashcards}
        setFlashcards={setFlashcards}
        focusLogs={focusLogs}
        setFocusLogs={setFocusLogs}
        setExamDate={setExamDate}
        setGradeLevel={setGradeLevel}
        setBoardName={setBoardName}
        onOpenWizard={() => setIsWizardOpen(true)}
      />

      {/* Mobile Sticky Bottom Nav Bar */}
      <nav className="md:hidden sticky bottom-0 z-40 bg-[#0B0F17]/95 border-t border-white/10 px-2 py-2 grid grid-cols-6 gap-1 backdrop-blur-md">
        {[
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "schedule", label: "Schedule", icon: CalendarDays },
          { id: "focus", label: "Focus", icon: Timer },
          { id: "tutor", label: "AI Tutor", icon: Bot },
          { id: "quiz", label: "Practice", icon: BrainCircuit },
          { id: "diagnostics", label: "Stats", icon: BarChart3 },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className={`flex flex-col items-center justify-center py-1 rounded-lg text-[10px] font-semibold transition ${
                isActive
                  ? "text-violet-400 font-bold bg-violet-600/10"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 text-center text-xs text-slate-500 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-8">
          <p>© 2026 Obsidian Apex — Built for High School & Matric Board Preparation.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400 font-mono">Gemini 3.6 Flash Server Engine Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
