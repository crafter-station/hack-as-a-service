import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

import { btnPrimaryClass } from "@/lib/ui";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <p className="font-mono text-xs uppercase text-muted">
        Hack as a Service
      </p>
      <h1 className="text-balance text-4xl font-medium">
        Crea una hackathon. Recibe proyectos. Juzga.
      </h1>
      <p className="text-pretty max-w-xl text-muted">
        Sin directorio. Sin cuentas para participantes. Una rúbrica con pesos,
        jueces con Access Code, y un ranking para quien organiza.
      </p>
      <div className="flex gap-4">
        <SignedOut>
          <Link href="/sign-in" className={btnPrimaryClass}>
            Entrar como organizador
          </Link>
        </SignedOut>
        <SignedIn>
          <Link href="/org" className={btnPrimaryClass}>
            Ir a mis hackathons
          </Link>
        </SignedIn>
      </div>
    </main>
  );
}
