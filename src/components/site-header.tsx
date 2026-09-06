"use client";

import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="font-mono text-xs uppercase">
          Hack as a Service
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/org" className="hover:underline">
            Organizar
          </Link>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </nav>
      </div>
    </header>
  );
}
