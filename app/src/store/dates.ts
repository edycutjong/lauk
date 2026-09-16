/**
 * Pure date helpers over the log — no storage import, so the test suite
 * covers the cap and the week strip without a device.
 */
import type { Face } from '../core/weights';

export interface DayRow {
  day: string;
  face: Face | null;
}

export function today(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function checksToday(rows: DayRow[], day = today()): number {
  return rows.filter((r) => r.day === day).length;
}

/** The last 7 days, oldest first, each with the last face logged that day (or null). */
export function weekStrip(rows: DayRow[], now = new Date()): { day: string; face: Face | null }[] {
  const out: { day: string; face: Face | null }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const day = today(d);
    const faces = rows.filter((r) => r.day === day && r.face !== null);
    out.push({ day, face: faces.length ? faces[faces.length - 1].face : null });
  }
  return out;
}
