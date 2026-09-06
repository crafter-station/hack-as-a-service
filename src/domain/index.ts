export type HackathonWindow = {
  startsAt: Date;
  endsAt: Date;
};

export type HackathonStatus = "upcoming" | "open" | "closed";

export type CriterionInput = {
  name: string;
  weightPercent: number;
};

export type RatedCriterion = {
  name: string;
  weightPercent: number;
  rating: number;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function toSlug(name: string): string {
  const slug = name
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");

  if (!slug) {
    throw new Error("Hackathon name must produce a slug");
  }

  return slug;
}

export function hackathonStatus(
  window: HackathonWindow,
  now: Date,
): HackathonStatus {
  if (now < window.startsAt) return "upcoming";
  if (now > window.endsAt) return "closed";
  return "open";
}

export function canSubmit(window: HackathonWindow, now: Date): boolean {
  return hackathonStatus(window, now) === "open";
}

export function assertRubric(criteria: readonly CriterionInput[]): void {
  if (criteria.length === 0) {
    throw new Error("A Rubric needs at least one Criterion");
  }

  for (const criterion of criteria) {
    if (!criterion.name.trim()) {
      throw new Error("Each Criterion needs a name");
    }
    if (
      !Number.isInteger(criterion.weightPercent) ||
      criterion.weightPercent <= 0
    ) {
      throw new Error(
        "Each Criterion weight must be a positive integer percent",
      );
    }
  }

  const total = criteria.reduce(
    (sum, criterion) => sum + criterion.weightPercent,
    0,
  );
  if (total !== 100) {
    throw new Error("Rubric weights must sum to 100");
  }
}

export function isValidRating(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

export function scoreProject(ratings: readonly RatedCriterion[]): number {
  if (ratings.length === 0) {
    throw new Error("A Score needs a Rating for every Criterion");
  }

  for (const rated of ratings) {
    if (!isValidRating(rated.rating)) {
      throw new Error("Each Rating must be an integer from 1 to 5");
    }
  }

  assertRubric(
    ratings.map((rated) => ({
      name: rated.name,
      weightPercent: rated.weightPercent,
    })),
  );

  const weighted = ratings.reduce(
    (sum, rated) => sum + rated.rating * rated.weightPercent,
    0,
  );

  return weighted / 5;
}

export function parseParticipantEmails(input: string): string[] {
  const emails = input
    .split(/[,;\n]+/)
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);

  if (emails.length === 0) {
    throw new Error("A Project needs at least one participant email");
  }

  for (const email of emails) {
    if (!EMAIL.test(email)) {
      throw new Error(`Invalid participant email: ${email}`);
    }
  }

  return [...new Set(emails)];
}

export function averageScore(scores: readonly number[]): number | null {
  if (scores.length === 0) return null;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

export function rankProjects(
  projects: ReadonlyArray<{ id: string; scores: readonly number[] }>,
): Array<{ id: string; average: number | null }> {
  return [...projects]
    .map((project) => ({
      id: project.id,
      average: averageScore(project.scores),
    }))
    .sort((left, right) => {
      if (left.average === null && right.average === null) return 0;
      if (left.average === null) return 1;
      if (right.average === null) return -1;
      return right.average - left.average;
    });
}
