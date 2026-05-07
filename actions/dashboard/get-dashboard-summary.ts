"use server";

import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types/actions";
import type { DashboardSummaryDTO } from "./_types";
import { requireWorkspace } from "@/actions/bills/_require-workspace";

export async function getDashboardSummaryAction(): Promise<ActionResult<DashboardSummaryDTO>> {
  const ctx = await requireWorkspace();
  if (!ctx.success) return ctx as ActionResult<DashboardSummaryDTO>;

  const workspaceId = ctx.data.workspace.id;
  const now = new Date();
  const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [totalBills, scheduledBills, paidBills, overdueBills, dueSoonBills] =
    await Promise.all([
      prisma.bill.count({ where: { workspaceId } }),
      prisma.bill.count({ where: { workspaceId, status: "SCHEDULED" } }),
      prisma.bill.count({ where: { workspaceId, status: "PAID" } }),
      prisma.bill.count({
        where: { workspaceId, status: "SCHEDULED", dueDate: { lt: now } },
      }),
      prisma.bill.count({
        where: {
          workspaceId,
          status: "SCHEDULED",
          dueDate: { gte: now, lte: soon },
        },
      }),
    ]);

  return {
    success: true,
    data: {
      totalBills,
      scheduledBills,
      paidBills,
      overdueBills,
      dueSoonBills,
    },
  };
}

