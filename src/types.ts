export type GradeLevel = "9th Grade (Matric Part 1)" | "10th Grade (Matric Part 2)" | "Pre-1st Year / FSC" | "General High School";

export type BoardType = "Punjab Board (BISE)" | "Federal Board (FBISE)" | "Sindh / KPK / Cambridge" | "General High School";

export interface SubjectTopic {
  id: string;
  name: string;
  completed: boolean;
  confidence: "weak" | "moderate" | "mastered";
  importance: "low" | "medium" | "high";
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string; // Tailwind color class or hex
  iconName: string;
  totalChapters: number;
  completedChapters: number;
  topics: SubjectTopic[];
}

export interface ScheduleSlot {
  id: string;
  timeSlot: string;
  subject: string;
  topic: string;
  activityType: "Concept Mastery" | "Numerical Practice" | "Revision" | "Quiz Practice" | "Past Paper Practice";
  durationMinutes: number;
  completed: boolean;
  day: string; // "Monday", "Tuesday", etc. or "Daily"
}

export interface StudyPlan {
  planTitle: string;
  overview: string;
  weeklyStrategy: string;
  dailyTargetHours: number;
  subjectBreakdown: {
    subject: string;
    priority: string;
    allocatedWeeklyHours: number;
    keyFocusTopics: string[];
    examTip: string;
  }[];
  scheduleSlots: {
    timeSlot: string;
    subject: string;
    topic: string;
    activityType: string;
    durationMinutes: number;
  }[];
  examCountdownStrategy: {
    phase: string;
    timeframe: string;
    goal: string;
  }[];
}

export interface Flashcard {
  id: string;
  subject: string;
  front: string;
  back: string;
  category: string;
  userRating?: "easy" | "medium" | "hard";
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  examTip: string;
}

export interface Quiz {
  quizTitle: string;
  subject: string;
  topic: string;
  questions: QuizQuestion[];
}

export interface TutorResponse {
  directAnswer: string;
  keyConcepts: string[];
  stepByStepSolution: {
    stepNumber: number;
    title: string;
    explanation: string;
  }[];
  importantFormulasOrDefinitions: string[];
  boardExamTips: string;
  commonPitfallsToAvoid: string[];
  practiceCheckQuestion: string;
}

export interface DiagnosticReport {
  readinessScore: number;
  gradePrediction: string;
  overallStatus: string;
  criticalWeakAreas: {
    subject: string;
    topic: string;
    riskLevel: string;
    recommendedAction: string;
  }[];
  actionPlan7Days: {
    dayNumber: number;
    task: string;
    targetHours: number;
  }[];
  motivationalDirective: string;
}

export interface FocusSessionLog {
  id: string;
  date: string; // ISO string
  durationMinutes: number;
  subject: string;
  notes?: string;
}

export interface StudentProfile {
  studentName: string;
  gradeLevel: string;
  boardName: string;
  examTargetDate: string;
  targetMarksGoal: string;
  dailyStudyHours: number;
  preferredStudyTime: string;
  studyPace: string;
  pomodoroMinutes: number;
  shortBreakMinutes: number;
  hasCompletedWizard: boolean;
}

export type ActiveTab = "dashboard" | "schedule" | "focus" | "tutor" | "quiz" | "diagnostics" | "dossier";
