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

v1 is implemented locally: Clerk for organizers, public project submit,
judge Access Code, weighted ranking. Domain tests pass. Clerk keys are
not provisioned yet — copy `.env.example` and run `clerk init`.

## Next action

Add Clerk keys, run `bun dev`, and run one hackathon end to end.

## Links

- Documentation: CONTEXT.md
- Spec: docs/v1-organizer-os.md
- GitHub: https://github.com/crafter-station/hack-as-a-service
