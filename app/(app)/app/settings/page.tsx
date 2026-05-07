import { getWorkspaceReminderSettingsAction } from "@/actions/settings/get-workspace-reminder-settings";
import { updateWorkspaceReminderSettingsFormAction } from "@/actions/settings/update-workspace-reminder-settings";
import { ReminderSettingsForm } from "@/app/(app)/app/settings/ReminderSettingsForm";

export default async function SettingsPage() {
  const res = await getWorkspaceReminderSettingsAction();
  if (!res.success) {
    return (
      <p className="text-sm text-destructive">
        Unable to load reminder settings: {res.error}
      </p>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Workspace settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure reminder defaults for your workspace.
        </p>
      </div>

      <ReminderSettingsForm
        initialSettings={res.data}
        action={updateWorkspaceReminderSettingsFormAction}
      />
    </div>
  );
}

