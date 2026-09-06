import Link from "next/link";
import { notFound } from "next/navigation";

import { Cover } from "@/components/cover";
import { EmptyState } from "@/components/empty-state";
import { canSubmit, hackathonStatus } from "@/domain";
import { btnClass, btnPrimaryClass, statusLabel } from "@/lib/ui";
import { getHackathonBySlug, listProjects } from "@/server/repo";

export default async function PublicHackathonPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { slug } = await params;
  const { submitted } = await searchParams;
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) notFound();

  const projectRows = await listProjects(hackathon.id);
  const status = hackathonStatus(hackathon, new Date());
  const open = canSubmit(hackathon, new Date());

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12">
      <Cover src={hackathon.coverImageUrl} alt="" />
      <p className="font-mono text-xs uppercase text-muted">
        {statusLabel[status]}
      </p>
      <h1 className="text-balance text-3xl">{hackathon.name}</h1>
      <p className="text-sm text-muted tabular-nums">
        {hackathon.startsAt.toLocaleString("es-PE", {
          dateStyle: "medium",
          timeStyle: "short",
        })}{" "}
        →{" "}
        {hackathon.endsAt.toLocaleString("es-PE", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </p>
      {submitted ? (
        <p
          role="status"
          className="border border-line px-4 py-3 text-sm text-pretty"
        >
          Proyecto enviado. Ya está en la lista.
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        {open ? (
          <Link href={`/h/${slug}/submit`} className={btnPrimaryClass}>
            Subir proyecto
          </Link>
        ) : (
          <p className="text-muted">Las submissions están cerradas.</p>
        )}
        <Link href={`/h/${slug}/judge`} className={btnClass}>
          Soy juez
        </Link>
      </div>
      {projectRows.length === 0 ? (
        <EmptyState
          title="Todavía no hay proyectos."
          actionHref={open ? `/h/${slug}/submit` : undefined}
          actionLabel={open ? "Subir el primero" : undefined}
        />
      ) : (
        <ul className="grid gap-4">
          {projectRows.map((project) => (
            <li key={project.id} className="border border-line p-4">
              <Cover src={project.imageUrl} alt="" className="mb-3" />
              <a href={project.linkUrl} className="text-lg underline">
                {project.name}
              </a>
              <p className="text-sm text-muted">
                {project.participantEmails.join(", ")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
