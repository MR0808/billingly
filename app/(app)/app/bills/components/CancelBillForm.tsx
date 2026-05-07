"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/lib/types/actions";

type CancelState = ActionResult<null>;
const initialState: CancelState = { success: false, error: "", fieldErrors: {} };

export function CancelBillForm({
  billId,
  action,
}: {
  billId: string;
  action: (prevState: CancelState, formData: FormData) => Promise<CancelState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="billId" value={billId} />

      {!state.success && state.error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-60"
      >
        {pending ? "Cancelling..." : "Cancel bill"}
      </button>
    </form>
  );
}

