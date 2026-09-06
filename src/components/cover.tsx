"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

export function Cover({
  src,
  alt = "",
  className,
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn("aspect-video w-full bg-white/5", className)}
        aria-hidden
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={cn(
        "aspect-video w-full object-cover outline outline-white/10",
        className,
      )}
    />
  );
}
