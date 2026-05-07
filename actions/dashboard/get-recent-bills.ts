"use server";

import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types/actions";
import type { BillDTO } from "@/actions/bills/_types";
import { toBillDTO } from "@/actions/bills/_dto";
import { requireWorkspace } from "@/actions/bills/_require-workspace";

export async function getRecentBillsAction(): Promise<ActionResult<BillDTO[]>> {
  const ctx = await requireWorkspace();
  if (!ctx.success) return ctx;

  const now = new Date();
  const bills = await prisma.bill.findMany({
    where: { workspaceId: ctx.data.workspace.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return { success: true, data: bills.map((b) => toBillDTO(b, [], now)) };
}

