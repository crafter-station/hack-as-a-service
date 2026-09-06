import Link from "next/link";

import { btnPrimaryClass } from "@/lib/ui";

export function EmptyState({
  title,
  actionHref,
  actionLabel,
}: {
  title: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-start gap-3 border border-line px-4 py-8">
      <p className="text-pretty text-muted">{title}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className={btnPrimaryClass}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
