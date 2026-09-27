import Link from "next/link";
import { getAllProblems } from "@/lib/problems";

export default function Home() {
  const sample = getAllProblems().find((p) => p.id === "reading-003")!;

  return (
    <div className="grid gap-16 md:grid-cols-2 md:items-center">
      <div>
        <h1 className="font-serif-display text-4xl leading-tight text-ink md:text-5xl">
          Practice like it&apos;s test day.
        </h1>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-ink-soft">
          Real question formats across Math, Reading, and Writing. Every
          attempt is scored and logged, so you can see exactly where your
          accuracy is improving — and where it isn&apos;t, yet.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <Link
            href="/practice"
            className="rounded-full bg-cobalt px-6 py-3 font-medium text-paper hover:bg-cobalt-deep"
          >
            Start practicing
          </Link>
          <Link
            href="/reports"
            className="text-ink-soft underline decoration-line underline-offset-4 hover:text-ink"
          >
            View a progress report
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-line bg-white p-7 shadow-[0_1px_0_var(--color-line)]">
        <div className="flex items-center justify-between text-xs text-ink-soft">
          <span>{sample.subject} — {sample.topic}</span>
          <span className="font-tabular">No. 12</span>
        </div>
        <p className="mt-4 border-l-2 border-line pl-4 italic leading-relaxed text-ink-soft">
          {sample.passage}
        </p>
        <p className="mt-5 leading-relaxed">{sample.prompt}</p>
        <div className="mt-5 grid gap-2">
          {sample.choices.map((choice) => (
            <div
              key={choice.id}
              className={`flex items-start gap-3 rounded-md border px-3 py-2 text-sm ${
                choice.id === sample.correctChoiceId
                  ? "border-gold bg-gold/10"
                  : "border-line"
              }`}
            >
              <span className="font-tabular text-ink-soft">{choice.id}</span>
              <span>{choice.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
