/** Local calendar yyyy-MM-dd for API payloads (matches former native date input values). */
export function adminDateToYmd(value: unknown): string | null {
  if (value == null || value === '') {
    return null;
  }
  if (value instanceof Date) {
    if (isNaN(value.getTime())) {
      return null;
    }
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof value === 'string') {
    return value || null;
  }
  return null;
}

export function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
