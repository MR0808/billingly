"use server";

import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types/actions";
import { cancelBillSchema } from "@/lib/validation/bills";
import { requireWorkspace } from "./_require-workspace";
import { toBillDTO } from "./_dto";
import type { BillDTO } from "./_types";
import { cancelPendingRemindersForBill } from "@/lib/reminders/reminder-service";

export async function cancelBillAction(raw: unknown): Promise<ActionResult<BillDTO>> {
  const ctx = await requireWorkspace();
  if (!ctx.success) return ctx as ActionResult<BillDTO>;

  const parsed = cancelBillSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const err of parsed.error.issues) {
      const key = String(err.path[0] ?? "");
      if (key && !fieldErrors[key]) fieldErrors[key] = err.message;
    }
    return { success: false, error: "Invalid request", fieldErrors };
  }

  const bill = await prisma.bill.findFirst({
    where: { id: parsed.data.billId, workspaceId: ctx.data.workspace.id },
    include: { paymentRecords: { orderBy: { createdAt: "desc" }, take: 5 } },
  });
  if (!bill) return { success: false, error: "Bill not found" };

  const now = new Date();
  const updated = await prisma.bill.update({
    where: { id: bill.id },
    data: { status: "CANCELLED", updatedAt: now },
    include: { paymentRecords: { orderBy: { createdAt: "desc" }, take: 5 } },
  });

  await cancelPendingRemindersForBill({
    workspaceId: ctx.data.workspace.id,
    billId: bill.id,
  });

  return { success: true, data: toBillDTO(updated, updated.paymentRecords, now) };
}

