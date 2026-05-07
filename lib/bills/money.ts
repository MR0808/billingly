const AMOUNT_RE = /^\d+(\.\d{1,4})?$/;

export function parseAmountToDecimalString(input: unknown): string {
  const raw = String(input ?? "").trim();
  if (!raw) throw new Error("Amount is required");
  if (!AMOUNT_RE.test(raw)) throw new Error("Amount must be a number");
  const n = Number(raw);
  if (!Number.isFinite(n)) throw new Error("Amount must be a number");
  if (n <= 0) throw new Error("Amount must be greater than zero");
  // Store as 2dp for money fields
  return n.toFixed(2);
}

export function formatMoney(amount: string | null, currency: string): string {
  if (!amount) return "—";
  return `${currency} ${amount}`;
}

