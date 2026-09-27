import Link from "next/link";
import { getAllProblems, getSubjects, getTopicsForSubject } from "@/lib/problems";

const SUBJECT_BLURB: Record<string, string> = {
  Math: "Algebra, geometry, statistics, and problem solving.",
  Reading: "Passage-based questions on main idea, inference, and evidence.",
  Writing: "Grammar, punctuation, transitions, and concision.",
};

export default function PracticePage() {
  const subjects = getSubjects();
  const allProblems = getAllProblems();

  return (
    <div>
      <h1 className="font-serif-display text-3xl">Choose a subject</h1>
      <p className="mt-2 text-ink-soft">
        Pick a subject to start a practice session. You can filter by topic
        once you&apos;re in.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {subjects.map((subject) => {
          const count = allProblems.filter((p) => p.subject === subject).length;
          const topics = getTopicsForSubject(subject);
          return (
            <Link
              key={subject}
              href={`/practice/${subject.toLowerCase()}`}
              className="rounded-lg border border-line bg-white p-6 transition-colors hover:border-cobalt"
            >
              <div className="flex items-baseline justify-between">
                <h2 className="font-serif-display text-xl">{subject}</h2>
                <span className="font-tabular text-sm text-ink-soft">
                  {count} qs
                </span>
              </div>
              <p className="mt-2 text-sm text-ink-soft">
                {SUBJECT_BLURB[subject]}
              </p>
              <p className="mt-4 text-xs text-ink-soft">
                {topics.length} topics: {topics.join(", ")}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
