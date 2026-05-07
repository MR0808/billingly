"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/lib/types/actions";
import { Button } from "@/components/ui/button";
import type { WorkspaceReminderSettingsDTO } from "@/actions/settings/_types";

type SettingsState = ActionResult<null>;

const initialState: SettingsState = { success: false, error: "", fieldErrors: {} };

export function ReminderSettingsForm({
  initialSettings,
  action,
}: {
  initialSettings: WorkspaceReminderSettingsDTO;
  action: (
    prevState: SettingsState,
    formData: FormData
  ) => Promise<SettingsState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const fieldErrors = !state.success ? state.fieldErrors ?? {} : {};

  return (
    <form action={formAction} className="space-y-6">
      {!state.success && state.error ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}

      {state.success ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Settings saved.
        </div>
      ) : null}

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Reminder defaults</h2>
        <div className="space-y-1">
          <label htmlFor="defaultReminderDays" className="text-xs font-medium">
            Default reminder offsets (days, comma-separated)
          </label>
          <input
            id="defaultReminderDays"
            name="defaultReminderDays"
            defaultValue={initialSettings.defaultReminderDays.join(",")}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          {fieldErrors.defaultReminderDays ? (
            <p className="text-xs text-destructive">{fieldErrors.defaultReminderDays}</p>
          ) : null}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Email reminders</h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            name="reminderEmailEnabled"
            type="checkbox"
            defaultChecked={initialSettings.reminderEmailEnabled}
            className="h-4 w-4"
          />
          Enable sending email reminders
        </label>
        {fieldErrors.reminderEmailEnabled ? (
          <p className="text-xs text-destructive">{fieldErrors.reminderEmailEnabled}</p>
        ) : null}
      </section>

      <div className="pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save settings"}
        </Button>
      </div>
    </form>
  );
}

