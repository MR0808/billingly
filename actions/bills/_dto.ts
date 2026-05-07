import type { Bill, PaymentRecord } from "@/generated/prisma/client";
import type { BillDTO, PaymentRecordDTO } from "./_types";

function toIso(d: Date | null): string | null {
  return d ? d.toISOString() : null;
}

export function toPaymentDTO(p: PaymentRecord): PaymentRecordDTO {
  return {
    id: p.id,
    amountPaid: p.amountPaid.toString(),
    paidAt: p.paidAt.toISOString(),
    method: p.method ?? null,
    note: p.note ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}

export function toBillDTO(
  bill: Bill,
  payments: PaymentRecord[],
  now: Date = new Date()
): BillDTO {
  const due = bill.dueDate;
  const isOverdue =
    bill.status === "SCHEDULED" && !!due && due.getTime() < now.getTime();
  const displayStatus = isOverdue ? "OVERDUE" : bill.status;

  return {
    id: bill.id,
    workspaceId: bill.workspaceId,
    billerName: bill.billerName ?? null,
    category: bill.category ?? null,
    amount: bill.amount ? bill.amount.toString() : null,
    currency: bill.currency,
    dueDate: toIso(bill.dueDate),
    issueDate: toIso(bill.issueDate),
    status: bill.status,
    displayStatus,
    isOverdue,
    referenceNumber: bill.referenceNumber ?? null,
    invoiceNumber: bill.invoiceNumber ?? null,
    paymentMethod: bill.paymentMethod ?? null,
    paymentInstructions: bill.paymentInstructions ?? null,
    paymentUrl: bill.paymentUrl ?? null,
    notes: bill.notes ?? null,
    isRecurring: bill.isRecurring,
    recurrenceRule: bill.recurrenceRule ?? null,
    paidAt: toIso(bill.paidAt),
    createdAt: bill.createdAt.toISOString(),
    updatedAt: bill.updatedAt.toISOString(),
    payments: payments.map(toPaymentDTO),
  };
}

