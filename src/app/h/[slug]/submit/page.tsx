import { notFound } from "next/navigation";

import { canSubmit } from "@/domain";
import { submitProjectAction } from "@/server/actions";
import { getHackathonBySlug } from "@/server/repo";

export default async function SubmitProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) notFound();
  if (!canSubmit(hackathon, new Date())) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16 text-muted">
        Esta hackathon no está abierta.
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-8 px-6 py-12">
      <h1 className="text-balance text-2xl">Subir proyecto</h1>
      <form action={submitProjectAction} className="flex flex-col gap-4">
        <input type="hidden" name="slug" value={slug} />
        <label className="flex flex-col gap-1 text-sm">
          Nombre
          <input
            required
            name="name"
            className="border border-line px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Link
          <input
            required
            name="linkUrl"
            type="url"
            className="border border-line px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Imagen (URL)
          <input
            required
            name="imageUrl"
            type="url"
            className="border border-line px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Emails de participantes
          <input
            required
            name="participantEmails"
            placeholder="ana@x.com, bob@x.com"
            className="border border-line px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="w-fit border border-line px-4 py-2 text-sm hover:bg-white hover:text-black"
        >
          Enviar
        </button>
      </form>
    </main>
  );
}
