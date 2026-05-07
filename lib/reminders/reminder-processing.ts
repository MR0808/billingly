import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email/sendReminderEmail";

export type ProcessDueRemindersResult = {
  processed: number;
  sent: number;
  failed: number;
};

export async function processDueReminders(): Promise<ProcessDueRemindersResult> {
  const now = new Date();

  const dueReminders = await prisma.reminder.findMany({
    where: {
      status: "PENDING",
      remindAt: { lte: now },
    },
    include: {
      bill: {
        select: {
          id: true,
          billerName: true,
          amount: true,
          currency: true,
          dueDate: true,
          workspaceId: true,
        },
      },
      workspace: {
        select: {
          id: true,
          timezone: true,
          owner: {
            select: { email: true },
          },
        },
      },
    },
  });

  let processed = 0;
  let sent = 0;
  let failed = 0;

  for (const reminder of dueReminders) {
    // Re-check status to keep idempotency safe under concurrent cron runs.
    const current = await prisma.reminder.findUnique({
      where: { id: reminder.id },
      select: { status: true },
    });

    if (current?.status !== "PENDING") continue;

    processed += 1;

    const bill = reminder.bill;
    const workspace = reminder.workspace;

    const recipientEmail = workspace.owner?.email;
    if (!recipientEmail) {
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: {
          status: "FAILED",
          errorMessage: "Missing workspace owner email",
          updatedAt: now,
        },
      });
      failed += 1;
      continue;
    }

    if (!bill.dueDate || !bill.billerName || !bill.amount) {
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: {
          status: "FAILED",
          errorMessage: "Missing bill details for reminder",
          updatedAt: now,
        },
      });
      failed += 1;
      continue;
    }

    try {
      await sendReminderEmail({
        to: recipientEmail,
        billId: bill.id,
        billerName: bill.billerName,
        amount: bill.amount.toString(),
        currency: bill.currency,
        dueDate: bill.dueDate,
        workspaceTimezone: workspace.timezone,
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
      });

      await prisma.reminder.update({
        where: { id: reminder.id },
        data: {
          status: "SENT",
          sentAt: now,
          errorMessage: null,
          updatedAt: now,
        },
      });
      sent += 1;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to send reminder email";
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: {
          status: "FAILED",
          errorMessage: message,
          updatedAt: now,
        },
      });
      failed += 1;
    }
  }

  return { processed, sent, failed };
}

