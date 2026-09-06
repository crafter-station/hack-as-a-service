import {
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const hackathons = sqliteTable(
  "hackathons",
  {
    id: text("id").primaryKey(),
    organizerUserId: text("organizer_user_id").notNull(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    coverImageUrl: text("cover_image_url").notNull(),
    startsAt: integer("starts_at", { mode: "timestamp_ms" }).notNull(),
    endsAt: integer("ends_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [uniqueIndex("hackathons_slug_uidx").on(table.slug)],
);

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  hackathonId: text("hackathon_id")
    .notNull()
    .references(() => hackathons.id),
  name: text("name").notNull(),
  linkUrl: text("link_url").notNull(),
  imageUrl: text("image_url").notNull(),
  participantEmails: text("participant_emails").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const criteria = sqliteTable("criteria", {
  id: text("id").primaryKey(),
  hackathonId: text("hackathon_id")
    .notNull()
    .references(() => hackathons.id),
  name: text("name").notNull(),
  weightPercent: integer("weight_percent").notNull(),
  sortOrder: integer("sort_order").notNull(),
});

export const judges = sqliteTable("judges", {
  id: text("id").primaryKey(),
  hackathonId: text("hackathon_id")
    .notNull()
    .references(() => hackathons.id),
  name: text("name").notNull(),
  accessCode: text("access_code").notNull(),
});

export const ratings = sqliteTable(
  "ratings",
  {
    id: text("id").primaryKey(),
    judgeId: text("judge_id")
      .notNull()
      .references(() => judges.id),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id),
    criterionId: text("criterion_id")
      .notNull()
      .references(() => criteria.id),
    value: integer("value").notNull(),
  },
  (table) => [
    uniqueIndex("ratings_judge_project_criterion_uidx").on(
      table.judgeId,
      table.projectId,
      table.criterionId,
    ),
  ],
);

export const comments = sqliteTable(
  "comments",
  {
    id: text("id").primaryKey(),
    judgeId: text("judge_id")
      .notNull()
      .references(() => judges.id),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id),
    body: text("body").notNull(),
  },
  (table) => [
    uniqueIndex("comments_judge_project_uidx").on(
      table.judgeId,
      table.projectId,
    ),
  ],
);
