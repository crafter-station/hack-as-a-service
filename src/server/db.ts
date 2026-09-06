import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL ?? "file:./data/haas.sqlite";

if (databaseUrl.startsWith("file:")) {
  const filePath = databaseUrl.replace(/^file:/, "");
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}

const client = createClient({ url: databaseUrl });

export const db = drizzle(client, { schema });

export async function ensureSchema() {
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS hackathons (
      id TEXT PRIMARY KEY,
      organizer_user_id TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      cover_image_url TEXT NOT NULL,
      starts_at INTEGER NOT NULL,
      ends_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      hackathon_id TEXT NOT NULL,
      name TEXT NOT NULL,
      link_url TEXT NOT NULL,
      image_url TEXT NOT NULL,
      participant_emails TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (hackathon_id) REFERENCES hackathons(id)
    );
    CREATE TABLE IF NOT EXISTS criteria (
      id TEXT PRIMARY KEY,
      hackathon_id TEXT NOT NULL,
      name TEXT NOT NULL,
      weight_percent INTEGER NOT NULL,
      sort_order INTEGER NOT NULL,
      FOREIGN KEY (hackathon_id) REFERENCES hackathons(id)
    );
    CREATE TABLE IF NOT EXISTS judges (
      id TEXT PRIMARY KEY,
      hackathon_id TEXT NOT NULL,
      name TEXT NOT NULL,
      access_code TEXT NOT NULL,
      FOREIGN KEY (hackathon_id) REFERENCES hackathons(id)
    );
    CREATE TABLE IF NOT EXISTS ratings (
      id TEXT PRIMARY KEY,
      judge_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      criterion_id TEXT NOT NULL,
      value INTEGER NOT NULL,
      FOREIGN KEY (judge_id) REFERENCES judges(id),
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (criterion_id) REFERENCES criteria(id)
    );
    CREATE UNIQUE INDEX IF NOT EXISTS ratings_judge_project_criterion_uidx
      ON ratings (judge_id, project_id, criterion_id);
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      judge_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      body TEXT NOT NULL,
      FOREIGN KEY (judge_id) REFERENCES judges(id),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
    CREATE UNIQUE INDEX IF NOT EXISTS comments_judge_project_uidx
      ON comments (judge_id, project_id);
  `);
}
