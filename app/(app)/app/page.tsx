import Link from "next/link";
import { getDashboardSummaryAction } from "@/actions/dashboard/get-dashboard-summary";
import { getRecentBillsAction } from "@/actions/dashboard/get-recent-bills";
import type { BillDTO } from "@/actions/bills/_types";
import { formatMoney } from "@/lib/bills/money";

export default async function AppDashboardPage() {
  const summaryRes = await getDashboardSummaryAction();
  const recentRes = await getRecentBillsAction();

  const recent: BillDTO[] = recentRes.success ? recentRes.data : [];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      {summaryRes.success ? (
        <section className="grid gap-4 md:grid-cols-5">
          <SummaryCard label="Total bills" value={summaryRes.data.totalBills} />
          <SummaryCard label="Scheduled" value={summaryRes.data.scheduledBills} />
          <SummaryCard
            label="Overdue"
            value={summaryRes.data.overdueBills}
            tone="error"
          />
          <SummaryCard label="Paid" value={summaryRes.data.paidBills} tone="success" />
          <SummaryCard label="Due soon" value={summaryRes.data.dueSoonBills} />
        </section>
      ) : (
        <p className="text-sm text-destructive">Unable to load dashboard summary.</p>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Recent bills</h2>
          <Link
            href="/app/bills"
            className="text-xs text-primary underline-offset-2 hover:underline"
          >
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="rounded-xl border bg-card p-6">
            <p className="text-sm text-muted-foreground">
              No bills yet.{" "}
              <Link href="/app/bills/new" className="text-primary underline">
                Create your first bill
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Biller</th>
                  <th className="px-3 py-2 text-left">Amount</th>
                  <th className="px-3 py-2 text-left">Due</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((b) => (
                  <tr key={b.id} className="border-t hover:bg-muted/40">
                    <td className="px-3 py-2">
                      <Link
                        href={`/app/bills/${b.id}`}
                        className="font-medium hover:underline"
                      >
                        {b.billerName ?? "Untitled"}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      {formatMoney(b.amount, b.currency)}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {b.dueDate ? new Date(b.dueDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge status={b.displayStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "success" | "error";
}) {
  const toneClass =
    tone === "success"
      ? "text-emerald-700"
      : tone === "error"
      ? "text-red-700"
      : "text-foreground";

  return (
    <div className="rounded-xl border bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: BillDTO["displayStatus"] }) {
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
  const map: Record<BillDTO["displayStatus"], string> = {
    DRAFT: "bg-muted text-muted-foreground",
    SCHEDULED: "bg-sky-100 text-sky-700",
    OVERDUE: "bg-red-100 text-red-700",
    PAID: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-zinc-100 text-zinc-500",
  };

  return <span className={`${base} ${map[status]}`}>{status}</span>;
}

