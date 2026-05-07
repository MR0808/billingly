import Link from "next/link";
import { listRemindersAction } from "@/actions/reminders/list-reminders";
import type { ReminderListItemDTO } from "@/actions/reminders/_types";

function StatusBadge({ status }: { status: ReminderListItemDTO["status"] }) {
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
  const map: Record<string, string> = {
    PENDING: "bg-sky-100 text-sky-700",
    SENT: "bg-emerald-100 text-emerald-700",
    FAILED: "bg-red-100 text-red-700",
    CANCELLED: "bg-zinc-100 text-zinc-500",
  };
  return <span className={`${base} ${map[status] ?? map.PENDING}`}>{status}</span>;
}

function formatDueDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString();
}

export default async function RemindersPage() {
  const res = await listRemindersAction();
  if (!res.success) {
    return (
      <p className="text-sm text-destructive">
        Unable to load reminders: {res.error}
      </p>
    );
  }

  const reminders = res.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reminders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upcoming and recent reminder processing for your workspace.
        </p>
      </div>

      {reminders.length === 0 ? (
        <div className="rounded-xl border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No reminders yet. When your bills are scheduled, Billingly will
            create email reminders automatically.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Bill</th>
                <th className="px-3 py-2 text-left">Amount</th>
                <th className="px-3 py-2 text-left">Due date</th>
                <th className="px-3 py-2 text-left">Remind at</th>
                <th className="px-3 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {reminders.map((r: ReminderListItemDTO) => (
                <tr key={r.id} className="border-t hover:bg-muted/40">
                  <td className="px-3 py-2">
                    <Link
                      href={`/app/bills/${r.bill.id}`}
                      className="font-medium hover:underline"
                    >
                      {r.bill.billerName ?? "Untitled"}
                    </Link>
                  </td>
                  <td className="px-3 py-2">
                    {r.bill.amount
                      ? `${r.bill.currency} ${r.bill.amount}`
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-xs">{formatDueDate(r.bill.dueDate)}</td>
                  <td className="px-3 py-2 text-xs">{r.remindAtDisplay}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


