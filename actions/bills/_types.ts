export type PaymentRecordDTO = {
  id: string;
  amountPaid: string;
  paidAt: string;
  method: string | null;
  note: string | null;
  createdAt: string;
};

export type BillDTO = {
  id: string;
  workspaceId: string;
  billerName: string | null;
  category: string | null;
  amount: string | null;
  currency: string;
  dueDate: string | null;
  issueDate: string | null;
  status: "DRAFT" | "SCHEDULED" | "PAID" | "OVERDUE" | "CANCELLED";
  displayStatus: "DRAFT" | "SCHEDULED" | "PAID" | "OVERDUE" | "CANCELLED";
  isOverdue: boolean;
  referenceNumber: string | null;
  invoiceNumber: string | null;
  paymentMethod: string | null;
  paymentInstructions: string | null;
  paymentUrl: string | null;
  notes: string | null;
  isRecurring: boolean;
  recurrenceRule: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  payments: PaymentRecordDTO[];
};

