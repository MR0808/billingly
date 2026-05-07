"use server";

import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types/actions";
import { updateBillSchema } from "@/lib/validation/bills";
import { parseAmountToDecimalString } from "@/lib/bills/money";
import { normalizeCheckbox, normalizeDateInput, normalizeOptionalString } from "@/lib/utils/normalize";
import { requireWorkspace } from "./_require-workspace";
import { toBillDTO } from "./_dto";
import type { BillDTO } from "./_types";
import { syncBillRemindersForScheduledBill } from "@/lib/reminders/reminder-service";

export async function updateBillAction(raw: unknown): Promise<ActionResult<BillDTO>> {
  const ctx = await requireWorkspace();
  if (!ctx.success) return ctx as ActionResult<BillDTO>;

  const parsed = updateBillSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const err of parsed.error.issues) {
      const key = String(err.path[0] ?? "");
      if (key && !fieldErrors[key]) fieldErrors[key] = err.message;
    }
    return { success: false, error: "Invalid bill data", fieldErrors };
  }

  const { billId, ...body } = parsed.data;

  const existing = await prisma.bill.findFirst({
    where: { id: billId, workspaceId: ctx.data.workspace.id },
  });
  if (!existing) return { success: false, error: "Bill not found" };

  const shouldSyncReminders = existing.status === "SCHEDULED";

  const dueDate = normalizeDateInput(body.dueDate);
  if (!dueDate) {
    return { success: false, error: "Invalid bill data", fieldErrors: { dueDate: "Invalid due date" } };
  }
  const issueDate = normalizeDateInput(body.issueDate);
  const now = new Date();

  const updated = await prisma.bill.update({
    where: { id: existing.id },
    data: {
      billerName: body.billerName.trim(),
      amount: parseAmountToDecimalString(body.amount),
      currency: (body.currency || "AUD").trim() || "AUD",
      dueDate,
      issueDate,
      category: normalizeOptionalString(body.category),
      referenceNumber: normalizeOptionalString(body.referenceNumber),
      invoiceNumber: normalizeOptionalString(body.invoiceNumber),
      paymentMethod: normalizeOptionalString(body.paymentMethod),
      paymentInstructions: normalizeOptionalString(body.paymentInstructions),
      paymentUrl: normalizeOptionalString(body.paymentUrl),
      notes: normalizeOptionalString(body.notes),
      isRecurring: normalizeCheckbox(body.isRecurring),
      recurrenceRule: normalizeOptionalString(body.recurrenceRule),
      updatedAt: now,
    },
    include: { paymentRecords: { orderBy: { createdAt: "desc" }, take: 5 } },
  });

  if (shouldSyncReminders) {
    await syncBillRemindersForScheduledBill({
      workspaceId: ctx.data.workspace.id,
      billId: existing.id,
    });
  }

  return { success: true, data: toBillDTO(updated, updated.paymentRecords, now) };
}

