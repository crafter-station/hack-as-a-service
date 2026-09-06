import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { listOrganizerHackathons } from "@/server/repo";

export default async function OrgHomePage() {
  const { userId } = await auth();
  if (!userId) return null;
  const hackathons = await listOrganizerHackathons(userId);

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex items-center justify-between">
        <h1 className="text-balance text-2xl">Tus hackathons</h1>
        <UserButton />
      </header>
      <Link
        href="/org/new"
        className="w-fit border border-line px-4 py-2 text-sm hover:bg-white hover:text-black"
      >
        Crear hackathon
      </Link>
      {hackathons.length === 0 ? (
        <p className="text-muted">Todavía no tienes ninguna.</p>
      ) : (
        <ul className="divide-y divide-line border border-line">
          {hackathons.map((hackathon) => (
            <li key={hackathon.id}>
              <Link
                href={`/org/h/${hackathon.slug}`}
                className="block px-4 py-3 hover:bg-white/5"
              >
                {hackathon.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
