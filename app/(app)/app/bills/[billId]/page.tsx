import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types/actions";
import { getBillByIdAction } from "@/actions/bills/get-bill";
import { markBillPaidAction } from "@/actions/bills/mark-bill-paid";
import { cancelBillAction } from "@/actions/bills/cancel-bill";
import type { BillDTO } from "@/actions/bills/_types";
import { formatMoney } from "@/lib/bills/money";
import { MarkPaidForm } from "@/app/(app)/app/bills/components/MarkPaidForm";
import { CancelBillForm } from "@/app/(app)/app/bills/components/CancelBillForm";

type MarkPaidState = ActionResult<null>;
type CancelState = ActionResult<null>;

async function markPaidFormAction(
  prevState: MarkPaidState,
  formData: FormData
): Promise<MarkPaidState> {
  "use server";
  const raw = Object.fromEntries(formData.entries());
  const res = await markBillPaidAction(raw);
  if (!res.success) {
    return { success: false, error: res.error, fieldErrors: res.fieldErrors };
  }

  revalidatePath("/app");
  revalidatePath("/app/bills");
  revalidatePath("/app/reminders");
  revalidatePath(`/app/bills/${res.data.id}`);
  redirect(`/app/bills/${res.data.id}`);
}

async function cancelFormAction(
  prevState: CancelState,
  formData: FormData
): Promise<CancelState> {
  "use server";
  const raw = Object.fromEntries(formData.entries());
  const res = await cancelBillAction(raw);
  if (!res.success) return { success: false, error: res.error, fieldErrors: res.fieldErrors };

  revalidatePath("/app");
  revalidatePath("/app/bills");
  revalidatePath("/app/reminders");
  revalidatePath(`/app/bills/${res.data.id}`);
  redirect(`/app/bills/${res.data.id}`);
}

export default async function BillDetailPage({
  params,
}: {
  params: { billId: string };
}) {
  const res = await getBillByIdAction(params.billId);
  if (!res.success) {
    return (
      <p className="text-sm text-destructive">Unable to load bill: {res.error}</p>
    );
  }

  const bill: BillDTO = res.data;
  const amount = formatMoney(bill.amount, bill.currency);

  const latestPayment = bill.payments.length > 0 ? bill.payments[0] : null;

  return (
    <div className="space-y-6 max-w-3xl">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">
            {bill.billerName ?? "Untitled bill"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Due{" "}
            {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : "—"}
          </p>
        </div>
        <div className="text-right space-y-1">
          <div className="text-lg font-semibold">{amount}</div>
          <StatusBadge status={bill.displayStatus} />
        </div>
      </header>

      <div className="flex items-center gap-3">
        <Link
          href={`/app/bills/${bill.id}/edit`}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Edit
        </Link>
        <Link
          href="/app/bills"
          className="text-sm text-muted-foreground underline-offset-2 hover:underline"
        >
          Back to bills
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <Card title="Details">
          <Row label="Status" value={bill.displayStatus} />
          <Row label="Category" value={bill.category} />
          <Row label="Issue date" value={formatDate(bill.issueDate)} />
          <Row label="Reference" value={bill.referenceNumber} />
          <Row label="Invoice #" value={bill.invoiceNumber} />
        </Card>

        <Card title="Payment">
          <Row label="Method" value={bill.paymentMethod} />
          <Row label="Payment URL" value={bill.paymentUrl} />
          <Row label="Paid at" value={formatDateTime(bill.paidAt)} />
          <Row
            label="Latest payment"
            value={
              latestPayment
                ? `${bill.currency} ${latestPayment.amountPaid} on ${new Date(
                    latestPayment.paidAt
                  ).toLocaleDateString()}`
                : "—"
            }
          />
        </Card>
      </section>

      <Card title="Notes">
        <p className="text-sm text-muted-foreground whitespace-pre-line">
          {bill.notes ?? "No notes."}
        </p>
      </Card>

      {bill.status !== "CANCELLED" ? (
        <section className="grid gap-4 md:grid-cols-2">
          {bill.status !== "PAID" ? (
            <Card title="Mark paid">
              <MarkPaidForm
                billId={bill.id}
                defaultAmount={bill.amount ?? ""}
                action={markPaidFormAction}
              />
            </Card>
          ) : (
            <Card title="Payment history">
              {bill.payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No payment records.
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {bill.payments.map((p) => (
                    <li key={p.id} className="flex justify-between gap-4">
                      <span>
                        {bill.currency} {p.amountPaid} •{" "}
                        {new Date(p.paidAt).toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">
                        {p.method ?? "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          )}

          <Card title="Cancel">
            <CancelBillForm billId={bill.id} action={cancelFormAction} />
          </Card>
        </section>
      ) : (
        <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
          This bill has been cancelled.
        </div>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <h2 className="text-sm font-medium">{title}</h2>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right">{value ?? "—"}</span>
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

function formatDate(v: string | null): string | null {
  if (!v) return null;
  return new Date(v).toLocaleDateString();
}

function formatDateTime(v: string | null): string | null {
  if (!v) return null;
  return new Date(v).toLocaleString();
}

