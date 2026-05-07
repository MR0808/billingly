import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types/actions";
import { getBillByIdAction } from "@/actions/bills/get-bill";
import { updateBillAction } from "@/actions/bills/update-bill";
import type { BillDTO } from "@/actions/bills/_types";
import { BillUpsertForm } from "@/app/(app)/app/bills/components/BillUpsertForm";

type FormState = ActionResult<null>;

async function updateBillFormAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  "use server";
  const raw = Object.fromEntries(formData.entries());
  const res = await updateBillAction(raw);

  if (!res.success) {
    return { success: false, error: res.error, fieldErrors: res.fieldErrors };
  }

  revalidatePath("/app");
  revalidatePath("/app/bills");
  revalidatePath("/app/reminders");
  revalidatePath(`/app/bills/${res.data.id}`);
  redirect(`/app/bills/${res.data.id}`);
}

export default async function BillEditPage({
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

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Edit bill</h1>
        <p className="text-sm text-muted-foreground">
          Update details and save.
        </p>
        <Link
          href={`/app/bills/${bill.id}`}
          className="text-sm text-muted-foreground underline-offset-2 hover:underline"
        >
          Back to bill
        </Link>
      </div>

      <BillUpsertForm
        mode="edit"
        defaultValues={{
          billId: bill.id,
          billerName: bill.billerName ?? "",
          amount: bill.amount ?? "",
          currency: bill.currency ?? "AUD",
          dueDate: bill.dueDate ? bill.dueDate.slice(0, 10) : "",
          issueDate: bill.issueDate ? bill.issueDate.slice(0, 10) : "",
          category: bill.category ?? "",
          referenceNumber: bill.referenceNumber ?? "",
          invoiceNumber: bill.invoiceNumber ?? "",
          paymentMethod: bill.paymentMethod ?? "",
          paymentInstructions: bill.paymentInstructions ?? "",
          paymentUrl: bill.paymentUrl ?? "",
          notes: bill.notes ?? "",
          isRecurring: bill.isRecurring,
          recurrenceRule: bill.recurrenceRule ?? "",
        }}
        action={updateBillFormAction}
        submitLabel="Save changes"
      />
    </div>
  );
}

