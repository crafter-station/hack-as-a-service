import { addJudge, createHackathon, saveRubric, submitProject } from "../src/server/repo";

const organizerUserId = process.env.ORGANIZER_USER_ID ?? "dev-organizer";
const now = Date.now();

const hackathon = await createHackathon({
  organizerUserId,
  name: "V1 Smoke",
  coverImageUrl: "https://picsum.photos/seed/haas/1200/675",
  startsAt: new Date(now - 60_000),
  endsAt: new Date(now + 7 * 24 * 60 * 60 * 1000),
});

await saveRubric({
  organizerUserId,
  slug: hackathon.slug,
  items: [
    { name: "Craft", weightPercent: 60 },
    { name: "Impact", weightPercent: 40 },
  ],
});

await submitProject({
  slug: hackathon.slug,
  name: "Hueco",
  linkUrl: "https://example.com/hueco",
  imageUrl: "https://picsum.photos/seed/hueco/800/450",
  participantEmails: "ana@example.com, bob@example.com",
});

const judge = await addJudge({
  organizerUserId,
  slug: hackathon.slug,
  name: "Ada",
});

console.log(
  JSON.stringify(
    {
      slug: hackathon.slug,
      publicUrl: `/h/${hackathon.slug}`,
      submitUrl: `/h/${hackathon.slug}/submit`,
      judgeUrl: `/h/${hackathon.slug}/judge?code=${judge.accessCode}`,
      accessCode: judge.accessCode,
    },
    null,
    2,
  ),
);
