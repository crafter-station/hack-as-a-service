import { describe, expect, test } from "vitest";

import { userMessage } from "./errors";

describe("userMessage", () => {
  test("maps domain errors to Spanish", () => {
    expect(userMessage(new Error("Rubric weights must sum to 100"))).toBe(
      "Los pesos deben sumar 100.",
    );
  });

  test("maps an invalid participant email", () => {
    expect(userMessage(new Error("Invalid participant email: nopes"))).toBe(
      "Email inválido: nopes",
    );
  });
});
