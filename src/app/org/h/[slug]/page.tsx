import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ActionForm,
  Field,
  FormMessage,
  SubmitButton,
} from "@/components/action-form";
import { CopyLink } from "@/components/copy-link";
import { EmptyState } from "@/components/empty-state";
import { RubricEditor } from "@/components/rubric-editor";
import { hackathonStatus } from "@/domain";
import { btnClass, btnPrimaryClass, fieldClass, statusLabel } from "@/lib/ui";
import { toDateTimeLocal } from "@/lib/utils";
import {
  addJudgeAction,
  updateHackathonAction,
  updateProjectAction,
} from "@/server/actions";
import {
  getHackathonBySlug,
  listCriteria,
  listJudges,
  listProjects,
  rankingForOrganizer,
} from "@/server/repo";

export default async function OrganizerHackathonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { userId } = await auth();
  if (!userId) return null;

  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon || hackathon.organizerUserId !== userId) notFound();

  const [projectRows, rubric, judgeRows, ranking] = await Promise.all([
    listProjects(hackathon.id),
    listCriteria(hackathon.id),
    listJudges(hackathon.id),
    rankingForOrganizer(userId, slug),
  ]);

  const status = hackathonStatus(hackathon, new Date());
  const defaultRubric =
    rubric.length > 0
      ? rubric
      : [
          { name: "Craft", weightPercent: 50 },
          { name: "Impact", weightPercent: 50 },
        ];

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-xs uppercase text-muted">
          {statusLabel[status]}
        </p>
        <h1 className="text-balance text-2xl">{hackathon.name}</h1>
        <p className="text-sm text-muted">
          Pública:{" "}
          <Link href={`/h/${hackathon.slug}`} className="underline">
            /h/{hackathon.slug}
          </Link>
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link href={`/h/${slug}/submit`} className={btnPrimaryClass}>
            Subir proyecto
          </Link>
          <Link href={`/h/${slug}/judge`} className={btnClass}>
            Juzgar
          </Link>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg">Hackathon</h2>
        <ActionForm
          action={updateHackathonAction}
          className="flex flex-col gap-3"
        >
          <input type="hidden" name="slug" value={slug} />
          <Field
            required
            name="name"
            label="Nombre"
            defaultValue={hackathon.name}
          />
          <Field
            required
            name="coverImageUrl"
            type="url"
            label="Imagen (URL)"
            defaultValue={hackathon.coverImageUrl}
          />
          <Field
            required
            name="startsAt"
            type="datetime-local"
            label="Inicio"
            hint="Hora local de tu computadora. El slug público no cambia."
            defaultValue={toDateTimeLocal(hackathon.startsAt)}
          />
          <Field
            required
            name="endsAt"
            type="datetime-local"
            label="Fin"
            defaultValue={toDateTimeLocal(hackathon.endsAt)}
          />
          <FormMessage />
          <SubmitButton>Guardar hackathon</SubmitButton>
        </ActionForm>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg">Rúbrica</h2>
        {rubric.length === 0 ? (
          <p className="text-sm text-muted">
            Guarda la rúbrica para que los jueces puedan puntuar.
          </p>
        ) : null}
        <RubricEditor slug={slug} initial={defaultRubric} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg">Jueces</h2>
        <ActionForm action={addJudgeAction} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input type="hidden" name="slug" value={slug} />
            <input
              required
              name="name"
              placeholder="Nombre"
              className={fieldClass}
            />
            <SubmitButton>Añadir</SubmitButton>
          </div>
          <FormMessage />
        </ActionForm>
        {judgeRows.length === 0 ? (
          <p className="text-sm text-muted">
            Añade un juez. Recibe un Access Code para abrir juzgamiento.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {judgeRows.map((judge) => {
              const path = `/h/${slug}/judge?code=${judge.accessCode}`;
              return (
                <li key={judge.id} className="border border-line p-3 text-sm">
                  <p>{judge.name}</p>
                  <p className="font-mono text-xs text-muted">
                    Código: {judge.accessCode}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Link href={path} className="text-xs underline">
                      Abrir juzgamiento
                    </Link>
                    <CopyLink path={path} label="Copiar link" />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg">Proyectos</h2>
        {projectRows.length === 0 ? (
          <EmptyState
            title="Todavía no hay proyectos."
            actionHref={`/h/${slug}/submit`}
            actionLabel="Subir el primero"
          />
        ) : (
          projectRows.map((project) => (
            <ActionForm
              key={project.id}
              action={updateProjectAction}
              className="flex flex-col gap-2 border border-line p-3"
            >
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="projectId" value={project.id} />
              <Field
                required
                name="name"
                label="Nombre"
                defaultValue={project.name}
              />
              <Field
                required
                name="linkUrl"
                type="url"
                label="Link"
                defaultValue={project.linkUrl}
              />
              <Field
                required
                name="imageUrl"
                type="url"
                label="Imagen (URL)"
                defaultValue={project.imageUrl}
              />
              <Field
                required
                name="participantEmails"
                label="Emails"
                defaultValue={project.participantEmails.join(", ")}
              />
              <FormMessage />
              <SubmitButton className="px-3 py-1">Guardar</SubmitButton>
            </ActionForm>
          ))
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg">Ranking</h2>
        {ranking.length === 0 ? (
          <p className="text-muted">Todavía no hay proyectos que rankear.</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {ranking.map((row, index) => (
              <li key={row.project?.id} className="border border-line p-3">
                <p className="tabular-nums">
                  {index + 1}. {row.project?.name}{" "}
                  <span className="text-muted">
                    {row.average === null
                      ? "sin score"
                      : row.average.toFixed(1)}
                  </span>
                </p>
                <ul className="mt-2 text-sm text-muted">
                  {row.judges.map((judge) => (
                    <li key={judge.judgeId}>
                      {judge.judgeName}: {judge.score}
                      {judge.comment ? ` — ${judge.comment}` : ""}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
