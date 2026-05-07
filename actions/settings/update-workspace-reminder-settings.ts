"use server";

import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types/actions";
import { requireWorkspace } from "@/actions/bills/_require-workspace";
import { syncBillRemindersForScheduledBill } from "@/lib/reminders/reminder-service";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const settingsSchema = z.object({
  defaultReminderDays: z
    .string()
    .min(1, "Please enter at least one offset")
    .transform((s) => {
      const parts = s.split(",").map((p) => p.trim());
      const nums = parts
        .filter((p) => p.length > 0)
        .map((p) => Number(p))
        .filter((n) => Number.isFinite(n));
      return nums;
    })
    .refine((arr) => arr.length > 0, "Please enter at least one offset")
    .refine((arr) => arr.every((n) => Number.isInteger(n) && n >= 0), "Offsets must be whole numbers >= 0"),
  reminderEmailEnabled: z.preprocess((v) => {
    // Checkbox unchecked sends nothing.
    if (v === undefined || v === null) return false;
    return v === "on" || v === "true" || v === true;
  }, z.boolean()),
});

export type WorkspaceReminderSettingsFormState = ActionResult<null>;

export async function updateWorkspaceReminderSettingsAction(
  raw: unknown
): Promise<ActionResult<null>> {
  const ctx = await requireWorkspace();
  if (!ctx.success) return ctx;

  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, error: "Invalid reminder settings", fieldErrors };
  }

  const { defaultReminderDays, reminderEmailEnabled } = parsed.data;

  const now = new Date();

  await prisma.workspaceSettings.upsert({
    where: { workspaceId: ctx.data.workspace.id },
    create: {
      workspaceId: ctx.data.workspace.id,
      defaultReminderDays,
      reminderEmailEnabled,
      createdAt: now,
      updatedAt: now,
    },
    update: {
      defaultReminderDays,
      reminderEmailEnabled,
      updatedAt: now,
    },
  });

  if (!reminderEmailEnabled) {
    await prisma.reminder.updateMany({
      where: {
        workspaceId: ctx.data.workspace.id,
        status: "PENDING",
      },
      data: {
        status: "CANCELLED",
        updatedAt: now,
      },
    });

    revalidatePath("/app/reminders");
    return { success: true, data: null };
  }

  const scheduledBills = await prisma.bill.findMany({
    where: {
      workspaceId: ctx.data.workspace.id,
      status: "SCHEDULED",
      dueDate: { not: null },
    },
    select: { id: true },
    take: 200,
  });

  for (const b of scheduledBills) {
    await syncBillRemindersForScheduledBill({
      workspaceId: ctx.data.workspace.id,
      billId: b.id,
    });
  }

  revalidatePath("/app/reminders");
  return { success: true, data: null };
}

export async function updateWorkspaceReminderSettingsFormAction(
  _prevState: WorkspaceReminderSettingsFormState,
  formData: FormData
): Promise<WorkspaceReminderSettingsFormState> {
  "use server";
  const raw = {
    defaultReminderDays: formData.get("defaultReminderDays"),
    reminderEmailEnabled: formData.get("reminderEmailEnabled"),
  };

  return updateWorkspaceReminderSettingsAction(raw);
}

