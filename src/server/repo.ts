import { and, asc, eq } from "drizzle-orm";

import {
  assertRubric,
  canSubmit,
  DEFAULT_RUBRIC,
  parseParticipantEmails,
  rankProjects,
  scoreProject,
  toSlug,
} from "@/domain";
import { accessCode, id } from "@/lib/utils";
import { db, ensureSchema } from "./db";
import {
  comments,
  criteria,
  hackathons,
  judges,
  projects,
  ratings,
} from "./schema";

async function ready() {
  await ensureSchema();
}

export async function listOrganizerHackathons(organizerUserId: string) {
  await ready();
  return db
    .select()
    .from(hackathons)
    .where(eq(hackathons.organizerUserId, organizerUserId));
}

export async function getHackathonBySlug(slug: string) {
  await ready();
  const [hackathon] = await db
    .select()
    .from(hackathons)
    .where(eq(hackathons.slug, slug))
    .limit(1);
  return hackathon ?? null;
}

export async function createHackathon(input: {
  organizerUserId: string;
  name: string;
  coverImageUrl: string;
  startsAt: Date;
  endsAt: Date;
}) {
  await ready();
  const slug = toSlug(input.name);
  const existing = await getHackathonBySlug(slug);
  if (existing) {
    throw new Error("A Hackathon with this name already exists");
  }
  if (input.endsAt < input.startsAt) {
    throw new Error("End must be after start");
  }
  if (!input.coverImageUrl.trim()) {
    throw new Error("Cover image URL is required");
  }

  const row = {
    id: id(),
    organizerUserId: input.organizerUserId,
    slug,
    name: input.name.trim(),
    coverImageUrl: input.coverImageUrl.trim(),
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    createdAt: new Date(),
  };
  await db.insert(hackathons).values(row);
  await db.insert(criteria).values(
    DEFAULT_RUBRIC.map((item, index) => ({
      id: id(),
      hackathonId: row.id,
      name: item.name,
      weightPercent: item.weightPercent,
      sortOrder: index,
    })),
  );
  return row;
}

export async function updateHackathon(input: {
  organizerUserId: string;
  slug: string;
  name: string;
  coverImageUrl: string;
  startsAt: Date;
  endsAt: Date;
}) {
  await ready();
  const hackathon = await requireOwnedHackathon(
    input.organizerUserId,
    input.slug,
  );
  if (input.endsAt < input.startsAt) {
    throw new Error("End must be after start");
  }
  if (!input.coverImageUrl.trim()) {
    throw new Error("Cover image URL is required");
  }
  toSlug(input.name);

  await db
    .update(hackathons)
    .set({
      name: input.name.trim(),
      coverImageUrl: input.coverImageUrl.trim(),
      startsAt: input.startsAt,
      endsAt: input.endsAt,
    })
    .where(eq(hackathons.id, hackathon.id));
}

export async function listProjects(hackathonId: string) {
  await ready();
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.hackathonId, hackathonId));
  return rows.map((row) => ({
    ...row,
    participantEmails: JSON.parse(row.participantEmails) as string[],
  }));
}

export async function submitProject(input: {
  slug: string;
  name: string;
  linkUrl: string;
  imageUrl: string;
  participantEmails: string;
  now?: Date;
}) {
  await ready();
  const hackathon = await getHackathonBySlug(input.slug);
  if (!hackathon) throw new Error("Hackathon not found");
  if (!canSubmit(hackathon, input.now ?? new Date())) {
    throw new Error("This Hackathon is not open for Projects");
  }
  if (!input.name.trim() || !input.linkUrl.trim() || !input.imageUrl.trim()) {
    throw new Error("Name, link, and image URL are required");
  }

  const emails = parseParticipantEmails(input.participantEmails);
  const row = {
    id: id(),
    hackathonId: hackathon.id,
    name: input.name.trim(),
    linkUrl: input.linkUrl.trim(),
    imageUrl: input.imageUrl.trim(),
    participantEmails: JSON.stringify(emails),
    createdAt: new Date(),
  };
  await db.insert(projects).values(row);
  return { ...row, participantEmails: emails };
}

export async function updateProject(input: {
  organizerUserId: string;
  projectId: string;
  name: string;
  linkUrl: string;
  imageUrl: string;
  participantEmails: string;
}) {
  await ready();
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, input.projectId))
    .limit(1);
  if (!project) throw new Error("Project not found");

  const [hackathon] = await db
    .select()
    .from(hackathons)
    .where(eq(hackathons.id, project.hackathonId))
    .limit(1);
  if (!hackathon || hackathon.organizerUserId !== input.organizerUserId) {
    throw new Error("Not allowed");
  }

  const emails = parseParticipantEmails(input.participantEmails);
  await db
    .update(projects)
    .set({
      name: input.name.trim(),
      linkUrl: input.linkUrl.trim(),
      imageUrl: input.imageUrl.trim(),
      participantEmails: JSON.stringify(emails),
    })
    .where(eq(projects.id, input.projectId));
}

export async function listCriteria(hackathonId: string) {
  await ready();
  return db
    .select()
    .from(criteria)
    .where(eq(criteria.hackathonId, hackathonId))
    .orderBy(asc(criteria.sortOrder));
}

export async function saveRubric(input: {
  organizerUserId: string;
  slug: string;
  items: Array<{ name: string; weightPercent: number }>;
}) {
  await ready();
  const hackathon = await requireOwnedHackathon(
    input.organizerUserId,
    input.slug,
  );
  assertRubric(input.items);

  await db.delete(criteria).where(eq(criteria.hackathonId, hackathon.id));
  if (input.items.length > 0) {
    await db.insert(criteria).values(
      input.items.map((item, index) => ({
        id: id(),
        hackathonId: hackathon.id,
        name: item.name.trim(),
        weightPercent: item.weightPercent,
        sortOrder: index,
      })),
    );
  }
}

