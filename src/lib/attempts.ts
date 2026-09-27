import { query } from "@/lib/db";
import type {
  Attempt,
  DailyStats,
  Difficulty,
  ReportData,
  Subject,
  SubjectStats,
  TopicStats,
} from "@/types";

interface RecordAttemptInput {
  userId: number;
  problemId: string;
  subject: Subject;
  topic: string;
  difficulty: Difficulty;
  correct: boolean;
  timeSpentSeconds: number;
}

export async function recordAttempt(input: RecordAttemptInput): Promise<void> {
  await query(
    `INSERT INTO attempts
       ("userId", "problemId", subject, topic, difficulty, correct, "timeSpentSeconds")
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      input.userId,
      input.problemId,
      input.subject,
      input.topic,
      input.difficulty,
      input.correct,
      input.timeSpentSeconds,
    ]
  );
}

interface AttemptRow {
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

export async function getReportData(userId: number): Promise<ReportData> {
  const rows = await query<AttemptRow>(
    `SELECT id, "userId", "problemId", subject, topic, difficulty, correct,
            "timeSpentSeconds", "createdAt"
     FROM attempts
     WHERE "userId" = $1
     ORDER BY "createdAt" ASC`,
    [userId]
  );

  const totalAttempted = rows.length;
  const totalCorrect = rows.filter((r) => r.correct).length;
  const overallAccuracy = totalAttempted
    ? Math.round((totalCorrect / totalAttempted) * 1000) / 10
    : 0;

  // --- By subject ---
  const subjectMap = new Map<Subject, { attempted: number; correct: number }>();
  for (const r of rows) {
    const entry = subjectMap.get(r.subject) ?? { attempted: 0, correct: 0 };
    entry.attempted += 1;
    if (r.correct) entry.correct += 1;
    subjectMap.set(r.subject, entry);
  }
  const bySubject: SubjectStats[] = Array.from(subjectMap.entries()).map(
    ([subject, v]) => ({
      subject,
      attempted: v.attempted,
      correct: v.correct,
      accuracy: Math.round((v.correct / v.attempted) * 1000) / 10,
    })
  );

  // --- By topic ---
  const topicMap = new Map<
    string,
    { subject: Subject; topic: string; attempted: number; correct: number }
  >();
  for (const r of rows) {
    const key = `${r.subject}::${r.topic}`;
    const entry =
      topicMap.get(key) ?? { subject: r.subject, topic: r.topic, attempted: 0, correct: 0 };
    entry.attempted += 1;
    if (r.correct) entry.correct += 1;
    topicMap.set(key, entry);
  }
  const byTopic: TopicStats[] = Array.from(topicMap.values()).map((v) => ({
    subject: v.subject,
    topic: v.topic,
    attempted: v.attempted,
    correct: v.correct,
    accuracy: Math.round((v.correct / v.attempted) * 1000) / 10,
  }));

  // --- By day (last 30 days) ---
  const dayMap = new Map<string, { attempted: number; correct: number }>();
  for (const r of rows) {
    const date = new Date(r.createdAt).toISOString().slice(0, 10);
    const entry = dayMap.get(date) ?? { attempted: 0, correct: 0 };
    entry.attempted += 1;
    if (r.correct) entry.correct += 1;
    dayMap.set(date, entry);
  }
  const byDay: DailyStats[] = Array.from(dayMap.entries())
    .map(([date, v]) => ({ date, attempted: v.attempted, correct: v.correct }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30);

  // --- Current streak: consecutive days with >=1 attempt, ending today or yesterday ---
  const daysWithActivity = new Set(dayMap.keys());
  let currentStreakDays = 0;
  const cursor = new Date();
  // If there's no activity today, the streak can still count through
  // yesterday (a student who practiced yesterday hasn't "lost" today's
  // streak until the day fully passes).
  if (!daysWithActivity.has(cursor.toISOString().slice(0, 10))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (daysWithActivity.has(cursor.toISOString().slice(0, 10))) {
    currentStreakDays += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const recentAttempts: Attempt[] = rows
    .slice(-10)
    .reverse()
    .map((r) => ({
      id: r.id,
      userId: r.userId,
      problemId: r.problemId,
      subject: r.subject,
      topic: r.topic,
      difficulty: r.difficulty,
      correct: r.correct,
      timeSpentSeconds: r.timeSpentSeconds,
      createdAt: r.createdAt,
    }));

  return {
    totalAttempted,
    totalCorrect,
    overallAccuracy,
    currentStreakDays,
    bySubject,
    byTopic,
    byDay,
    recentAttempts,
  };
}
