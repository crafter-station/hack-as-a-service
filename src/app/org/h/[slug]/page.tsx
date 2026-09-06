import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { notFound } from "next/navigation";

import { hackathonStatus } from "@/domain";
import {
  addJudgeAction,
  saveRubricAction,
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
          { id: "new-1", name: "Craft", weightPercent: 50 },
          { id: "new-2", name: "Impact", weightPercent: 50 },
        ];

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-10 px-6 py-12">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-xs uppercase text-muted">{status}</p>
        <h1 className="text-balance text-2xl">{hackathon.name}</h1>
        <p className="text-sm text-muted">
          Pública:{" "}
          <Link href={`/h/${hackathon.slug}`} className="underline">
            /h/{hackathon.slug}
          </Link>
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link
            href={`/h/${slug}/submit`}
            className="border border-line px-4 py-2 text-sm hover:bg-white hover:text-black"
          >
            Subir proyecto
          </Link>
          <Link
            href={`/h/${slug}/judge`}
            className="border border-line px-4 py-2 text-sm hover:bg-white hover:text-black"
          >
            Juzgar
          </Link>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg">Rúbrica</h2>
        <form action={saveRubricAction} className="flex flex-col gap-3">
          <input type="hidden" name="slug" value={slug} />
          {defaultRubric.map((criterion) => (
            <div key={criterion.id} className="grid grid-cols-[1fr_5rem] gap-2">
              <input
                required
                name="criterionName"
                defaultValue={criterion.name}
                className="border border-line px-3 py-2 text-sm"
              />
              <input
                required
                name="weightPercent"
                type="number"
                min={1}
                max={100}
                defaultValue={criterion.weightPercent}
                className="border border-line px-3 py-2 text-sm tabular-nums"
              />
            </div>
          ))}
          <button
            type="submit"
            className="w-fit border border-line px-4 py-2 text-sm hover:bg-white hover:text-black"
          >
            Guardar rúbrica
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg">Jueces</h2>
        <form action={addJudgeAction} className="flex gap-2">
          <input type="hidden" name="slug" value={slug} />
          <input
            required
            name="name"
            placeholder="Nombre"
            className="flex-1 border border-line px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="border border-line px-4 py-2 text-sm hover:bg-white hover:text-black"
          >
            Añadir
          </button>
        </form>
        <ul className="flex flex-col gap-3">
          {judgeRows.map((judge) => (
            <li key={judge.id} className="border border-line p-3 text-sm">
              <p>{judge.name}</p>
              <p className="font-mono text-xs text-muted">
                Código: {judge.accessCode}
              </p>
              <Link
                href={`/h/${slug}/judge?code=${judge.accessCode}`}
                className="text-xs underline"
              >
                Abrir juzgamiento
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg">Proyectos</h2>
        {projectRows.length === 0 ? (
          <p className="text-muted">Todavía no hay proyectos.</p>
        ) : (
          projectRows.map((project) => (
            <form
              key={project.id}
              action={updateProjectAction}
              className="flex flex-col gap-2 border border-line p-3"
            >
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="projectId" value={project.id} />
              <input
                required
                name="name"
                defaultValue={project.name}
                className="border border-line px-3 py-2 text-sm"
              />
              <input
                required
                name="linkUrl"
                type="url"
                defaultValue={project.linkUrl}
                className="border border-line px-3 py-2 text-sm"
              />
              <input
                required
                name="imageUrl"
                type="url"
                defaultValue={project.imageUrl}
                className="border border-line px-3 py-2 text-sm"
              />
              <input
                required
                name="participantEmails"
                defaultValue={project.participantEmails.join(", ")}
                className="border border-line px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="w-fit border border-line px-3 py-1 text-sm hover:bg-white hover:text-black"
              >
                Guardar
              </button>
            </form>
          ))
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg">Ranking</h2>
        <ol className="flex flex-col gap-3">
          {ranking.map((row, index) => (
            <li key={row.project?.id} className="border border-line p-3">
              <p className="tabular-nums">
                {index + 1}. {row.project?.name}{" "}
                <span className="text-muted">
                  {row.average === null ? "sin score" : row.average.toFixed(1)}
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
      </section>
    </main>
  );
}
