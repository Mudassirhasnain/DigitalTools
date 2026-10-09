'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

const MS_PER_DAY = 86400000;
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type Mode = 'between' | 'add';

function pad2(n: number) {
  return n.toString().padStart(2, '0');
}

function toInputString(d: Date): string {
  return `${d.getUTCFullYear().toString().padStart(4, '0')}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function parseInput(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const y = +m[1];
  const mo = +m[2];
  const d = +m[3];
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) return null;
  return date;
}

function todayUtcMidnight(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

function formatLong(d: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

function addMonthsClamped(date: Date, months: number): Date {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + months;
  const day = date.getUTCDate();
  const target = new Date(Date.UTC(y, m, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, lastDay));
  return target;
}

/** Calendar difference as years, months, days (start must be <= end). */
function ymd(start: Date, end: Date): { years: number; months: number; days: number } {
  let years = end.getUTCFullYear() - start.getUTCFullYear();
  let months = end.getUTCMonth() - start.getUTCMonth();
  let days = end.getUTCDate() - start.getUTCDate();
  if (days < 0) {
    months -= 1;
    const prevMonthLast = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 0)).getUTCDate();
    days += prevMonthLast;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

function parseHolidays(raw: string): Set<number> {
  const set = new Set<number>();
  for (const part of raw.split(/[\s,;]+/)) {
    const d = parseInput(part.trim());
    if (d) set.add(d.getTime());
  }
  return set;
}

/** Counts working days from start to end in constant time. includeEnd controls whether the end day counts. */
function countBusinessDays(start: Date, end: Date, includeEnd: boolean, weekend: number[], holidays: Set<number>) {
  const total = Math.max(0, Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + (includeEnd ? 1 : 0));
  const fullWeeks = Math.floor(total / 7);
  const rem = total % 7;
  let weekendDays = fullWeeks * weekend.length;
  const remStart = start.getTime() + fullWeeks * 7 * MS_PER_DAY;
  for (let i = 0; i < rem; i++) {
    const dow = new Date(remStart + i * MS_PER_DAY).getUTCDay();
    if (weekend.includes(dow)) weekendDays++;
  }
  let holidayHits = 0;
  const first = start.getTime();
  const last = start.getTime() + (total - 1) * MS_PER_DAY;
  holidays.forEach((h) => {
    if (h >= first && h <= last && !weekend.includes(new Date(h).getUTCDay())) holidayHits++;
  });
  return { business: total - weekendDays - holidayHits, weekendDays, holidayHits };
}

function addBusinessDays(start: Date, amount: number, weekend: number[], holidays: Set<number>): Date {
  const step = amount >= 0 ? 1 : -1;
  let remaining = Math.abs(amount);
  let current = new Date(start.getTime());
  while (remaining > 0) {
    current = new Date(current.getTime() + step * MS_PER_DAY);
    if (!weekend.includes(current.getUTCDay()) && !holidays.has(current.getTime())) remaining--;
  }
  return current;
}

const StatCard: React.FC<{ label: string; value: string; hint?: string; highlight?: boolean }> = ({
  label,
  value,
  hint,
  highlight,
}) => (
  <div
    className={`rounded-xl border p-4 ${
      highlight
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
        : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60'
    }`}
  >
    <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      {label}
    </span>
    <span className="mt-1 block text-2xl font-extrabold text-slate-900 dark:text-white">{value}</span>
    {hint && <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{hint}</span>}
  </div>
);

export const DaysBetweenDatesCalculator: React.FC = () => {
  const [mode, setMode] = useState<Mode>('between');
  const [startStr, setStartStr] = useState('');
  const [endStr, setEndStr] = useState('');
  const [includeEnd, setIncludeEnd] = useState(false);
  const [weekendType, setWeekendType] = useState('sat-sun');
  const [holidaysRaw, setHolidaysRaw] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [addStartStr, setAddStartStr] = useState('');
  const [direction, setDirection] = useState<'add' | 'subtract'>('add');
  const [years, setYears] = useState('0');
  const [months, setMonths] = useState('0');
  const [weeks, setWeeks] = useState('0');
  const [days, setDays] = useState('30');
  const [businessOnly, setBusinessOnly] = useState(false);

  useEffect(() => {
    const today = todayUtcMidnight();
    const inThirty = new Date(today.getTime() + 30 * MS_PER_DAY);
    setStartStr(toInputString(today));
    setEndStr(toInputString(inThirty));
    setAddStartStr(toInputString(today));
  }, []);

  const weekend = useMemo(
    () => (weekendType === 'fri-sat' ? [5, 6] : weekendType === 'none' ? [] : [0, 6]),
    [weekendType]
  );
  const holidays = useMemo(() => parseHolidays(holidaysRaw), [holidaysRaw]);

  const between = useMemo(() => {
    const a = parseInput(startStr);
    const b = parseInput(endStr);
    if (!a || !b) return null;
    const swapped = a.getTime() > b.getTime();
    const start = swapped ? b : a;
    const end = swapped ? a : b;
    const diffDays = Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);
    const totalDays = diffDays + (includeEnd ? 1 : 0);
    const parts = ymd(start, end);
    const biz = countBusinessDays(start, end, includeEnd, weekend, holidays);
    return {
      swapped,
      start,
      end,
      totalDays,
      weeks: Math.floor(totalDays / 7),
      remDays: totalDays % 7,
      parts,
      biz,
      hours: totalDays * 24,
      minutes: totalDays * 1440,
      seconds: totalDays * 86400,
      approxMonths: totalDays / 30.4375,
      approxYears: totalDays / 365.25,
    };
  }, [startStr, endStr, includeEnd, weekend, holidays]);

  const addResult = useMemo(() => {
    const start = parseInput(addStartStr);
    if (!start) return null;
    const sign = direction === 'add' ? 1 : -1;
    const y = parseInt(years, 10) || 0;
    const mo = parseInt(months, 10) || 0;
    const w = parseInt(weeks, 10) || 0;
    const d = parseInt(days, 10) || 0;
    if (businessOnly && Math.abs(w * 7 + d) > 200000) return null;
    let date = addMonthsClamped(start, sign * (y * 12 + mo));
    if (businessOnly) {
      date = addBusinessDays(date, sign * (w * 7 + d), weekend, holidays);
    } else {
      date = new Date(date.getTime() + sign * (w * 7 + d) * MS_PER_DAY);
    }
    if (isNaN(date.getTime()) || date.getUTCFullYear() < 1 || date.getUTCFullYear() > 9999) return null;
    const daysFromToday = Math.round((date.getTime() - todayUtcMidnight().getTime()) / MS_PER_DAY);
    return { start, date, daysFromToday };
  }, [addStartStr, direction, years, months, weeks, days, businessOnly, weekend, holidays]);

  const setPreset = (kind: 'today-to-year-end' | 'next-new-year' | 'plus-100' | 'plus-365') => {
    const today = todayUtcMidnight();
    setStartStr(toInputString(today));
    if (kind === 'today-to-year-end') {
      setEndStr(toInputString(new Date(Date.UTC(today.getUTCFullYear(), 11, 31))));
    } else if (kind === 'next-new-year') {
      setEndStr(toInputString(new Date(Date.UTC(today.getUTCFullYear() + 1, 0, 1))));
    } else if (kind === 'plus-100') {
      setEndStr(toInputString(new Date(today.getTime() + 100 * MS_PER_DAY)));
    } else {
      setEndStr(toInputString(new Date(today.getTime() + 365 * MS_PER_DAY)));
    }
  };

  const AdvancedPanel = (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Weekend days"
          value={weekendType}
          onChange={(e) => setWeekendType(e.target.value)}
          options={[
            { value: 'sat-sun', label: 'Saturday and Sunday' },
            { value: 'fri-sat', label: 'Friday and Saturday' },
            { value: 'none', label: 'No weekends (count every day)' },
          ]}
        />
        <Textarea
          label="Holidays to skip (optional)"
          rows={3}
          placeholder={'One date per line or separated by commas\n2026-12-25\n2027-01-01'}
          value={holidaysRaw}
          onChange={(e) => setHolidaysRaw(e.target.value)}
          helperText="Use the format YYYY-MM-DD. Holidays only reduce the working day count."
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="space-y-5">
        <div
          className="inline-flex rounded-lg border border-slate-300 p-0.5 dark:border-slate-700"
          role="tablist"
          aria-label="Calculator mode"
        >
          {(
            [
              { id: 'between', label: 'Days between two dates' },
              { id: 'add', label: 'Add or subtract time' },
            ] as { id: Mode; label: string }[]
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={mode === m.id}
              onClick={() => setMode(m.id)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                mode === m.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === 'between' ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Start date" type="date" value={startStr} onChange={(e) => setStartStr(e.target.value)} />
              <Input label="End date" type="date" value={endStr} onChange={(e) => setEndStr(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'today-to-year-end', label: 'Today to Dec 31' },
                { id: 'next-new-year', label: 'Today to next New Year' },
                { id: 'plus-100', label: 'Today + 100 days' },
                { id: 'plus-365', label: 'Today + 365 days' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPreset(p.id as Parameters<typeof setPreset>[0])}
                  className="px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:text-blue-400 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <label className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeEnd}
                  onChange={(e) => setIncludeEnd(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Include the end date in the count
              </label>
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowAdvanced(!showAdvanced)}>
                {showAdvanced ? 'Hide' : 'Show'} working day settings
              </Button>
            </div>
            {showAdvanced && AdvancedPanel}
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Start date" type="date" value={addStartStr} onChange={(e) => setAddStartStr(e.target.value)} />
              <Select
                label="Action"
                value={direction}
                onChange={(e) => setDirection(e.target.value as 'add' | 'subtract')}
                options={[
                  { value: 'add', label: 'Add to the date' },
                  { value: 'subtract', label: 'Subtract from the date' },
                ]}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Input label="Years" type="number" min={0} value={years} onChange={(e) => setYears(e.target.value)} />
              <Input label="Months" type="number" min={0} value={months} onChange={(e) => setMonths(e.target.value)} />
              <Input label="Weeks" type="number" min={0} value={weeks} onChange={(e) => setWeeks(e.target.value)} />
              <Input label="Days" type="number" min={0} value={days} onChange={(e) => setDays(e.target.value)} />
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <label className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={businessOnly}
                  onChange={(e) => setBusinessOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Count weeks and days as working days only
              </label>
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowAdvanced(!showAdvanced)}>
                {showAdvanced ? 'Hide' : 'Show'} working day settings
              </Button>
            </div>
            {showAdvanced && AdvancedPanel}
          </>
        )}
      </Card>

      {mode === 'between' && between && (
        <>
          <Card className="bg-linear-to-r from-blue-950 via-slate-900 to-slate-950 border-blue-900/60 text-white space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block">
              {formatLong(between.start)} to {formatLong(between.end)}
            </span>
            <p className="text-4xl sm:text-5xl font-extrabold">
              {between.totalDays.toLocaleString()} {between.totalDays === 1 ? 'day' : 'days'}
            </p>
            <p className="text-sm text-slate-300">
              That is {between.parts.years} years, {between.parts.months} months, and {between.parts.days} days
              {includeEnd ? ' (the end date is counted as a full day)' : ''}.
            </p>
            {between.swapped && (
              <p className="text-xs text-amber-300">The start date was after the end date, so the dates were swapped.</p>
            )}
          </Card>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Weeks and days" value={`${between.weeks.toLocaleString()} w ${between.remDays} d`} />
            <StatCard
              label="Working days"
              value={between.biz.business.toLocaleString()}
              hint={`${between.biz.weekendDays} weekend days${between.biz.holidayHits ? `, ${between.biz.holidayHits} holidays` : ''}`}
              highlight
            />
            <StatCard label="Months (approx.)" value={between.approxMonths.toFixed(2)} />
            <StatCard label="Years (approx.)" value={between.approxYears.toFixed(2)} />
            <StatCard label="Hours" value={between.hours.toLocaleString()} />
            <StatCard label="Minutes" value={between.minutes.toLocaleString()} />
            <StatCard label="Seconds" value={between.seconds.toLocaleString()} />
            <StatCard label="Day of the week" value={WEEKDAY_NAMES[between.end.getUTCDay()]} hint="the end date falls on" />
          </div>
        </>
      )}

      {mode === 'between' && !between && (
        <Card className="text-sm text-slate-500 dark:text-slate-400">Enter two valid dates to see the result.</Card>
      )}

      {mode === 'add' && addResult && (
        <Card className="bg-linear-to-r from-blue-950 via-slate-900 to-slate-950 border-blue-900/60 text-white space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block">
            {direction === 'add' ? 'Result of adding' : 'Result of subtracting'} from {formatLong(addResult.start)}
          </span>
          <p className="text-2xl sm:text-4xl font-extrabold">{formatLong(addResult.date)}</p>
          <p className="text-sm text-slate-300">
            {addResult.daysFromToday === 0
              ? 'That date is today.'
              : addResult.daysFromToday > 0
              ? `That is ${addResult.daysFromToday.toLocaleString()} days from today.`
              : `That was ${Math.abs(addResult.daysFromToday).toLocaleString()} days ago.`}
          </p>
        </Card>
      )}

      {mode === 'add' && !addResult && (
        <Card className="text-sm text-slate-500 dark:text-slate-400">
          Enter a valid start date and amounts to see the new date.
        </Card>
      )}
    </div>
  );
};
