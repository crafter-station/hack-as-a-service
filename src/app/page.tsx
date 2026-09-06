import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-wide text-muted">
        Hack as a Service
      </p>
      <h1 className="text-balance text-4xl font-medium">
        Crea una hackathon. Recibe proyectos. Juzga.
      </h1>
      <p className="text-pretty text-muted">
        Sin directorio. Sin cuentas para participantes. Una rúbrica con pesos,
        jueces con código de acceso, y un ranking para quien organiza.
      </p>
      <div className="flex gap-4">
        <SignedOut>
          <SignInButton>
            <button
              type="button"
              className="border border-line px-4 py-2 text-sm hover:bg-white hover:text-black"
            >
              Entrar como organizador
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <Link
            href="/org"
            className="border border-line px-4 py-2 text-sm hover:bg-white hover:text-black"
          >
            Ir a mis hackathons
          </Link>
        </SignedIn>
      </div>
    </main>
  );
}
