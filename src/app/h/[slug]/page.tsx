import Link from "next/link";
import { notFound } from "next/navigation";

import { canSubmit, hackathonStatus } from "@/domain";
import { getHackathonBySlug, listProjects } from "@/server/repo";

export default async function PublicHackathonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) notFound();

  const projectRows = await listProjects(hackathon.id);
  const status = hackathonStatus(hackathon, new Date());
  const open = canSubmit(hackathon, new Date());

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 px-6 py-12">
      <img
        src={hackathon.coverImageUrl}
        alt=""
        className="aspect-video w-full object-cover"
      />
      <p className="font-mono text-xs uppercase text-muted">{status}</p>
      <h1 className="text-balance text-3xl">{hackathon.name}</h1>
      <p className="text-sm text-muted tabular-nums">
        {hackathon.startsAt.toISOString()} → {hackathon.endsAt.toISOString()}
      </p>
      {open ? (
        <Link
          href={`/h/${slug}/submit`}
          className="w-fit border border-line px-4 py-2 text-sm hover:bg-white hover:text-black"
        >
          Subir proyecto
        </Link>
      ) : (
        <p className="text-muted">Las submissions están cerradas.</p>
      )}
      <ul className="grid gap-4">
        {projectRows.map((project) => (
          <li key={project.id} className="border border-line p-4">
            <img
              src={project.imageUrl}
              alt=""
              className="mb-3 aspect-video w-full object-cover"
            />
            <a href={project.linkUrl} className="text-lg underline">
              {project.name}
            </a>
            <p className="text-sm text-muted">
              {project.participantEmails.join(", ")}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
