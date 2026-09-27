export type Subject = "Math" | "Reading" | "Writing";
export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Choice {
  id: string; // "A" | "B" | "C" | "D"
  text: string;
}

export interface Problem {
  id: string;
  subject: Subject;
  topic: string;
  difficulty: Difficulty;
  prompt: string;
  passage?: string; // optional reading passage shown above the prompt
  choices: Choice[];
  correctChoiceId: string;
  explanation: string;
}

export interface Attempt {
  id: number;
  userId: number;
  problemId: string;
  subject: Subject;
  topic: string;
  difficulty: Difficulty;
  correct: boolean;
  timeSpentSeconds: number;
  createdAt: string;
}

export interface SubjectStats {
  subject: Subject;
  attempted: number;
  correct: number;
  accuracy: number; // 0-100
}

export interface TopicStats {
  subject: Subject;
  topic: string;
  attempted: number;
  correct: number;
  accuracy: number;
}

export interface DailyStats {
  date: string; // yyyy-mm-dd
  attempted: number;
  correct: number;
}

export interface ReportData {
  totalAttempted: number;
  totalCorrect: number;
  overallAccuracy: number;
  currentStreakDays: number;
  bySubject: SubjectStats[];
  byTopic: TopicStats[];
  byDay: DailyStats[];
  recentAttempts: Attempt[];
}
