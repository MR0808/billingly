"use server";

import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/lib/types/actions";
import type { ReminderListItemDTO } from "./_types";
import { toZonedTime } from "date-fns-tz";
import { requireWorkspace } from "@/actions/bills/_require-workspace";

export async function listRemindersAction(): Promise<ActionResult<ReminderListItemDTO[]>> {
  const ctx = await requireWorkspace();
  if (!ctx.success) return ctx;

  const now = new Date();
  const minDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const reminders = await prisma.reminder.findMany({
    where: {
      workspaceId: ctx.data.workspace.id,
      OR: [
        {
          status: "PENDING",
          remindAt: { gte: now },
        },
        {
          status: { in: ["SENT", "FAILED"] },
          remindAt: { gte: minDate },
        },
      ],
    },
    include: {
      bill: {
        select: {
          id: true,
          billerName: true,
          amount: true,
          currency: true,
          dueDate: true,
        },
      },
    },
    orderBy: { remindAt: "asc" },
    take: 50,
  });

  const remindersDto: ReminderListItemDTO[] = reminders.map((r) => {
    const bill = r.bill;
    const dueDate = bill.dueDate;
    const remindAtDate = r.remindAt;
    const remindAtDisplay = toZonedTime(remindAtDate, ctx.data.workspace.timezone).toLocaleString();
    return {
      id: r.id,
      status: r.status,
      remindAt: remindAtDate.toISOString(),
      sentAt: r.sentAt ? r.sentAt.toISOString() : null,
      errorMessage: r.errorMessage ?? null,
      channel: "EMAIL",
      bill: {
        id: bill.id,
        billerName: bill.billerName,
        amount: bill.amount ? bill.amount.toString() : null,
        currency: bill.currency,
        dueDate: dueDate ? dueDate.toISOString() : null,
      },
      remindAtDisplay,
    };
  });

  return { success: true, data: remindersDto };
}

