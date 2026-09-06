# Hack as a Service

This file is public. Keep private context and local paths out of it.

**Last updated:** 2026-09-06  
**Status:** active  
**Type:** other

## Goal

Build an organizer operating system for a hackathon: create the event, accept
project submissions, and run judging. Keep it thinner than DevPost. A public
directory of hackathons is out of scope for v1.

## Done when

- An organizer can create a hackathon, accept submissions, and collect
  per-project scores from judges against a weighted rubric.

## Current state

v1 loop works locally: public Hackathon page, Project submit without
an account, Judge Access Code, weighted ranking. Organizers sign in at
`/sign-in` with Clerk (keyless in `bun dev`). Domain tests pass.

## Next action

Sign in at `/sign-in`, create a Hackathon, and run one event end to end.

## Links

- Documentation: CONTEXT.md
- Spec: docs/v1-organizer-os.md
- GitHub: https://github.com/crafter-station/hack-as-a-service
