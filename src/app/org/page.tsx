import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { hackathonStatus } from "@/domain";
import { btnPrimaryClass, statusLabel } from "@/lib/ui";
import { listOrganizerHackathons } from "@/server/repo";

export default async function OrgHomePage() {
  const { userId } = await auth();
  if (!userId) return null;
  const hackathons = await listOrganizerHackathons(userId);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-balance text-2xl">Tus hackathons</h1>
        {hackathons.length > 0 ? (
          <Link href="/org/new" className={btnPrimaryClass}>
            Crear hackathon
          </Link>
        ) : null}
      </header>
      {hackathons.length === 0 ? (
        <EmptyState
          title="Todavía no tienes ninguna. Crea la primera y comparte el link de submit."
          actionHref="/org/new"
          actionLabel="Crear hackathon"
        />
      ) : (
        <ul className="divide-y divide-line border border-line">
          {hackathons.map((hackathon) => (
            <li key={hackathon.id}>
              <Link
                href={`/org/h/${hackathon.slug}`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-white/5"
              >
                <span>{hackathon.name}</span>
                <span className="font-mono text-xs uppercase text-muted">
                  {statusLabel[hackathonStatus(hackathon, new Date())]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
