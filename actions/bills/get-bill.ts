"use server";

import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types/actions";
import { billIdSchema } from "@/lib/validation/bills";
import { requireWorkspace } from "./_require-workspace";
import { toBillDTO } from "./_dto";
import type { BillDTO } from "./_types";

export async function getBillByIdAction(billIdRaw: unknown): Promise<ActionResult<BillDTO>> {
  const ctx = await requireWorkspace();
  if (!ctx.success) return ctx as ActionResult<BillDTO>;

  const parsedId = billIdSchema.safeParse(billIdRaw);
  if (!parsedId.success) return { success: false, error: "Invalid bill id" };

  const bill = await prisma.bill.findFirst({
    where: { id: parsedId.data, workspaceId: ctx.data.workspace.id },
    include: {
      paymentRecords: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!bill) return { success: false, error: "Bill not found" };

  return { success: true, data: toBillDTO(bill, bill.paymentRecords) };
}

