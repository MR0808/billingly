import { z } from "zod";

export const billIdSchema = z.string().cuid("Invalid bill id");

const moneyString = z
  .string()
  .min(1, "Amount is required")
  .refine((v) => !Number.isNaN(Number(v)), "Amount must be a number")
  .refine((v) => Number(v) > 0, "Amount must be greater than zero");

const dateString = z
  .string()
  .min(1, "Date is required")
  .refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date");

const optionalDateString = z
  .string()
  .optional()
  .refine((v) => !v || !Number.isNaN(Date.parse(v)), "Invalid date");

const optionalUrl = z
  .string()
  .url("Must be a valid URL")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const createBillSchema = z.object({
  billerName: z.string().min(1, "Biller name is required"),
  amount: moneyString,
  currency: z.string().default("AUD"),
  dueDate: dateString,
  issueDate: optionalDateString,
  category: z.string().optional(),
  referenceNumber: z.string().optional(),
  invoiceNumber: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentInstructions: z.string().optional(),
  paymentUrl: optionalUrl,
  notes: z.string().optional(),
  isRecurring: z
    .string()
    .optional()
    .transform((v) => v === "on"),
  recurrenceRule: z.string().optional(),
});

export const updateBillSchema = createBillSchema.extend({
  billId: billIdSchema,
});

export const markBillPaidSchema = z.object({
  billId: billIdSchema,
  amountPaid: moneyString,
  paidAt: dateString,
  method: z.string().optional(),
  note: z.string().optional(),
});

export const cancelBillSchema = z.object({
  billId: billIdSchema,
});

