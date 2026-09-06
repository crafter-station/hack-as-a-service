import { notFound } from "next/navigation";

import { saveJudgingAction } from "@/server/actions";
import {
  getJudgeByCode,
  getJudgeRatings,
  listCriteria,
  listProjects,
} from "@/server/repo";

export default async function JudgePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const { slug } = await params;
  const { code } = await searchParams;

  if (!code) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-6 px-6 py-12">
        <h1 className="text-balance text-2xl">Juzgar</h1>
        <form className="flex gap-2">
          <input
            name="code"
            placeholder="Access Code"
            className="flex-1 border border-line px-3 py-2"
          />
          <button
            type="submit"
            className="border border-line px-4 py-2 text-sm hover:bg-white hover:text-black"
          >
            Entrar
          </button>
        </form>
      </main>
    );
  }

  const session = await getJudgeByCode(slug, code);
  if (!session) notFound();

  const [projectRows, rubric] = await Promise.all([
    listProjects(session.hackathon.id),
    listCriteria(session.hackathon.id),
  ]);

  const projectViews = await Promise.all(
    projectRows.map(async (project) => ({
      project,
      existing: await getJudgeRatings(session.judge.id, project.id),
    })),
  );

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-8 px-6 py-12">
      <h1 className="text-balance text-2xl">
        Hola {session.judge.name}. Juzga {session.hackathon.name}
      </h1>
      {rubric.length === 0 ? (
        <p className="text-muted">
          El organizador todavía no definió la rúbrica.
        </p>
      ) : (
        projectViews.map(({ project, existing }) => (
          <form
            key={project.id}
            action={saveJudgingAction}
            className="flex flex-col gap-3 border border-line p-4"
          >
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="accessCode" value={code} />
            <input type="hidden" name="projectId" value={project.id} />
            <a href={project.linkUrl} className="text-lg underline">
              {project.name}
            </a>
            {rubric.map((criterion) => {
              const current = existing.ratings.find(
                (rating) => rating.criterionId === criterion.id,
              )?.value;
              return (
                <label
                  key={criterion.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    {criterion.name}{" "}
                    <span className="text-muted tabular-nums">
                      {criterion.weightPercent}%
                    </span>
                  </span>
                  <input
                    type="hidden"
                    name="criterionId"
                    value={criterion.id}
                  />
                  <select
                    required
                    name="rating"
                    defaultValue={current ?? ""}
                    className="border border-line px-2 py-1"
                  >
                    <option value="">—</option>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
              );
            })}
            <textarea
              name="comment"
              placeholder="Comentario (opcional)"
              defaultValue={existing.comment}
              className="border border-line px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="w-fit border border-line px-4 py-2 text-sm hover:bg-white hover:text-black"
            >
              Guardar score
            </button>
          </form>
        ))
      )}
    </main>
  );
}
