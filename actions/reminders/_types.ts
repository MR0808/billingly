export type ReminderListItemDTO = {
  id: string;
  status: "PENDING" | "SENT" | "FAILED" | "CANCELLED";
  remindAt: string;
  sentAt: string | null;
  errorMessage: string | null;
  channel: "EMAIL";
  bill: {
    id: string;
    billerName: string | null;
    amount: string | null;
    currency: string;
    dueDate: string | null;
  };
  remindAtDisplay: string;
};

