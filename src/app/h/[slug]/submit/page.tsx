import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ActionForm,
  Field,
  FormMessage,
  SubmitButton,
} from "@/components/action-form";
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
      <main className="mx-auto flex max-w-xl flex-col gap-4 px-6 py-16">
        <p className="text-pretty text-muted">
          Esta hackathon no está abierta.
        </p>
        <Link href={`/h/${slug}`} className="text-sm underline">
          Volver
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <Link
          href={`/h/${slug}`}
          className="text-sm text-muted hover:underline"
        >
          ← {hackathon.name}
        </Link>
        <h1 className="text-balance text-2xl">Subir proyecto</h1>
      </div>
      <ActionForm action={submitProjectAction} className="flex flex-col gap-4">
        <input type="hidden" name="slug" value={slug} />
        <Field required name="name" label="Nombre" />
        <Field required name="linkUrl" type="url" label="Link" />
        <Field
          required
          name="imageUrl"
          type="url"
          label="Imagen (URL)"
          hint="Un link directo a una imagen."
        />
        <Field
          required
          name="participantEmails"
          label="Emails de participantes"
          placeholder="ana@x.com, bob@x.com"
        />
        <FormMessage />
        <SubmitButton pendingLabel="Enviando…">Enviar</SubmitButton>
      </ActionForm>
    </main>
  );
}
