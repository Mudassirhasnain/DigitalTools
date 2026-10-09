'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeftRight, Clock } from 'lucide-react';
import {
  ZONES,
  dayDifference,
  describeOffsetDifference,
  formatInZone,
  getLocalZone,
  getOffsetMinutes,
  getZoneAbbreviation,
  nowInZoneInputValue,
  wallTimeToUtc,
  zonesWithLocal,
} from '@/lib/time-utils';

const WORLD_CLOCK_ZONES = [
  'America/Los_Angeles',
  'America/New_York',
  'Europe/London',
  'Europe/Paris',
  'Asia/Dubai',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
];

const zoneLabel = (id: string) => ZONES.find((z) => z.id === id)?.label ?? id.replace(/_/g, ' ');
const cityName = (id: string) => (id === 'UTC' ? 'UTC' : id.split('/').pop()!.replace(/_/g, ' '));

export const TimeDifferenceConverter: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [localZone, setLocalZone] = useState('UTC');
  const [fromZone, setFromZone] = useState('UTC');
  const [toZone, setToZone] = useState('America/New_York');
  const [dateTime, setDateTime] = useState('');

  useEffect(() => {
    const local = getLocalZone();
    setLocalZone(local);
    setFromZone(local);
    setToZone(local === 'America/New_York' ? 'Europe/London' : 'America/New_York');
    setDateTime(nowInZoneInputValue(local));
    setMounted(true);
  }, []);

  const options = useMemo(
    () => zonesWithLocal(localZone).map((z) => ({ value: z.id, label: z.label })),
    [localZone]
  );

  const instant = useMemo(() => {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(dateTime);
    if (!match) return null;
    const [, y, mo, d, h, mi] = match.map(Number) as unknown as number[];
    return wallTimeToUtc(fromZone, y, mo, d, h, mi);
  }, [dateTime, fromZone]);

  const swap = () => {
    if (instant !== null) {
      setDateTime(nowInZoneInputValue(toZone, instant));
    }
    setFromZone(toZone);
    setToZone(fromZone);
  };

  const useNow = () => setDateTime(nowInZoneInputValue(fromZone));

  const summary = useMemo(() => {
    if (instant === null) return null;
    const offFrom = getOffsetMinutes(fromZone, instant);
    const offTo = getOffsetMinutes(toZone, instant);
    const diff = offTo - offFrom;
    const dayDiff = dayDifference(instant, fromZone, toZone);
    return {
      converted: formatInZone(instant, toZone),
      source: formatInZone(instant, fromZone),
      fromAbbr: getZoneAbbreviation(instant, fromZone),
      toAbbr: getZoneAbbreviation(instant, toZone),
      diff,
      dayDiff,
      fromUtc: offFrom,
      toUtc: offTo,
    };
  }, [instant, fromZone, toZone]);

  const formatUtcOffset = (mins: number) => {
    const sign = mins >= 0 ? '+' : '-';
    const abs = Math.abs(mins);
    return `UTC${sign}${Math.floor(abs / 60)}${abs % 60 ? ':' + String(abs % 60).padStart(2, '0') : ''}`;
  };

  return (
    <div className="space-y-6">
      <Card className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
          <Select
            label="From time zone"
            value={fromZone}
            onChange={(e) => setFromZone(e.target.value)}
            options={options}
          />
          <Button
            type="button"
            variant="outline"
            onClick={swap}
            aria-label="Swap time zones"
            className="md:mb-0"
            leftIcon={<ArrowLeftRight className="w-4 h-4" />}
          >
            Swap
          </Button>
          <Select
            label="To time zone"
            value={toZone}
            onChange={(e) => setToZone(e.target.value)}
            options={options}
          />
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <Input
              label={`Date and time in ${cityName(fromZone)}`}
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
            />
          </div>
          <Button type="button" variant="outline" onClick={useNow} leftIcon={<Clock className="w-4 h-4" />}>
            Use current time
          </Button>
        </div>
      </Card>

      {mounted && summary && instant !== null && (
        <>
          <Card className="bg-linear-to-r from-blue-950 via-slate-900 to-slate-950 border-blue-900/60 text-white space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block">
              Time in {cityName(toZone)}
            </span>
            <p className="text-2xl sm:text-4xl font-extrabold leading-tight">{summary.converted}</p>
            <p className="text-sm text-slate-300">
              {summary.toAbbr} ({formatUtcOffset(summary.toUtc)})
              {summary.dayDiff !== 0 && (
                <>
                  {' '}
                  <span className="font-semibold text-amber-300">
                    {summary.dayDiff > 0
                      ? `${summary.dayDiff} day${summary.dayDiff > 1 ? 's' : ''} later`
                      : `${Math.abs(summary.dayDiff)} day${summary.dayDiff < -1 ? 's' : ''} earlier`}
                  </span>
                </>
              )}
            </p>
            <div className="pt-3 border-t border-slate-700/70 text-sm text-slate-200">
              {summary.diff === 0 ? (
                <>
                  {cityName(fromZone)} and {cityName(toZone)} are on the same time right now.
                </>
              ) : (
                <>
                  {cityName(toZone)} is{' '}
                  <strong className="text-white">{describeOffsetDifference(summary.diff)}</strong>{' '}
                  {summary.diff > 0 ? 'ahead of' : 'behind'} {cityName(fromZone)} on this date.
                </>
              )}
            </div>
          </Card>

          <Card className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Source time
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {summary.source} in {zoneLabel(fromZone)} ({summary.fromAbbr}, {formatUtcOffset(summary.fromUtc)}).
            </p>
          </Card>

          <Card className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              The same moment around the world
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-2 pr-4 font-semibold">City</th>
                    <th className="py-2 pr-4 font-semibold">Local time</th>
                    <th className="py-2 font-semibold">Offset</th>
                  </tr>
                </thead>
                <tbody>
                  {WORLD_CLOCK_ZONES.map((z) => (
                    <tr key={z} className="border-b border-slate-100 dark:border-slate-800/70">
                      <td className="py-2 pr-4 font-medium text-slate-900 dark:text-slate-100">{cityName(z)}</td>
                      <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">
                        {formatInZone(instant, z, { year: undefined })} {getZoneAbbreviation(instant, z)}
                      </td>
                      <td className="py-2 text-slate-700 dark:text-slate-300">
                        {formatUtcOffset(getOffsetMinutes(z, instant))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {mounted && instant === null && (
        <Card className="text-sm text-slate-500 dark:text-slate-400">
          Enter a valid date and time to see the conversion.
        </Card>
      )}
    </div>
  );
};
