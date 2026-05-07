"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types/actions";
import type { Workspace } from "@/generated/prisma/client";

export type WorkspaceContext = {
  userId: string;
  workspace: Workspace;
};

export async function requireWorkspace(): Promise<ActionResult<WorkspaceContext>> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const workspace = await prisma.workspace.findFirst({
    where: { ownerUserId: session.user.id },
  });

  if (!workspace) return { success: false, error: "Workspace not found" };

  return {
    success: true,
    data: { userId: session.user.id, workspace },
  };
}

