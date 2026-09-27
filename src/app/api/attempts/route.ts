import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { recordAttempt } from "@/lib/attempts";
import { getProblemById } from "@/lib/problems";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const problemId = body?.problemId as string | undefined;
  const choiceId = body?.choiceId as string | undefined;
  const timeSpentSeconds = Number(body?.timeSpentSeconds) || 0;

  if (!problemId || !choiceId) {
    return NextResponse.json(
      { error: "problemId and choiceId are required" },
      { status: 400 }
    );
  }

  const problem = getProblemById(problemId);
  if (!problem) {
    return NextResponse.json({ error: "Unknown problem" }, { status: 400 });
  }

  // Correctness is decided here, server-side, from the JSON file the
  // client never receives the answer key for -- not trusted from the client.
  const correct = choiceId === problem.correctChoiceId;

  await recordAttempt({
    userId: Number(session.user.id),
    problemId: problem.id,
    subject: problem.subject,
    topic: problem.topic,
    difficulty: problem.difficulty,
    correct,
    timeSpentSeconds,
  });

  return NextResponse.json({
    correct,
    correctChoiceId: problem.correctChoiceId,
    explanation: problem.explanation,
  });
}
