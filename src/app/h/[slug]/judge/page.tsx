import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ActionForm,
  FormMessage,
  SubmitButton,
} from "@/components/action-form";
import { EmptyState } from "@/components/empty-state";
import { btnPrimaryClass, fieldClass } from "@/lib/ui";
import { saveJudgingAction } from "@/server/actions";
import {
  getHackathonBySlug,
  getJudgeByCode,
  getJudgeRatings,
  listCriteria,
  listProjects,
} from "@/server/repo";

function JudgeGate({
  slug,
  name,
  error,
  defaultCode,
}: {
  slug: string;
  name: string;
  error?: string;
  defaultCode?: string;
}) {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-6 py-12">
      <div className="flex flex-col gap-2">
        <Link
          href={`/h/${slug}`}
          className="text-sm text-muted hover:underline"
        >
          ← {name}
        </Link>
        <h1 className="text-balance text-2xl">Juzgar</h1>
        <p className="text-pretty text-sm text-muted">
          Pega el Access Code que te envió el organizador.
        </p>
      </div>
      <form className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Access Code
          <input
            name="code"
            placeholder="Access Code"
            defaultValue={defaultCode}
            className={fieldClass}
            autoComplete="off"
          />
        </label>
        {error ? (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        ) : null}
        <button type="submit" className={btnPrimaryClass}>
          Entrar
        </button>
      </form>
    </main>
  );
}

export default async function JudgePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const { slug } = await params;
  const { code } = await searchParams;
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) notFound();

  if (!code) {
    return <JudgeGate slug={slug} name={hackathon.name} />;
  }

  const session = await getJudgeByCode(slug, code);
  if (!session) {
    return (
      <JudgeGate
        slug={slug}
        name={hackathon.name}
        defaultCode={code}
        error="Access Code inválido."
      />
    );
  }

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
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <Link
          href={`/h/${slug}`}
          className="text-sm text-muted hover:underline"
        >
          ← {session.hackathon.name}
        </Link>
        <h1 className="text-balance text-2xl">
          Hola {session.judge.name}. Juzga {session.hackathon.name}
        </h1>
      </div>
      {rubric.length === 0 ? (
        <p className="text-pretty text-muted">
          El organizador todavía no definió la rúbrica.
        </p>
      ) : projectViews.length === 0 ? (
        <EmptyState title="Todavía no hay proyectos que juzgar." />
      ) : (
        projectViews.map(({ project, existing }) => (
          <ActionForm
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
              className={`${fieldClass} min-h-20`}
            />
            <FormMessage />
            <SubmitButton>Guardar score</SubmitButton>
          </ActionForm>
        ))
      )}
    </main>
  );
}
