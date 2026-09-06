"use client";

import { useState } from "react";

import { btnClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

export function CopyLink({
  path,
  label = "Copiar link",
}: {
  path: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className={cn(btnClass, "px-3 py-1 text-xs")}
      onClick={async () => {
        await navigator.clipboard.writeText(`${window.location.origin}${path}`);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? "Copiado" : label}
    </button>
  );
}
