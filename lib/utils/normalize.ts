export function normalizeOptionalString(value: unknown): string | null {
  const v = String(value ?? "").trim();
  return v ? v : null;
}

export function normalizeRequiredString(value: unknown): string {
  const v = String(value ?? "").trim();
  return v;
}

export function normalizeCheckbox(value: unknown): boolean {
  // HTML checkbox posts "on" when checked; absent when unchecked
  return value === "on" || value === "true" || value === true;
}

export function normalizeDateInput(value: unknown): Date | null {
  const v = String(value ?? "").trim();
  if (!v) return null;
  // Accept yyyy-mm-dd (from <input type="date">) or ISO strings
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

