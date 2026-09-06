"use client";

import type { ComponentProps, ReactNode } from "react";
import { createContext, useActionState, useContext } from "react";
import { useFormStatus } from "react-dom";

import type { ActionState } from "@/lib/errors";
import { btnPrimaryClass, fieldClass } from "@/lib/ui";
import { cn } from "@/lib/utils";

const FormStateContext = createContext<ActionState>(null);

export function ActionForm({
  action,
  className,
  children,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  className?: string;
  children: ReactNode;
}) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className={className}>
      <FormStateContext.Provider value={state}>
        {children}
      </FormStateContext.Provider>
    </form>
  );
}

export function SubmitButton({
  children,
  className,
  pendingLabel = "Guardando…",
}: {
  children: ReactNode;
  className?: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(btnPrimaryClass, className)}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

export function Field({
  label,
  hint,
  className,
  ...props
}: ComponentProps<"input"> & { label: string; hint?: string }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label}
      <input {...props} className={cn(fieldClass, className)} />
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function FormMessage() {
  const state = useContext(FormStateContext);
  if (state?.error) {
    return (
      <p role="alert" className="text-sm text-red-400">
        {state.error}
      </p>
    );
  }
  if (state?.ok) {
    return (
      <p role="status" className="text-sm text-muted">
        Guardado.
      </p>
    );
  }
  return null;
}
