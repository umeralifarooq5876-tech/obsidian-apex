import { Subject, ScheduleSlot, Flashcard, FocusSessionLog, StudyPlan, DiagnosticReport, StudentProfile } from "../types";
import { DEFAULT_SUBJECTS, DEFAULT_SCHEDULE_SLOTS, DEFAULT_FLASHCARDS } from "../data/defaultData";

const KEYS = {
  SUBJECTS: "obsidian_apex_subjects_v1",
  SCHEDULE: "obsidian_apex_schedule_v1",
  FLASHCARDS: "obsidian_apex_flashcards_v1",
  FOCUS_LOGS: "obsidian_apex_focus_logs_v1",
  STUDY_PLAN: "obsidian_apex_study_plan_v1",
  DIAGNOSTIC: "obsidian_apex_diagnostic_v1",
  EXAM_DATE: "obsidian_apex_exam_date_v1",
  GRADE_LEVEL: "obsidian_apex_grade_level_v1",
  BOARD_NAME: "obsidian_apex_board_name_v1",
  STREAK: "obsidian_apex_streak_v1",
  STUDENT_PROFILE: "obsidian_apex_student_profile_v1",
};

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  studentName: "Scholar",
  gradeLevel: "10th Grade (Matric Part 2)",
  boardName: "Punjab Board (BISE)",
  examTargetDate: "2027-04-15",
  targetMarksGoal: "95%+ (A+ Distinction)",
  dailyStudyHours: 4,
  preferredStudyTime: "Evening / Night (7 PM - 12 AM)",
  studyPace: "Balanced Pomodoro (25m Focus / 5m Rest)",
  pomodoroMinutes: 25,
  shortBreakMinutes: 5,
  hasCompletedWizard: false,
};

export function loadStudentProfile(): StudentProfile {
  try {
    const raw = localStorage.getItem(KEYS.STUDENT_PROFILE);
    if (raw) return { ...DEFAULT_STUDENT_PROFILE, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_STUDENT_PROFILE;
}

export function saveStudentProfile(profile: StudentProfile): void {
  try {
    localStorage.setItem(KEYS.STUDENT_PROFILE, JSON.stringify(profile));
  } catch {}
}

export function loadSubjects(): Subject[] {
  try {
    const raw = localStorage.getItem(KEYS.SUBJECTS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_SUBJECTS;
}

export function saveSubjects(subjects: Subject[]): void {
  try {
    localStorage.setItem(KEYS.SUBJECTS, JSON.stringify(subjects));
  } catch {}
}

export function loadSchedule(): ScheduleSlot[] {
  try {
    const raw = localStorage.getItem(KEYS.SCHEDULE);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_SCHEDULE_SLOTS;
}

export function saveSchedule(schedule: ScheduleSlot[]): void {
  try {
    localStorage.setItem(KEYS.SCHEDULE, JSON.stringify(schedule));
  } catch {}
}

export function loadFlashcards(): Flashcard[] {
  try {
    const raw = localStorage.getItem(KEYS.FLASHCARDS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_FLASHCARDS;
}

export function saveFlashcards(cards: Flashcard[]): void {
  try {
    localStorage.setItem(KEYS.FLASHCARDS, JSON.stringify(cards));
  } catch {}
}

export function loadFocusLogs(): FocusSessionLog[] {
  try {
    const raw = localStorage.getItem(KEYS.FOCUS_LOGS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveFocusLogs(logs: FocusSessionLog[]): void {
  try {
    localStorage.setItem(KEYS.FOCUS_LOGS, JSON.stringify(logs));
  } catch {}
}

export function loadActiveStudyPlan(): StudyPlan | null {
  try {
    const raw = localStorage.getItem(KEYS.STUDY_PLAN);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveActiveStudyPlan(plan: StudyPlan): void {
  try {
    localStorage.setItem(KEYS.STUDY_PLAN, JSON.stringify(plan));
  } catch {}
}

export function loadDiagnosticReport(): DiagnosticReport | null {
  try {
    const raw = localStorage.getItem(KEYS.DIAGNOSTIC);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveDiagnosticReport(report: DiagnosticReport): void {
  try {
    localStorage.setItem(KEYS.DIAGNOSTIC, JSON.stringify(report));
  } catch {}
}

export function getExamTargetDate(): string {
  try {
    return localStorage.getItem(KEYS.EXAM_DATE) || "2027-04-15";
  } catch {
    return "2027-04-15";
  }
}

export function setExamTargetDate(dateStr: string): void {
  try {
    localStorage.setItem(KEYS.EXAM_DATE, dateStr);
  } catch {}
}

export function getGradeLevel(): string {
  try {
    return localStorage.getItem(KEYS.GRADE_LEVEL) || "10th Grade (Matric Part 2)";
  } catch {
    return "10th Grade (Matric Part 2)";
  }
}

export function setGradeLevel(grade: string): void {
  try {
    localStorage.setItem(KEYS.GRADE_LEVEL, grade);
  } catch {}
}

export function getBoardName(): string {
  try {
    return localStorage.getItem(KEYS.BOARD_NAME) || "Punjab Board (BISE)";
  } catch {
    return "Punjab Board (BISE)";
  }
}

export function setBoardName(board: string): void {
  try {
    localStorage.setItem(KEYS.BOARD_NAME, board);
  } catch {}
}

export function getStreakCount(): number {
  try {
    const val = localStorage.getItem(KEYS.STREAK);
    return val ? parseInt(val, 10) : 5;
  } catch {
    return 5;
  }
}

export function setStreakCount(count: number): void {
  try {
    localStorage.setItem(KEYS.STREAK, count.toString());
  } catch {}
}

export function resetAllAppData(): void {
  try {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  } catch {}
}
