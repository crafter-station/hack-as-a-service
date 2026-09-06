# v1 Organizer OS

## Problem Statement

Running a hackathon today means a custom landing plus a spreadsheet, or DevPost. DevPost can collect Projects and judging, but it is heavy: accounts for everyone, teams, extra surfaces beside the loop that actually matters. I need to create a Hackathon, receive Projects, and get Scores from Judges without that bulk.

## Solution

A signed-in Organizer creates a Hackathon (name, cover image URL, dates). People submit a Project without an account. The Organizer defines a Rubric and adds Judges. Each Judge opens a link, enters an Access Code, rates every Project 1–5 per Criterion, and may leave a comment. The Organizer sees a weighted ranking. There is no public directory of hackathons.

## User Stories

1. As a visitor, I want to understand what this site is for, so that I know whether to sign in as an Organizer.
2. As a visitor, I want to sign in with Clerk, so that I become an Organizer.
3. As an Organizer, I want to create a Hackathon with a name, cover image URL, start date, and end date, so that I have a public page to share.
4. As an Organizer, I want to see the Hackathons I created, so that I can reopen one I am running.
5. As an Organizer, I want a stable public URL for my Hackathon, so that I can share it with Participants and Judges.
6. As a visitor, I want to open a Hackathon page and see its name, cover, dates, and submitted Projects, so that I know what this event is.
7. As a Participant, I want to submit a Project with a name, link, image URL, and participant emails, so that Judges can find the work.
8. As a Participant, I want to be rejected if the Hackathon is not open, so that I do not submit outside the window.
9. As an Organizer, I want to edit a Project after it is in, so that a broken link can be fixed without Participant accounts.
10. As an Organizer, I want to define a Rubric of named Criteria with percent weights, so that judging is consistent.
11. As an Organizer, I want the product to refuse a Rubric whose weights do not sum to 100, so that Scores stay comparable.
12. As an Organizer, I want to add a Judge by name and receive an Access Code plus a judging URL, so that I can invite them without creating accounts.
13. As a Judge, I want to enter my Access Code and see the Projects, so that I can score without signing in.
14. As a Judge, I want to rate each Criterion from 1 to 5 and leave an optional comment, so that I can judge a Project.
15. As a Judge, I want to change my Ratings later, so that a mistake is not permanent.
16. As a Judge, I must rate every Criterion before a Score is saved, so that incomplete judging does not pollute the ranking.
17. As a Judge, I do not want to see other Judges' Ratings, so that I score independently.
18. As an Organizer, I want to see each Project's average Score and rank, so that I can pick winners.
19. As an Organizer, I want to see per-Judge Scores and comments, so that I can resolve disagreements.
20. As a visitor, I should not see Scores on the public Hackathon page, so that judging stays private to the Organizer.

## Implementation Decisions

- Next.js App Router, TypeScript, Tailwind CSS, Biome.
- Clerk authenticates Organizers only. Public-first middleware: `/org(.*)` is protected; `/`, `/h(.*)`, `/sign-in`, `/sign-up` are public.
- Persistence is Drizzle with a local SQLite file. Images are URLs, not uploads.
- Mutations go through server actions that call domain functions, then persist.
- A Hackathon slug is derived from the name and must be unique.
- Hackathon status is derived from dates: upcoming, open, closed.
- Rubric weights are integers that must sum to 100. At least one Criterion.
- Score formula: `sum(rating × weightPercent) / 5` → 0–100.
- Last write wins when a Judge resubmits Ratings for a Project.
- One Organizer (Clerk user id) owns a Hackathon. No co-organizers.

## Testing Decisions

- The only seam is `src/domain`: slug, submission window, Rubric, Rating, Score, ranking.
- Tests describe behavior with worked examples, not internal structure. No mocks.
- Scoring worked example: Criterion A 60% rated 5, Criterion B 40% rated 1 → Score 68.
- Persistence and UI are adapters around that seam. They are not the test target for v1.

## Out of Scope

- Public directory of hackathons.
- Clerk accounts for Participants or Judges.
- Co-organizers, teams as entities, magic links, file uploads.
- Mentors, sponsors, prizes, tracks, payments.
- Public scoreboard.

## Further Notes

- Primary seam: `src/domain`.
- ADR: `docs/adr/0001-judges-and-participants-are-not-clerk-users.md`.
