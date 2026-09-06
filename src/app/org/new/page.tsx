import { createHackathonAction } from "@/server/actions";

export default function NewHackathonPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-8 px-6 py-12">
      <h1 className="text-balance text-2xl">Nueva hackathon</h1>
      <form action={createHackathonAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Nombre
          <input
            required
            name="name"
            className="border border-line px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Imagen (URL)
          <input
            required
            name="coverImageUrl"
            type="url"
            className="border border-line px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Inicio
          <input
            required
            name="startsAt"
            type="datetime-local"
            className="border border-line px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Fin
          <input
            required
            name="endsAt"
            type="datetime-local"
            className="border border-line px-3 py-2"
          />
        </label>
        <button
          type="submit"
          className="w-fit border border-line px-4 py-2 text-sm hover:bg-white hover:text-black"
        >
          Crear
        </button>
      </form>
    </main>
  );
}
