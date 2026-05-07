"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/lib/types/actions";

type MarkPaidState = ActionResult<null>;
const initialState: MarkPaidState = { success: false, error: "", fieldErrors: {} };

export function MarkPaidForm({
  billId,
  defaultAmount,
  action,
}: {
  billId: string;
  defaultAmount: string;
  action: (prevState: MarkPaidState, formData: FormData) => Promise<MarkPaidState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const fe = state.success ? {} : state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="billId" value={billId} />

      {!state.success && state.error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Amount paid *"
          name="amountPaid"
          type="number"
          min="0.01"
          step="0.01"
          defaultValue={defaultAmount}
          error={fe.amountPaid}
        />
        <Field
          label="Paid at *"
          name="paidAt"
          type="datetime-local"
          defaultValue={toDateTimeLocal(new Date())}
          error={fe.paidAt}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Method" name="method" defaultValue="" error={fe.method} />
        <Field label="Note" name="note" defaultValue="" error={fe.note} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
      >
        {pending ? "Marking paid..." : "Mark paid"}
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
  min,
  step,
}: {
  label: string;
  name: string;
  defaultValue: string;
  error?: string;
  type?: string;
  min?: string;
  step?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium">{label}</label>
      <input
        name={name}
        type={type ?? "text"}
        min={min}
        step={step}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function toDateTimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