export async function listJudges(hackathonId: string) {
  await ready();
  return db.select().from(judges).where(eq(judges.hackathonId, hackathonId));
}

export async function addJudge(input: {
  organizerUserId: string;
  slug: string;
  name: string;
}) {
  await ready();
  const hackathon = await requireOwnedHackathon(
    input.organizerUserId,
    input.slug,
  );
  if (!input.name.trim()) throw new Error("Judge name is required");
  const row = {
    id: id(),
    hackathonId: hackathon.id,
    name: input.name.trim(),
    accessCode: accessCode(),
  };
  await db.insert(judges).values(row);
  return row;
}

export async function getJudgeByCode(slug: string, code: string) {
  await ready();
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) return null;
  const [judge] = await db
    .select()
    .from(judges)
    .where(
      and(
        eq(judges.hackathonId, hackathon.id),
        eq(judges.accessCode, code.trim()),
      ),
    )
    .limit(1);
  return judge ? { hackathon, judge } : null;
}

export async function saveJudging(input: {
  slug: string;
  accessCode: string;
  projectId: string;
  ratings: Array<{ criterionId: string; value: number }>;
  comment: string;
}) {
  await ready();
  const session = await getJudgeByCode(input.slug, input.accessCode);
  if (!session) throw new Error("Invalid Access Code");

  const rubric = await listCriteria(session.hackathon.id);
  if (rubric.length === 0) throw new Error("This Hackathon has no Rubric yet");

  const ratedIds = new Set(input.ratings.map((rating) => rating.criterionId));
  if (rubric.some((criterion) => !ratedIds.has(criterion.id))) {
    throw new Error("Rate every Criterion");
  }

  const [project] = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.id, input.projectId),
        eq(projects.hackathonId, session.hackathon.id),
      ),
    )
    .limit(1);
  if (!project) throw new Error("Project not found");

  const scored = scoreProject(
    rubric.map((criterion) => {
      const rating = input.ratings.find(
        (item) => item.criterionId === criterion.id,
      );
      return {
        name: criterion.name,
        weightPercent: criterion.weightPercent,
        rating: rating?.value ?? 0,
      };
    }),
  );

  for (const criterion of rubric) {
    const rating = input.ratings.find(
      (item) => item.criterionId === criterion.id,
    );
    if (!rating) continue;
    await db
      .delete(ratings)
      .where(
        and(
          eq(ratings.judgeId, session.judge.id),
          eq(ratings.projectId, input.projectId),
          eq(ratings.criterionId, criterion.id),
        ),
      );
    await db.insert(ratings).values({
      id: id(),
      judgeId: session.judge.id,
      projectId: input.projectId,
      criterionId: criterion.id,
      value: rating.value,
    });
  }

  await db
    .delete(comments)
    .where(
      and(
        eq(comments.judgeId, session.judge.id),
        eq(comments.projectId, input.projectId),
      ),
    );
  if (input.comment.trim()) {
    await db.insert(comments).values({
      id: id(),
      judgeId: session.judge.id,
      projectId: input.projectId,
      body: input.comment.trim(),
    });
  }

  return scored;
}

export async function getJudgeRatings(judgeId: string, projectId: string) {
  await ready();
  const ratingRows = await db
    .select()
    .from(ratings)
    .where(and(eq(ratings.judgeId, judgeId), eq(ratings.projectId, projectId)));
  const [comment] = await db
    .select()
    .from(comments)
    .where(
      and(eq(comments.judgeId, judgeId), eq(comments.projectId, projectId)),
    )
    .limit(1);
  return { ratings: ratingRows, comment: comment?.body ?? "" };
}

export async function rankingForOrganizer(
  organizerUserId: string,
  slug: string,
) {
  await ready();
  const hackathon = await requireOwnedHackathon(organizerUserId, slug);
  const projectRows = await listProjects(hackathon.id);
  const rubric = await listCriteria(hackathon.id);
  const judgeRows = await listJudges(hackathon.id);
  const ratingRows = await db.select().from(ratings);
  const commentRows = await db.select().from(comments);

  const judgeScores = projectRows.map((project) => {
    const scores = judgeRows.flatMap((judge) => {
      const judgeRatings = ratingRows.filter(
        (rating) =>
          rating.judgeId === judge.id && rating.projectId === project.id,
      );
      if (judgeRatings.length !== rubric.length || rubric.length === 0)
        return [];
      try {
        return [
          {
            judgeId: judge.id,
            judgeName: judge.name,
            score: scoreProject(
              rubric.map((criterion) => ({
                name: criterion.name,
                weightPercent: criterion.weightPercent,
                rating:
                  judgeRatings.find(
                    (rating) => rating.criterionId === criterion.id,
                  )?.value ?? 0,
              })),
            ),
            comment:
              commentRows.find(
                (comment) =>
                  comment.judgeId === judge.id &&
                  comment.projectId === project.id,
              )?.body ?? "",
          },
        ];
      } catch {
        return [];
      }
    });
    return { id: project.id, project, scores };
  });

  const ranked = rankProjects(
    judgeScores.map((item) => ({
      id: item.id,
      scores: item.scores.map((score) => score.score),
    })),
  );

  return ranked.map((item) => {
    const found = judgeScores.find((row) => row.id === item.id);
    return {
      project: found?.project,
      average: item.average,
      judges: found?.scores ?? [],
    };
  });
}

async function requireOwnedHackathon(organizerUserId: string, slug: string) {
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) throw new Error("Hackathon not found");
  if (hackathon.organizerUserId !== organizerUserId) {
    throw new Error("Not allowed");
  }
  return hackathon;
}
