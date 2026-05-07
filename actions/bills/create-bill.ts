"use server";

import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types/actions";
import { createBillSchema } from "@/lib/validation/bills";
import { parseAmountToDecimalString } from "@/lib/bills/money";
import { normalizeCheckbox, normalizeDateInput, normalizeOptionalString } from "@/lib/utils/normalize";
import { requireWorkspace } from "./_require-workspace";
import { toBillDTO } from "./_dto";
import type { BillDTO } from "./_types";
import { syncBillRemindersForScheduledBill } from "@/lib/reminders/reminder-service";

export async function createBillAction(raw: unknown): Promise<ActionResult<BillDTO>> {
  const ctx = await requireWorkspace();
  if (!ctx.success) return ctx as ActionResult<BillDTO>;

  const parsed = createBillSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const err of parsed.error.issues) {
      const key = String(err.path[0] ?? "");
      if (key && !fieldErrors[key]) fieldErrors[key] = err.message;
    }
    return { success: false, error: "Invalid bill data", fieldErrors };
  }

  const body = parsed.data;
  const now = new Date();

  const dueDate = normalizeDateInput(body.dueDate);
  if (!dueDate) {
    return { success: false, error: "Invalid bill data", fieldErrors: { dueDate: "Invalid due date" } };
  }

  const issueDate = normalizeDateInput(body.issueDate);

  const bill = await prisma.bill.create({
    data: {
      workspaceId: ctx.data.workspace.id,
      createdByUserId: ctx.data.userId,
      sourceType: "MANUAL",
      status: "SCHEDULED",
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
      createdAt: now,
      updatedAt: now,
    },
  });

  await syncBillRemindersForScheduledBill({
    workspaceId: ctx.data.workspace.id,
    billId: bill.id,
  });

  return { success: true, data: toBillDTO(bill, [], now) };
}

