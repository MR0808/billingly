"use server";

import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types/actions";
import type { BillDTO } from "./_types";
import { toBillDTO } from "./_dto";
import { requireWorkspace } from "./_require-workspace";

export async function listBillsAction(): Promise<ActionResult<BillDTO[]>> {
  const ctx = await requireWorkspace();
  if (!ctx.success) return ctx;

  const now = new Date();
  const bills = await prisma.bill.findMany({
    where: { workspaceId: ctx.data.workspace.id },
    orderBy: { createdAt: "desc" },
  });

  return {
    success: true,
    data: bills.map((b) => toBillDTO(b, [], now)),
  };
}

