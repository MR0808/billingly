import { prisma } from "@/lib/prisma";

export async function getWorkspaceForUser(userId: string) {
  return prisma.workspace.findFirst({
    where: { ownerUserId: userId },
    include: { settings: true },
  });
}
