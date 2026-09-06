import type { HackathonStatus } from "@/domain";

export const fieldClass =
  "w-full border border-line bg-[#111] px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

export const btnClass =
  "inline-flex w-fit items-center justify-center border border-line px-4 py-2 text-sm transition-transform duration-150 ease-out hover:bg-white hover:text-black active:scale-96 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:pointer-events-none disabled:opacity-50";

export const btnPrimaryClass =
  "inline-flex w-fit items-center justify-center border border-white bg-white px-4 py-2 text-sm text-black transition-transform duration-150 ease-out hover:bg-transparent hover:text-foreground active:scale-96 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:pointer-events-none disabled:opacity-50";

export const statusLabel: Record<HackathonStatus, string> = {
  upcoming: "Próxima",
  open: "Abierta",
  closed: "Cerrada",
};
