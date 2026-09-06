export type ActionState = { error?: string; ok?: boolean } | null;

const MESSAGES: Record<string, string> = {
  "A Hackathon with this name already exists":
    "Ya existe una hackathon con ese nombre.",
  "End must be after start": "El fin debe ser después del inicio.",
  "Cover image URL is required": "La imagen de portada es obligatoria.",
  "Hackathon name must produce a slug": "El nombre no produce un slug válido.",
  "Invalid date": "La fecha no es válida.",
  "Hackathon not found": "No encontramos esa hackathon.",
  "This Hackathon is not open for Projects": "Las submissions están cerradas.",
  "Name, link, and image URL are required":
    "Nombre, link e imagen son obligatorios.",
  "A Project needs at least one participant email":
    "Agrega al menos un email de participante.",
  "Not allowed": "No tienes permiso.",
  "A Rubric needs at least one Criterion":
    "La rúbrica necesita al menos un criterio.",
  "Each Criterion needs a name": "Cada criterio necesita un nombre.",
  "Each Criterion weight must be a positive integer percent":
    "Cada peso debe ser un entero positivo.",
  "Rubric weights must sum to 100": "Los pesos deben sumar 100.",
  "Judge name is required": "El nombre del juez es obligatorio.",
  "Invalid Access Code": "Access Code inválido.",
  "This Hackathon has no Rubric yet":
    "Esta hackathon todavía no tiene rúbrica.",
  "Rate every Criterion": "Califica todos los criterios.",
  "Project not found": "No encontramos ese proyecto.",
  "Sign in required": "Inicia sesión.",
};

export function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export function userMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : "Algo salió mal.";
  if (MESSAGES[raw]) return MESSAGES[raw];
  const email = raw.match(/^Invalid participant email: (.+)$/);
  if (email) return `Email inválido: ${email[1]}`;
  return raw;
}

export async function runAction(
  work: () => Promise<ActionState | undefined>,
): Promise<ActionState> {
  try {
    const result = await work();
    return result ?? { ok: true };
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return { error: userMessage(error) };
  }
}
