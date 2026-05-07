import { prisma } from "@/lib/prisma";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

const REMINDER_MORNING_HOUR = 9;

function toKey(utc: Date): number {
  return utc.getTime();
}

export async function cancelPendingRemindersForBill(args: {
  workspaceId: string;
  billId: string;
}): Promise<void> {
  const now = new Date();
  await prisma.reminder.updateMany({
    where: {
      workspaceId: args.workspaceId,
      billId: args.billId,
      status: "PENDING",
    },
    data: {
      status: "CANCELLED",
      updatedAt: now,
    },
  });
}

function buildReminderTimes(args: {
  dueDate: Date;
  timezone: string;
  defaultReminderDays: number[];
  now: Date;
}): Date[] {
  const { dueDate, timezone, defaultReminderDays, now } = args;

  const dueLocal = toZonedTime(dueDate, timezone);
  const year = dueLocal.getFullYear();
  const month = dueLocal.getMonth();
  const day = dueLocal.getDate();

  const desired = new Map<number, Date>();

  for (const offset of defaultReminderDays) {
    if (!Number.isInteger(offset) || offset < 0) continue;

    const wall = new Date(
      year,
      month,
      day - offset,
      REMINDER_MORNING_HOUR,
      0,
      0,
      0
    );

    const remindAtUtc = fromZonedTime(wall, timezone);
    if (remindAtUtc.getTime() <= now.getTime()) continue;

    desired.set(toKey(remindAtUtc), remindAtUtc);
  }

  return Array.from(desired.values()).sort((a, b) => a.getTime() - b.getTime());
}

export async function syncBillRemindersForScheduledBill(args: {
  workspaceId: string;
  billId: string;
}): Promise<void> {
  const now = new Date();

  const bill = await prisma.bill.findFirst({
    where: { id: args.billId, workspaceId: args.workspaceId },
    select: { id: true, dueDate: true, status: true },
  });

  if (!bill) return;
  if (bill.status !== "SCHEDULED") return;
  if (!bill.dueDate) return;

  const workspace = await prisma.workspace.findFirst({
    where: { id: args.workspaceId },
    select: {
      timezone: true,
      settings: {
        select: { defaultReminderDays: true, reminderEmailEnabled: true },
      },
    },
  });

  if (!workspace) return;
  const settings = workspace.settings;
  const defaultReminderDays = settings?.defaultReminderDays ?? [7, 1, 0];
  const reminderEmailEnabled = settings?.reminderEmailEnabled ?? true;

  if (!reminderEmailEnabled) {
    await cancelPendingRemindersForBill({ workspaceId: args.workspaceId, billId: args.billId });
    return;
  }

  const desiredRemindAt = buildReminderTimes({
    dueDate: bill.dueDate,
    timezone: workspace.timezone,
    defaultReminderDays,
    now,
  });

  const desiredKeys = new Set(desiredRemindAt.map(toKey));

  // Cancel pending reminders that are no longer part of the desired schedule.
  const pending = await prisma.reminder.findMany({
    where: {
      workspaceId: args.workspaceId,
      billId: args.billId,
      channel: "EMAIL",
      status: "PENDING",
    },
  });

  for (const p of pending) {
    if (!desiredKeys.has(toKey(p.remindAt))) {
      await prisma.reminder.update({
        where: { id: p.id },
        data: { status: "CANCELLED", updatedAt: now },
      });
    }
  }

  if (desiredRemindAt.length === 0) return;

  const existing = await prisma.reminder.findMany({
    where: {
      workspaceId: args.workspaceId,
      billId: args.billId,
      channel: "EMAIL",
      remindAt: { in: desiredRemindAt },
    },
    select: { id: true, remindAt: true, status: true },
  });

  const existingByRemindAt = new Map<number, { id: string; status: string }>();
  for (const e of existing) {
    existingByRemindAt.set(toKey(e.remindAt), { id: e.id, status: e.status });
  }

  for (const remindAtUtc of desiredRemindAt) {
    const key = toKey(remindAtUtc);
    const existingRow = existingByRemindAt.get(key);
    if (existingRow) {
      if (existingRow.status === "CANCELLED") {
        await prisma.reminder.update({
          where: { id: existingRow.id },
          data: {
            status: "PENDING",
            sentAt: null,
            errorMessage: null,
            updatedAt: now,
          },
        });
      }
      continue;
    }

    await prisma.reminder.create({
      data: {
        workspaceId: args.workspaceId,
        billId: args.billId,
        channel: "EMAIL",
        remindAt: remindAtUtc,
        status: "PENDING",
        createdAt: now,
        updatedAt: now,
      },
    });
  }
}

