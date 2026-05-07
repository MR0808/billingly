"use server";

import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types/actions";
import { markBillPaidSchema } from "@/lib/validation/bills";
import { parseAmountToDecimalString } from "@/lib/bills/money";
import { normalizeDateInput, normalizeOptionalString } from "@/lib/utils/normalize";
import { requireWorkspace } from "./_require-workspace";
import { toBillDTO } from "./_dto";
import type { BillDTO } from "./_types";
import { cancelPendingRemindersForBill } from "@/lib/reminders/reminder-service";

export async function markBillPaidAction(raw: unknown): Promise<ActionResult<BillDTO>> {
  const ctx = await requireWorkspace();
  if (!ctx.success) return ctx as ActionResult<BillDTO>;

  const parsed = markBillPaidSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const err of parsed.error.issues) {
      const key = String(err.path[0] ?? "");
      if (key && !fieldErrors[key]) fieldErrors[key] = err.message;
    }
    return { success: false, error: "Invalid payment data", fieldErrors };
  }

  const { billId, amountPaid, paidAt, method, note } = parsed.data;

  const bill = await prisma.bill.findFirst({
    where: { id: billId, workspaceId: ctx.data.workspace.id },
  });
  if (!bill) return { success: false, error: "Bill not found" };

  const paidAtDate = normalizeDateInput(paidAt);
  if (!paidAtDate) {
    return { success: false, error: "Invalid payment data", fieldErrors: { paidAt: "Invalid paid date" } };
  }

  const now = new Date();

  await prisma.paymentRecord.create({
    data: {
      billId: bill.id,
      amountPaid: parseAmountToDecimalString(amountPaid),
      paidAt: paidAtDate,
      method: normalizeOptionalString(method),
      note: normalizeOptionalString(note),
      createdAt: now,
    },
  });

  const updated = await prisma.bill.update({
    where: { id: bill.id },
    data: {
      status: "PAID",
      paidAt: paidAtDate,
      updatedAt: now,
    },
    include: { paymentRecords: { orderBy: { createdAt: "desc" }, take: 5 } },
  });

  await cancelPendingRemindersForBill({
    workspaceId: ctx.data.workspace.id,
    billId: bill.id,
  });

  return { success: true, data: toBillDTO(updated, updated.paymentRecords, now) };
}

