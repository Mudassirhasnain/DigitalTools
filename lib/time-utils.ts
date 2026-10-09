export interface ZoneOption {
  id: string;
  label: string;
}

export const ZONES: ZoneOption[] = [
  { id: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { id: 'America/New_York', label: 'New York (Eastern Time, ET)' },
  { id: 'America/Chicago', label: 'Chicago (Central Time, CT)' },
  { id: 'America/Denver', label: 'Denver (Mountain Time, MT)' },
  { id: 'America/Phoenix', label: 'Phoenix (Arizona, no DST)' },
  { id: 'America/Los_Angeles', label: 'Los Angeles (Pacific Time, PT)' },
  { id: 'America/Anchorage', label: 'Anchorage (Alaska Time)' },
  { id: 'Pacific/Honolulu', label: 'Honolulu (Hawaii Time)' },
  { id: 'America/Toronto', label: 'Toronto (Eastern Time)' },
  { id: 'America/Vancouver', label: 'Vancouver (Pacific Time)' },
  { id: 'America/Mexico_City', label: 'Mexico City' },
  { id: 'America/Sao_Paulo', label: 'Sao Paulo' },
  { id: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires' },
  { id: 'Europe/London', label: 'London (GMT / BST)' },
  { id: 'Europe/Paris', label: 'Paris (CET / CEST)' },
  { id: 'Europe/Berlin', label: 'Berlin (CET / CEST)' },
  { id: 'Europe/Madrid', label: 'Madrid (CET / CEST)' },
  { id: 'Europe/Rome', label: 'Rome (CET / CEST)' },
  { id: 'Europe/Istanbul', label: 'Istanbul (TRT)' },
  { id: 'Europe/Moscow', label: 'Moscow (MSK)' },
  { id: 'Africa/Cairo', label: 'Cairo' },
  { id: 'Africa/Lagos', label: 'Lagos (WAT)' },
  { id: 'Africa/Nairobi', label: 'Nairobi (EAT)' },
  { id: 'Africa/Johannesburg', label: 'Johannesburg (SAST)' },
  { id: 'Asia/Riyadh', label: 'Riyadh (AST)' },
  { id: 'Asia/Dubai', label: 'Dubai (GST)' },
  { id: 'Asia/Karachi', label: 'Karachi / Islamabad (PKT)' },
  { id: 'Asia/Kolkata', label: 'India (IST)' },
  { id: 'Asia/Dhaka', label: 'Dhaka (BST)' },
  { id: 'Asia/Bangkok', label: 'Bangkok (ICT)' },
  { id: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { id: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)' },
  { id: 'Asia/Shanghai', label: 'Beijing / Shanghai (CST)' },
  { id: 'Asia/Manila', label: 'Manila (PHT)' },
  { id: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { id: 'Asia/Seoul', label: 'Seoul (KST)' },
  { id: 'Australia/Perth', label: 'Perth (AWST)' },
  { id: 'Australia/Sydney', label: 'Sydney (AEST / AEDT)' },
  { id: 'Pacific/Auckland', label: 'Auckland (NZST / NZDT)' },
];

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getPartsFormatter(timeZone: string): Intl.DateTimeFormat {
  let fmt = formatterCache.get(timeZone);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
    formatterCache.set(timeZone, fmt);
  }
  return fmt;
}

export interface ZoneParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/** Wall clock parts of an instant (UTC ms) as seen in the given IANA zone. */
export function getZoneParts(utcMs: number, timeZone: string): ZoneParts {
  const parts = getPartsFormatter(timeZone).formatToParts(new Date(utcMs));
  const map: Record<string, number> = {};
  for (const p of parts) {
    if (p.type !== 'literal') map[p.type] = parseInt(p.value, 10);
  }
  return {
    year: map.year,
    month: map.month,
    day: map.day,
    hour: (map.hour ?? 0) % 24,
    minute: map.minute ?? 0,
    second: map.second ?? 0,
  };
}

/** Offset from UTC in minutes for the zone at the given instant (DST aware). */
export function getOffsetMinutes(timeZone: string, utcMs: number): number {
  const p = getZoneParts(utcMs, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  const flooredInstant = Math.floor(utcMs / 1000) * 1000;
  return Math.round((asUtc - flooredInstant) / 60000);
}

/** Convert a wall clock time in a zone into a UTC instant (ms). */
export function wallTimeToUtc(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): number {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const off1 = getOffsetMinutes(timeZone, guess);
  const first = guess - off1 * 60000;
  const off2 = getOffsetMinutes(timeZone, first);
  return off2 === off1 ? first : guess - off2 * 60000;
}

export function formatInZone(
  utcMs: number,
  timeZone: string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    ...options,
  }).format(new Date(utcMs));
}

export function formatTimeOnly(utcMs: number, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(utcMs));
}

/** Short zone abbreviation in effect at that instant, for example EDT or PST. */
export function getZoneAbbreviation(utcMs: number, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'short',
  }).formatToParts(new Date(utcMs));
  return parts.find((p) => p.type === 'timeZoneName')?.value ?? timeZone;
}

/** Calendar day difference between two zones at the same instant (target minus source). */
export function dayDifference(utcMs: number, fromZone: string, toZone: string): number {
  const a = getZoneParts(utcMs, fromZone);
  const b = getZoneParts(utcMs, toZone);
  const da = Date.UTC(a.year, a.month - 1, a.day);
  const db = Date.UTC(b.year, b.month - 1, b.day);
  return Math.round((db - da) / 86400000);
}

export function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

/** Value for datetime-local style inputs: YYYY-MM-DDTHH:mm in the given zone. */
export function nowInZoneInputValue(timeZone: string, utcMs: number = Date.now()): string {
  const p = getZoneParts(utcMs, timeZone);
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}T${pad2(p.hour)}:${pad2(p.minute)}`;
}

export function describeOffsetDifference(minutes: number): string {
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const hourText = `${h} hour${h === 1 ? '' : 's'}`;
  if (m === 0) return hourText;
  if (h === 0) return `${m} minutes`;
  return `${hourText} ${m} minutes`;
}

export function getLocalZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/** Zone list with the visitor's own zone added on top when it is not already listed. */
export function zonesWithLocal(localZone: string): ZoneOption[] {
  if (!localZone || ZONES.some((z) => z.id === localZone)) return ZONES;
  return [{ id: localZone, label: `Your local time (${localZone.replace(/_/g, ' ')})` }, ...ZONES];
}
