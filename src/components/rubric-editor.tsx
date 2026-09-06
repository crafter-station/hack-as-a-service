"use client";

import { useState } from "react";

import { fieldClass } from "@/lib/ui";
import { cn } from "@/lib/utils";
import { saveRubricAction } from "@/server/actions";

import { ActionForm, FormMessage, SubmitButton } from "./action-form";

type Row = { key: string; name: string; weightPercent: number };

export function RubricEditor({
  slug,
  initial,
}: {
  slug: string;
  initial: Array<{ name: string; weightPercent: number }>;
}) {
  const [rows, setRows] = useState<Row[]>(
    initial.map((row, index) => ({
      key: `${row.name}-${index}`,
      name: row.name,
      weightPercent: row.weightPercent,
    })),
  );

  const total = rows.reduce(
    (sum, row) => sum + (Number(row.weightPercent) || 0),
    0,
  );

  return (
    <ActionForm action={saveRubricAction} className="flex flex-col gap-3">
      <input type="hidden" name="slug" value={slug} />
      {rows.map((row, index) => (
        <div key={row.key} className="grid grid-cols-[1fr_5rem_auto] gap-2">
          <input
            required
            name="criterionName"
            defaultValue={row.name}
            placeholder="Criterio"
            className={fieldClass}
          />
          <input
            required
            name="weightPercent"
            type="number"
            min={1}
            max={100}
            defaultValue={row.weightPercent}
            onChange={(event) => {
              const next = [...rows];
              next[index] = {
                ...row,
                weightPercent: Number(event.target.value),
              };
              setRows(next);
            }}
            className={cn(fieldClass, "tabular-nums")}
          />
          <button
            type="button"
            aria-label={`Quitar ${row.name || "criterio"}`}
            disabled={rows.length === 1}
            onClick={() => setRows(rows.filter((_, item) => item !== index))}
            className="border border-line px-3 text-sm text-muted hover:text-foreground disabled:opacity-40"
          >
            Quitar
          </button>
        </div>
      ))}
      <p
        className={cn(
          "text-sm tabular-nums",
          total === 100 ? "text-muted" : "text-red-400",
        )}
      >
        Total: {total}%
      </p>
      <FormMessage />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            setRows([
              ...rows,
              {
                key: crypto.randomUUID(),
                name: "",
                weightPercent: 1,
              },
            ])
          }
          className="border border-line px-4 py-2 text-sm hover:bg-white hover:text-black"
        >
          Añadir criterio
        </button>
        <SubmitButton>Guardar rúbrica</SubmitButton>
      </div>
    </ActionForm>
  );
}
