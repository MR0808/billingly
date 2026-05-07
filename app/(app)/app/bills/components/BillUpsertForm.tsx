"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/lib/types/actions";

type BillUpsertFields = {
  billId?: string;
  billerName: string;
  amount: string;
  currency: string;
  dueDate: string;
  issueDate: string;
  category: string;
  referenceNumber: string;
  invoiceNumber: string;
  paymentMethod: string;
  paymentInstructions: string;
  paymentUrl: string;
  notes: string;
  isRecurring: boolean;
  recurrenceRule: string;
};

type UpsertState = ActionResult<null>;

const initialState: UpsertState = { success: false, error: "", fieldErrors: {} };

export function BillUpsertForm({
  mode,
  defaultValues,
  action,
  submitLabel,
}: {
  mode: "create" | "edit";
  defaultValues: BillUpsertFields;
  action: (prevState: UpsertState, formData: FormData) => Promise<UpsertState>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const fe = state.success ? {} : state.fieldErrors ?? {};
  const showFormError = !state.success && state.error;

  return (
    <form action={formAction} className="space-y-6">
      {mode === "edit" && defaultValues.billId ? (
        <input type="hidden" name="billId" value={defaultValues.billId} />
      ) : null}

      {showFormError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Basics</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Biller name *"
            name="billerName"
            defaultValue={defaultValues.billerName}
            error={fe.billerName}
          />
          <Field
            label="Amount *"
            name="amount"
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            defaultValue={defaultValues.amount}
            error={fe.amount}
          />
          <Field
            label="Currency"
            name="currency"
            defaultValue={defaultValues.currency}
            error={fe.currency}
          />
          <Field
            label="Due date *"
            name="dueDate"
            type="date"
            defaultValue={defaultValues.dueDate}
            error={fe.dueDate}
          />
          <Field
            label="Issue date"
            name="issueDate"
            type="date"
            defaultValue={defaultValues.issueDate}
            error={fe.issueDate}
          />
          <Field
            label="Category"
            name="category"
            defaultValue={defaultValues.category}
            error={fe.category}
          />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Invoice details</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Reference number"
            name="referenceNumber"
            defaultValue={defaultValues.referenceNumber}
            error={fe.referenceNumber}
          />
          <Field
            label="Invoice number"
            name="invoiceNumber"
            defaultValue={defaultValues.invoiceNumber}
            error={fe.invoiceNumber}
          />
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Payment</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Payment method"
            name="paymentMethod"
            defaultValue={defaultValues.paymentMethod}
            error={fe.paymentMethod}
          />
          <Field
            label="Payment URL"
            name="paymentUrl"
            type="url"
            defaultValue={defaultValues.paymentUrl}
            error={fe.paymentUrl}
          />
        </div>
        <TextArea
          label="Payment instructions"
          name="paymentInstructions"
          defaultValue={defaultValues.paymentInstructions}
          error={fe.paymentInstructions}
        />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Notes & recurrence</h2>
        <TextArea
          label="Notes"
          name="notes"
          defaultValue={defaultValues.notes}
          error={fe.notes}
        />
        <div className="flex items-center gap-2">
          <input
            id="isRecurring"
            name="isRecurring"
            type="checkbox"
            defaultChecked={defaultValues.isRecurring}
            className="h-4 w-4 rounded border-input"
          />
          <label htmlFor="isRecurring" className="text-sm">
            This is a recurring bill
          </label>
        </div>
        <Field
          label="Recurrence rule"
          name="recurrenceRule"
          defaultValue={defaultValues.recurrenceRule}
          error={fe.recurrenceRule}
          placeholder="Optional (e.g. Monthly on the 1st)"
        />
      </section>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  error,
  type,
  placeholder,
  inputMode,
  min,
  step,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  error?: string;
  type?: string;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  min?: string;
  step?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium">{label}</label>
      <input
        name={name}
        type={type ?? "text"}
        inputMode={inputMode}
        min={min}
        step={step}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  error,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  error?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium">{label}</label>
      <textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        className="min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

