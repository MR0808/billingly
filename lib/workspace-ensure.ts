import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import type { Prisma } from "../generated/prisma/client";

export type WorkspaceWithSettings = Prisma.WorkspaceGetPayload<{
  include: { settings: true };
}>;

export async function ensureWorkspaceForUser(
  userId: string,
  userName: string
): Promise<WorkspaceWithSettings> {
  let workspace: WorkspaceWithSettings | null =
    await prisma.workspace.findFirst({
      where: { ownerUserId: userId },
      include: { settings: true },
    });

  if (!workspace) {
    const baseSlug =
      userName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "") || "workspace";
    const slug = `${baseSlug}-${nanoid(6)}`;

    const now = new Date();
    workspace = (await prisma.workspace.create({
      data: {
        name: `${userName}'s Workspace`,
        slug,
        ownerUserId: userId,
        timezone: "Australia/Melbourne",
        createdAt: now,
        updatedAt: now,
        settings: {
          create: {
            defaultReminderDays: [7, 1, 0],
            reminderEmailEnabled: true,
            createdAt: now,
            updatedAt: now,
          },
        },
      },
      include: { settings: true },
    })) as WorkspaceWithSettings;
  }

  return workspace;
}
