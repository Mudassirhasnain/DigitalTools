'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CalendarDays } from 'lucide-react';

const MS_PER_DAY = 86400000;
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const utc = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d);
const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

function getIsoWeek(y: number, m: number, d: number): { week: number; isoYear: number } {
  const date = new Date(utc(y, m, d));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const isoYear = date.getUTCFullYear();
  const yearStart = Date.UTC(isoYear, 0, 1);
  const week = Math.ceil(((date.getTime() - yearStart) / MS_PER_DAY + 1) / 7);
  return { week, isoYear };
}

function isoWeeksInYear(y: number): number {
  return getIsoWeek(y, 12, 28).week;
}

function todayLocalString(): string {
  const now = new Date();
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const dd = now.getDate().toString().padStart(2, '0');
  return `${now.getFullYear()}-${mm}-${dd}`;
}

function parseDate(value: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const y = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const d = parseInt(match[3], 10);
  const check = new Date(utc(y, m, d));
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) {
    return null;
  }
  return { y, m, d };
}

function formatLong(ms: number): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(ms));
}

const Stat: React.FC<{ label: string; value: string; hint?: string }> = ({ label, value, hint }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
    <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      {label}
    </span>
    <span className="mt-1 block text-2xl font-extrabold text-slate-900 dark:text-white">{value}</span>
    {hint && <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{hint}</span>}
  </div>
);

export const WeeksIntoTheYear: React.FC = () => {
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    setDateStr(todayLocalString());
  }, []);

  const parsed = useMemo(() => parseDate(dateStr), [dateStr]);

  const data = useMemo(() => {
    if (!parsed) return null;
    const { y, m, d } = parsed;
    const daysInYear = isLeapYear(y) ? 366 : 365;
    const dayOfYear = (utc(y, m, d) - utc(y, 1, 1)) / MS_PER_DAY + 1;
    const iso = getIsoWeek(y, m, d);
    const simpleWeek = Math.ceil(dayOfYear / 7);
    const weeksElapsed = (dayOfYear - 1) / 7;
    const daysLeft = daysInYear - dayOfYear;
    const weeksLeft = daysLeft / 7;
    const percent = (dayOfYear / daysInYear) * 100;

    const dateMs = utc(y, m, d);
    const dow = (new Date(dateMs).getUTCDay() + 6) % 7; // Monday = 0
    const mondayMs = dateMs - dow * MS_PER_DAY;
    const week = WEEKDAYS.map((label, idx) => {
      const ms = mondayMs + idx * MS_PER_DAY;
      return { label, day: new Date(ms).getUTCDate(), isSelected: idx === dow };
    });

    const monthRows = MONTH_NAMES.map((name, idx) => {
      const first = getIsoWeek(y, idx + 1, 1);
      const firstDoy = (utc(y, idx + 1, 1) - utc(y, 1, 1)) / MS_PER_DAY + 1;
      return {
        name,
        isoWeek: first.week,
        isoYear: first.isoYear,
        simpleWeek: Math.ceil(firstDoy / 7),
        isCurrent: idx + 1 === m,
      };
    });

    return {
      y,
      daysInYear,
      dayOfYear,
      iso,
      simpleWeek,
      weeksElapsed,
      daysLeft,
      weeksLeft,
      percent,
      isoWeeksTotal: isoWeeksInYear(y),
      weekdayName: formatLong(dateMs),
      mondayLabel: formatLong(mondayMs),
      sundayLabel: formatLong(mondayMs + 6 * MS_PER_DAY),
      week,
      monthRows,
    };
  }, [parsed]);

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <Input
              label="Pick a date"
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              helperText="Defaults to today. Change it to look up any date."
            />
          </div>
          <Button type="button" variant="outline" onClick={() => setDateStr(todayLocalString())}>
            Use today
          </Button>
        </div>
      </Card>

      {!data && (
        <Card className="text-sm text-slate-500 dark:text-slate-400">
          Enter a valid date to see its week number.
        </Card>
      )}

      {data && (
        <>
          <Card className="bg-linear-to-r from-blue-950 via-slate-900 to-slate-950 border-blue-900/60 text-white">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-xl bg-blue-600/30 text-blue-400">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block">
                  {data.weekdayName}
                </span>
                <p className="mt-1 text-2xl sm:text-3xl font-extrabold">
                  Week {data.iso.week} of {data.isoWeeksTotal}
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  You are {data.weeksElapsed.toFixed(2)} weeks into {data.y}, with{' '}
                  {data.weeksLeft.toFixed(2)} weeks ({data.daysLeft} days) left.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                <span>Year progress</span>
                <span>{data.percent.toFixed(1)}%</span>
              </div>
              <div
                className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden"
                role="progressbar"
                aria-valuenow={Math.round(data.percent)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Percentage of the year completed"
              >
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${data.percent}%` }}
                />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat
              label="ISO week number"
              value={`${data.iso.week}`}
              hint={data.iso.isoYear !== data.y ? `Belongs to ISO year ${data.iso.isoYear}` : 'Monday start, ISO 8601'}
            />
            <Stat label="Simple week count" value={`${data.simpleWeek}`} hint="Counting 7-day blocks from Jan 1" />
            <Stat label="Day of the year" value={`${data.dayOfYear}`} hint={`of ${data.daysInYear} days`} />
            <Stat label="Weeks in this year" value={`${data.isoWeeksTotal}`} hint="ISO 8601 week count" />
          </div>

          <Card className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              This week ({data.mondayLabel.split(',').slice(1).join(',').trim()} to{' '}
              {data.sundayLabel.split(',').slice(1).join(',').trim()})
            </h3>
            <div className="grid grid-cols-7 gap-2 text-center">
              {data.week.map((w) => (
                <div
                  key={w.label}
                  className={`rounded-lg border p-2 ${
                    w.isSelected
                      ? 'border-blue-500 bg-blue-600 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300'
                  }`}
                >
                  <span className="block text-[11px] font-semibold uppercase">{w.label}</span>
                  <span className="block text-lg font-bold">{w.day}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Week numbers on the 1st of each month in {data.y}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-2 pr-4 font-semibold">Month</th>
                    <th className="py-2 pr-4 font-semibold">ISO week</th>
                    <th className="py-2 font-semibold">Simple week</th>
                  </tr>
                </thead>
                <tbody>
                  {data.monthRows.map((row) => (
                    <tr
                      key={row.name}
                      className={`border-b border-slate-100 dark:border-slate-800/70 ${
                        row.isCurrent ? 'bg-blue-50 dark:bg-blue-950/30 font-semibold' : ''
                      }`}
                    >
                      <td className="py-2 pr-4 text-slate-900 dark:text-slate-100">{row.name} 1</td>
                      <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">
                        {row.isoWeek}
                        {row.isoYear !== data.y ? ` (${row.isoYear})` : ''}
                      </td>
                      <td className="py-2 text-slate-700 dark:text-slate-300">{row.simpleWeek}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
