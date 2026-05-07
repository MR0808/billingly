import { Resend } from "resend";

export type ReminderEmailPayload = {
  to: string;
  billId: string;
  billerName: string;
  amount: string;
  currency: string;
  dueDate: Date;
  workspaceTimezone: string;
  appUrl?: string;
};

function formatDueDate(dueDate: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone,
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(dueDate);
  } catch {
    return dueDate.toLocaleDateString();
  }
}

export async function sendReminderEmail(payload: ReminderEmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    throw new Error("Missing Resend configuration");
  }
  if (!payload.to) {
    throw new Error("Missing recipient email");
  }

  const subject = `Billingly reminder: ${payload.billerName} due ${formatDueDate(
    payload.dueDate,
    payload.workspaceTimezone
  )}`;

  const appLink = payload.appUrl
    ? `${payload.appUrl}/app/bills/${payload.billId}`
    : undefined;

  const html = `<!doctype html>
  <html>
    <body style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color: #0f172a;">
      <div style="max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 18px;">Payment reminder</h2>
        <p style="margin: 0 0 8px 0;">Hi,</p>
        <p style="margin: 0 0 12px 0;">
          This is a reminder that <strong>${payload.billerName}</strong> is due on <strong>${formatDueDate(
            payload.dueDate,
            payload.workspaceTimezone
          )}</strong>.
        </p>
        <p style="margin: 0 0 12px 0;">
          Amount: <strong>${payload.currency} ${payload.amount}</strong>
        </p>
        ${
          appLink
            ? `<p style="margin: 0 0 18px 0;"><a href="${appLink}" style="color: #2563eb;">View in Billingly</a></p>`
            : `<p style="margin: 0 0 18px 0;">Open the Billingly app to review payment details.</p>`
        }
        <p style="margin: 0; font-size: 12px; color: #64748b;">
          Sent by Billingly.
        </p>
      </div>
    </body>
  </html>`;

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from,
    to: payload.to,
    subject,
    html,
  });
}

