"use client";

import { useState } from "react";
import Link from "next/link";

interface PublicChoice {
  id: string;
  text: string;
}

interface PublicProblem {
  id: string;
  subject: string;
  topic: string;
  difficulty: string;
  prompt: string;
  passage?: string;
  choices: PublicChoice[];
}

interface AttemptResult {
  correct: boolean;
  correctChoiceId: string;
  explanation: string;
}

export default function PracticeSession({
  problems,
}: {
  problems: PublicProblem[];
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState({ correct: 0, attempted: 0 });
  const [startedAt, setStartedAt] = useState(() => Date.now());

  const problem = problems[index];
  const isLastProblem = index === problems.length - 1;
  const isDone = index >= problems.length;

  async function submitAnswer() {
    if (!selected || submitting) return;
    setSubmitting(true);
    try {
      const timeSpentSeconds = Math.round((Date.now() - startedAt) / 1000);
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.id,
          choiceId: selected,
          timeSpentSeconds,
        }),
      });
      if (!res.ok) throw new Error("Failed to submit attempt");
      const data: AttemptResult = await res.json();
      setResult(data);
      setScore((s) => ({
        correct: s.correct + (data.correct ? 1 : 0),
        attempted: s.attempted + 1,
      }));
    } finally {
      setSubmitting(false);
    }
  }

  function nextQuestion() {
    setIndex((i) => i + 1);
    setSelected(null);
    setResult(null);
    setStartedAt(Date.now());
  }

  if (isDone) {
    return (
      <div className="rounded-lg border border-line bg-white p-8 text-center">
        <h2 className="font-serif-display text-2xl">Session complete</h2>
        <p className="mt-3 font-tabular text-3xl">
          {score.correct}/{score.attempted}
        </p>
        <p className="mt-1 text-ink-soft">correct this session</p>
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/reports"
            className="rounded-full bg-cobalt px-5 py-2.5 font-medium text-paper hover:bg-cobalt-deep"
          >
            View full progress
          </Link>
          <Link
            href="/practice"
            className="rounded-full border border-line px-5 py-2.5 text-ink-soft hover:border-ink hover:text-ink"
          >
            Practice another subject
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-white p-7">
      <div className="flex items-center justify-between text-xs text-ink-soft">
        <span>
          {problem.subject} — {problem.topic} · {problem.difficulty}
        </span>
        <span className="font-tabular">
          {index + 1} / {problems.length}
        </span>
      </div>

      {problem.passage && (
        <p className="mt-4 border-l-2 border-line pl-4 italic leading-relaxed text-ink-soft">
          {problem.passage}
        </p>
      )}

      <p className="mt-5 leading-relaxed">{problem.prompt}</p>

      <div className="mt-5 grid gap-2">
        {problem.choices.map((choice) => {
          const isSelected = selected === choice.id;
          const isCorrectChoice = result && choice.id === result.correctChoiceId;
          const isWrongSelected =
            result && isSelected && choice.id !== result.correctChoiceId;

          return (
            <button
              key={choice.id}
              type="button"
              disabled={!!result}
              onClick={() => setSelected(choice.id)}
              className={`flex items-start gap-3 rounded-md border px-3 py-2.5 text-left text-sm transition-colors ${
                isCorrectChoice
                  ? "border-gold bg-gold/10"
                  : isWrongSelected
                    ? "border-brick bg-brick/5"
                    : isSelected
                      ? "border-cobalt bg-cobalt/5"
                      : "border-line hover:border-ink-soft"
              }`}
            >
              <span className="font-tabular text-ink-soft">{choice.id}</span>
              <span>{choice.text}</span>
            </button>
          );
        })}
      </div>

      {result && (
        <div
          className={`mt-5 rounded-md border px-4 py-3 text-sm ${
            result.correct ? "border-gold bg-gold/10" : "border-brick bg-brick/5"
          }`}
        >
          <p className="font-medium">
            {result.correct ? "Correct." : "Not quite."}
          </p>
          <p className="mt-1 text-ink-soft">{result.explanation}</p>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        {result ? (
          <button
            type="button"
            onClick={nextQuestion}
            className="rounded-full bg-cobalt px-5 py-2.5 font-medium text-paper hover:bg-cobalt-deep"
          >
            {isLastProblem ? "Finish session" : "Next question"}
          </button>
        ) : (
          <button
            type="button"
            disabled={!selected || submitting}
            onClick={submitAnswer}
            className="rounded-full bg-cobalt px-5 py-2.5 font-medium text-paper hover:bg-cobalt-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Checking…" : "Submit answer"}
          </button>
        )}
      </div>
    </div>
  );
}
