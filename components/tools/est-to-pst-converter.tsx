'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeftRight, Clock } from 'lucide-react';
import {
  dayDifference,
  formatInZone,
  formatTimeOnly,
  getZoneAbbreviation,
  getZoneParts,
  pad2,
  wallTimeToUtc,
} from '@/lib/time-utils';

const EASTERN = 'America/New_York';
const PACIFIC = 'America/Los_Angeles';

type Direction = 'et-to-pt' | 'pt-to-et';

function todayInZone(zone: string): string {
  const p = getZoneParts(Date.now(), zone);
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}`;
}

function nowTimeInZone(zone: string): string {
  const p = getZoneParts(Date.now(), zone);
  return `${pad2(p.hour)}:${pad2(p.minute)}`;
}

export const EstToPstConverter: React.FC = () => {
  const [direction, setDirection] = useState<Direction>('et-to-pt');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('12:00');

  useEffect(() => {
    setDate(todayInZone(EASTERN));
    setTime(nowTimeInZone(EASTERN));
  }, []);

  const fromZone = direction === 'et-to-pt' ? EASTERN : PACIFIC;
  const toZone = direction === 'et-to-pt' ? PACIFIC : EASTERN;

  const instant = useMemo(() => {
    const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    const t = /^(\d{2}):(\d{2})$/.exec(time);
    if (!d || !t) return null;
    return wallTimeToUtc(fromZone, +d[1], +d[2], +d[3], +t[1], +t[2]);
  }, [date, time, fromZone]);

  const result = useMemo(() => {
    if (instant === null) return null;
    return {
      fromAbbr: getZoneAbbreviation(instant, fromZone),
      toAbbr: getZoneAbbreviation(instant, toZone),
      toTime: formatTimeOnly(instant, toZone),
      toFull: formatInZone(instant, toZone),
      fromFull: formatInZone(instant, fromZone),
      dayDiff: dayDifference(instant, fromZone, toZone),
    };
  }, [instant, fromZone, toZone]);

  const hourlyRows = useMemo(() => {
    const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (!d) return [];
    return Array.from({ length: 24 }, (_, hour) => {
      const utc = wallTimeToUtc(fromZone, +d[1], +d[2], +d[3], hour, 0);
      return {
        from: formatTimeOnly(utc, fromZone),
        to: formatTimeOnly(utc, toZone),
        dayDiff: dayDifference(utc, fromZone, toZone),
      };
    });
  }, [date, fromZone, toZone]);

  const swap = () => {
    if (instant !== null) {
      const p = getZoneParts(instant, toZone);
      setDate(`${p.year}-${pad2(p.month)}-${pad2(p.day)}`);
      setTime(`${pad2(p.hour)}:${pad2(p.minute)}`);
    }
    setDirection(direction === 'et-to-pt' ? 'pt-to-et' : 'et-to-pt');
  };

  const useNow = () => {
    setDate(todayInZone(fromZone));
    setTime(nowTimeInZone(fromZone));
  };

  const fromName = direction === 'et-to-pt' ? 'Eastern Time (EST/EDT)' : 'Pacific Time (PST/PDT)';
  const toName = direction === 'et-to-pt' ? 'Pacific Time (PST/PDT)' : 'Eastern Time (EST/EDT)';

  return (
    <div className="space-y-6">
      <Card className="space-y-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[160px] rounded-xl border border-blue-500 bg-blue-50 p-3 dark:bg-blue-950/30">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              From
            </span>
            <span className="block text-sm font-bold text-slate-900 dark:text-white">{fromName}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={swap}
            aria-label="Swap direction"
            leftIcon={<ArrowLeftRight className="w-4 h-4" />}
          >
            Swap
          </Button>
          <div className="flex-1 min-w-[160px] rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              To
            </span>
            <span className="block text-sm font-bold text-slate-900 dark:text-white">{toName}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-4 items-end">
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <Input label="Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          <Button type="button" variant="outline" onClick={useNow} leftIcon={<Clock className="w-4 h-4" />}>
            Current time
          </Button>
        </div>
      </Card>

      {result ? (
        <Card className="bg-linear-to-r from-blue-950 via-slate-900 to-slate-950 border-blue-900/60 text-white space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block">
            {result.fromAbbr} to {result.toAbbr}
          </span>
          <p className="text-3xl sm:text-5xl font-extrabold">
            {result.toTime} <span className="text-xl sm:text-2xl text-blue-300">{result.toAbbr}</span>
          </p>
          <p className="text-sm text-slate-300">
            {result.toFull}
            {result.dayDiff !== 0 && (
              <span className="ml-2 font-semibold text-amber-300">
                ({result.dayDiff > 0 ? 'next day' : 'previous day'})
              </span>
            )}
          </p>
          <p className="pt-3 border-t border-slate-700/70 text-sm text-slate-200">
            {result.fromFull} {result.fromAbbr} equals {result.toTime} {result.toAbbr}. Pacific Time is 3 hours behind
            Eastern Time, apart from a short window on the two daylight saving change days.
          </p>
        </Card>
      ) : (
        <Card className="text-sm text-slate-500 dark:text-slate-400">Enter a valid date and time to convert.</Card>
      )}

      {hourlyRows.length > 0 && (
        <Card className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Full day conversion chart
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-2 pr-4 font-semibold">{direction === 'et-to-pt' ? 'Eastern' : 'Pacific'}</th>
                  <th className="py-2 font-semibold">{direction === 'et-to-pt' ? 'Pacific' : 'Eastern'}</th>
                </tr>
              </thead>
              <tbody>
                {hourlyRows.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/70">
                    <td className="py-1.5 pr-4 text-slate-900 dark:text-slate-100">{row.from}</td>
                    <td className="py-1.5 text-slate-700 dark:text-slate-300">
                      {row.to}
                      {row.dayDiff !== 0 && (
                        <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                          {row.dayDiff > 0 ? '+1 day' : '-1 day'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
