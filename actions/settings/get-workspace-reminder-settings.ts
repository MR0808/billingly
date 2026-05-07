"use server";

import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types/actions";
import type { WorkspaceReminderSettingsDTO } from "./_types";
import { requireWorkspace } from "@/actions/bills/_require-workspace";

export async function getWorkspaceReminderSettingsAction(): Promise<ActionResult<WorkspaceReminderSettingsDTO>> {
  const ctx = await requireWorkspace();
  if (!ctx.success) return ctx;

  const settings = await prisma.workspaceSettings.findUnique({
    where: { workspaceId: ctx.data.workspace.id },
  });

  const defaultReminderDays = settings?.defaultReminderDays ?? [7, 1, 0];
  const reminderEmailEnabled = settings?.reminderEmailEnabled ?? true;

  return {
    success: true,
    data: {
      defaultReminderDays,
      reminderEmailEnabled,
    },
  };
}

