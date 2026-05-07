import Link from "next/link";
import { listBillsAction } from "@/actions/bills/list-bills";
import type { BillDTO } from "@/actions/bills/_types";
import { formatMoney } from "@/lib/bills/money";

export default async function BillsPage() {
  const res = await listBillsAction();
  if (!res.success) {
    return (
      <p className="text-sm text-destructive">Unable to load bills: {res.error}</p>
    );
  }

  const bills: BillDTO[] = res.data;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Bills</h1>
        <Link
          href="/app/bills/new"
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          New bill
        </Link>
      </div>

      {bills.length === 0 ? (
        <div className="rounded-xl border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            You haven’t added any bills yet.
          </p>
          <Link
            href="/app/bills/new"
            className="mt-3 inline-flex rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Create your first bill
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Biller</th>
                <th className="px-3 py-2 text-left">Amount</th>
                <th className="px-3 py-2 text-left">Due date</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Created</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b.id} className="border-t hover:bg-muted/40">
                  <td className="px-3 py-2">
                    <Link
                      href={`/app/bills/${b.id}`}
                      className="font-medium hover:underline"
                    >
                      {b.billerName ?? "Untitled"}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{formatMoney(b.amount, b.currency)}</td>
                  <td className="px-3 py-2 text-xs">
                    {b.dueDate ? new Date(b.dueDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={b.displayStatus} />
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {new Date(b.createdAt).toLocaleDateString()}
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

