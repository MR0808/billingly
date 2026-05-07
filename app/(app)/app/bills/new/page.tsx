import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/types/actions";
import { createBillAction } from "@/actions/bills/create-bill";
import { BillUpsertForm } from "@/app/(app)/app/bills/components/BillUpsertForm";

type FormState = ActionResult<null>;

async function createBillFormAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  "use server";

  const raw = Object.fromEntries(formData.entries());
  const res = await createBillAction(raw);

  if (!res.success) {
    return { success: false, error: res.error, fieldErrors: res.fieldErrors };
  }

  revalidatePath("/app");
  revalidatePath("/app/bills");
  revalidatePath("/app/reminders");
  revalidatePath(`/app/bills/${res.data.id}`);
  redirect(`/app/bills/${res.data.id}`);
}

export default function NewBillPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold">New bill</h1>
        <p className="text-sm text-muted-foreground">
          Create a manual bill. Required: biller name, amount, due date.
        </p>
      </div>

      <BillUpsertForm
        mode="create"
        defaultValues={{
          billerName: "",
          amount: "",
          currency: "AUD",
          dueDate: "",
          issueDate: "",
          category: "",
          referenceNumber: "",
          invoiceNumber: "",
          paymentMethod: "",
          paymentInstructions: "",
          paymentUrl: "",
          notes: "",
          isRecurring: false,
          recurrenceRule: "",
        }}
        action={createBillFormAction}
        submitLabel="Create bill"
      />
    </div>
  );
}

