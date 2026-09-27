import Link from "next/link";
import { notFound } from "next/navigation";
import { getProblemsBySubject, getTopicsForSubject, toPublicProblem } from "@/lib/problems";
import type { Subject } from "@/types";
import PracticeSession from "@/components/PracticeSession";

const SLUG_TO_SUBJECT: Record<string, Subject> = {
  math: "Math",
  reading: "Reading",
  writing: "Writing",
};

export default async function SubjectPracticePage({
  params,
  searchParams,
}: {
  params: Promise<{ subject: string }>;
  searchParams: Promise<{ topic?: string }>;
}) {
  const { subject: subjectSlug } = await params;
  const { topic } = await searchParams;

  const subject = SLUG_TO_SUBJECT[subjectSlug.toLowerCase()];
  if (!subject) notFound();

  const topics = getTopicsForSubject(subject);
  let problems = getProblemsBySubject(subject);
  if (topic) {
    problems = problems.filter((p) => p.topic === topic);
  }

  const publicProblems = problems.map(toPublicProblem);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif-display text-3xl">{subject} practice</h1>
        <Link href="/practice" className="text-sm text-ink-soft hover:text-ink">
          Change subject
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/practice/${subjectSlug}`}
          className={`rounded-full border px-3 py-1 text-sm ${
            !topic ? "border-cobalt text-cobalt" : "border-line text-ink-soft"
          }`}
        >
          All topics
        </Link>
        {topics.map((t) => (
          <Link
            key={t}
            href={`/practice/${subjectSlug}?topic=${encodeURIComponent(t)}`}
            className={`rounded-full border px-3 py-1 text-sm ${
              topic === t ? "border-cobalt text-cobalt" : "border-line text-ink-soft"
            }`}
          >
            {t}
          </Link>
        ))}
      </div>

      <div className="mt-8">
        {publicProblems.length > 0 ? (
          <PracticeSession key={topic || "all"} problems={publicProblems} />
        ) : (
          <p className="text-ink-soft">No problems found for this filter yet.</p>
        )}
      </div>
    </div>
  );
}
