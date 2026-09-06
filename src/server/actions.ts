"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { type ActionState, runAction } from "@/lib/errors";
import { parseDateTimeLocal } from "@/lib/utils";
import {
  addJudge,
  createHackathon,
  saveJudging,
  saveRubric,
  submitProject,
  updateProject,
} from "./repo";

function requireUserId() {
  return auth().then(({ userId }) => {
    if (!userId) throw new Error("Sign in required");
    return userId;
  });
}

export async function createHackathonAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runAction(async () => {
    const userId = await requireUserId();
    const hackathon = await createHackathon({
      organizerUserId: userId,
      name: String(formData.get("name") ?? ""),
      coverImageUrl: String(formData.get("coverImageUrl") ?? ""),
      startsAt: parseDateTimeLocal(String(formData.get("startsAt") ?? "")),
      endsAt: parseDateTimeLocal(String(formData.get("endsAt") ?? "")),
    });
    redirect(`/org/h/${hackathon.slug}`);
  });
}

export async function submitProjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runAction(async () => {
    const slug = String(formData.get("slug") ?? "");
    await submitProject({
      slug,
      name: String(formData.get("name") ?? ""),
      linkUrl: String(formData.get("linkUrl") ?? ""),
      imageUrl: String(formData.get("imageUrl") ?? ""),
      participantEmails: String(formData.get("participantEmails") ?? ""),
    });
    revalidatePath(`/h/${slug}`);
    redirect(`/h/${slug}?submitted=1`);
  });
}

export async function updateProjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runAction(async () => {
    const userId = await requireUserId();
    const slug = String(formData.get("slug") ?? "");
    await updateProject({
      organizerUserId: userId,
      projectId: String(formData.get("projectId") ?? ""),
      name: String(formData.get("name") ?? ""),
      linkUrl: String(formData.get("linkUrl") ?? ""),
      imageUrl: String(formData.get("imageUrl") ?? ""),
      participantEmails: String(formData.get("participantEmails") ?? ""),
    });
    revalidatePath(`/org/h/${slug}`);
    return undefined;
  });
}

export async function saveRubricAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runAction(async () => {
    const userId = await requireUserId();
    const slug = String(formData.get("slug") ?? "");
    const names = formData.getAll("criterionName").map(String);
    const weights = formData
      .getAll("weightPercent")
      .map((value) => Number(value));
    await saveRubric({
      organizerUserId: userId,
      slug,
      items: names.map((name, index) => ({
        name,
        weightPercent: weights[index] ?? 0,
      })),
    });
    revalidatePath(`/org/h/${slug}`);
    return undefined;
  });
}

export async function addJudgeAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runAction(async () => {
    const userId = await requireUserId();
    const slug = String(formData.get("slug") ?? "");
    await addJudge({
      organizerUserId: userId,
      slug,
      name: String(formData.get("name") ?? ""),
    });
    revalidatePath(`/org/h/${slug}`);
    return undefined;
  });
}

export async function saveJudgingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return runAction(async () => {
    const slug = String(formData.get("slug") ?? "");
    const accessCode = String(formData.get("accessCode") ?? "");
    const projectId = String(formData.get("projectId") ?? "");
    const criterionIds = formData.getAll("criterionId").map(String);
    const values = formData.getAll("rating").map((value) => Number(value));
    await saveJudging({
      slug,
      accessCode,
      projectId,
      ratings: criterionIds.map((criterionId, index) => ({
        criterionId,
        value: values[index] ?? 0,
      })),
      comment: String(formData.get("comment") ?? ""),
    });
    revalidatePath(`/h/${slug}/judge`);
    return undefined;
  });
}
