import Link from "next/link";

import {
  ActionForm,
  Field,
  FormMessage,
  SubmitButton,
} from "@/components/action-form";
import { createHackathonAction } from "@/server/actions";

export default function NewHackathonPage() {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-2">
        <Link href="/org" className="text-sm text-muted hover:underline">
          ← Mis hackathons
        </Link>
        <h1 className="text-balance text-2xl">Nueva hackathon</h1>
      </div>
      <ActionForm
        action={createHackathonAction}
        className="flex flex-col gap-4"
      >
        <Field required name="name" label="Nombre" />
        <Field
          required
          name="coverImageUrl"
          type="url"
          label="Imagen (URL)"
          hint="Un link directo a la portada. Si falla, se muestra un bloque vacío."
        />
        <Field
          required
          name="startsAt"
          type="datetime-local"
          label="Inicio"
          hint="Hora local de tu computadora."
        />
        <Field
          required
          name="endsAt"
          type="datetime-local"
          label="Fin"
          hint="Las submissions se cierran después de esta fecha."
        />
        <FormMessage />
        <SubmitButton pendingLabel="Creando…">Crear</SubmitButton>
      </ActionForm>
    </main>
  );
}
