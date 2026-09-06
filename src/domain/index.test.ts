import { describe, expect, test } from "vitest";

import {
  assertRubric,
  averageScore,
  canSubmit,
  hackathonStatus,
  isValidRating,
  parseParticipantEmails,
  rankProjects,
  scoreProject,
  toSlug,
} from "./index";

describe("toSlug", () => {
  test("a Hackathon name becomes a stable lowercase slug", () => {
    expect(toSlug("The Next Craft")).toBe("the-next-craft");
  });
});

describe("canSubmit", () => {
  const startsAt = new Date("2026-09-06T10:00:00Z");
  const endsAt = new Date("2026-09-06T22:00:00Z");

  test("submissions are allowed until the end, including before start", () => {
    expect(
      canSubmit({ startsAt, endsAt }, new Date("2026-09-06T09:59:59Z")),
    ).toBe(true);
    expect(
      canSubmit({ startsAt, endsAt }, new Date("2026-09-06T10:00:00Z")),
    ).toBe(true);
    expect(
      canSubmit({ startsAt, endsAt }, new Date("2026-09-06T22:00:00Z")),
    ).toBe(true);
    expect(
      canSubmit({ startsAt, endsAt }, new Date("2026-09-06T22:00:01Z")),
    ).toBe(false);
  });
});

describe("hackathonStatus", () => {
  const startsAt = new Date("2026-09-06T10:00:00Z");
  const endsAt = new Date("2026-09-06T22:00:00Z");

  test("status is upcoming, open, or closed from dates", () => {
    expect(
      hackathonStatus({ startsAt, endsAt }, new Date("2026-09-06T09:00:00Z")),
    ).toBe("upcoming");
    expect(
      hackathonStatus({ startsAt, endsAt }, new Date("2026-09-06T12:00:00Z")),
    ).toBe("open");
    expect(
      hackathonStatus({ startsAt, endsAt }, new Date("2026-09-07T00:00:00Z")),
    ).toBe("closed");
  });
});

describe("assertRubric", () => {
  test("a Rubric is valid only when weights are percents that sum to 100", () => {
    expect(() =>
      assertRubric([
        { name: "Craft", weightPercent: 60 },
        { name: "Impact", weightPercent: 40 },
      ]),
    ).not.toThrow();

    expect(() => assertRubric([{ name: "Craft", weightPercent: 60 }])).toThrow(
      /100/,
    );
  });
});

describe("scoreProject", () => {
  test("60% at 5 and 40% at 1 equals 68", () => {
    expect(
      scoreProject([
        { name: "Craft", weightPercent: 60, rating: 5 },
        { name: "Impact", weightPercent: 40, rating: 1 },
      ]),
    ).toBe(68);
  });
});

describe("isValidRating", () => {
  test("a Rating is an integer from 1 to 5", () => {
    expect(isValidRating(1)).toBe(true);
    expect(isValidRating(5)).toBe(true);
    expect(isValidRating(0)).toBe(false);
    expect(isValidRating(6)).toBe(false);
    expect(isValidRating(3.5)).toBe(false);
  });
});

describe("parseParticipantEmails", () => {
  test("splits and lowercases emails", () => {
    expect(parseParticipantEmails("Ana@x.com,  bob@x.com")).toEqual([
      "ana@x.com",
      "bob@x.com",
    ]);
  });

  test("rejects an invalid email", () => {
    expect(() => parseParticipantEmails("ana@x.com, nope")).toThrow(/email/i);
  });
});

describe("rankProjects", () => {
  test("Projects order by average Score, highest first", () => {
    expect(
      rankProjects([
        { id: "a", scores: [50, 60] },
        { id: "b", scores: [90] },
        { id: "c", scores: [] },
      ]),
    ).toEqual([
      { id: "b", average: 90 },
      { id: "a", average: 55 },
      { id: "c", average: null },
    ]);
  });
});

describe("averageScore", () => {
  test("empty Scores have no average", () => {
    expect(averageScore([])).toBeNull();
  });
});
