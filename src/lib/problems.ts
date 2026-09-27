import problemsData from "@/data/problems.json";
import type { Problem, Subject } from "@/types";

const problems = problemsData as Problem[];

export function getAllProblems(): Problem[] {
  return problems;
}

export function getProblemById(id: string): Problem | undefined {
  return problems.find((p) => p.id === id);
}

export function getProblemsBySubject(subject: Subject): Problem[] {
  return problems.filter((p) => p.subject === subject);
}

export function getSubjects(): Subject[] {
  return Array.from(new Set(problems.map((p) => p.subject)));
}

export function getTopicsForSubject(subject: Subject): string[] {
  return Array.from(
    new Set(problems.filter((p) => p.subject === subject).map((p) => p.topic))
  );
}

/** Public-safe version of a problem: hides the correct answer + explanation. */
export function toPublicProblem(problem: Problem) {
  return {
    id: problem.id,
    subject: problem.subject,
    topic: problem.topic,
    difficulty: problem.difficulty,
    prompt: problem.prompt,
    passage: problem.passage,
    choices: problem.choices,
  };
}
