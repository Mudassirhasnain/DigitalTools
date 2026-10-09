'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';

interface ZodiacSign {
  name: string;
  glyph: string;
  range: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
  planet: string;
  traits: string;
}

const SIGNS: Record<string, ZodiacSign> = {
  Aries: {
    name: 'Aries',
    glyph: '\u2648',
    range: 'Mar 21 to Apr 19',
    element: 'Fire',
    modality: 'Cardinal',
    planet: 'Mars',
    traits: 'Bold, energetic, and quick to take the lead.',
  },
  Taurus: {
    name: 'Taurus',
    glyph: '\u2649',
    range: 'Apr 20 to May 20',
    element: 'Earth',
    modality: 'Fixed',
    planet: 'Venus',
    traits: 'Patient, reliable, and driven by comfort and loyalty.',
  },
  Gemini: {
    name: 'Gemini',
    glyph: '\u264A',
    range: 'May 21 to Jun 20',
    element: 'Air',
    modality: 'Mutable',
    planet: 'Mercury',
    traits: 'Curious, talkative, and adaptable to almost anything.',
  },
  Cancer: {
    name: 'Cancer',
    glyph: '\u264B',
    range: 'Jun 21 to Jul 22',
    element: 'Water',
    modality: 'Cardinal',
    planet: 'Moon',
    traits: 'Caring, intuitive, and protective of the people close to them.',
  },
  Leo: {
    name: 'Leo',
    glyph: '\u264C',
    range: 'Jul 23 to Aug 22',
    element: 'Fire',
    modality: 'Fixed',
    planet: 'Sun',
    traits: 'Confident, generous, and happiest in the spotlight.',
  },
  Virgo: {
    name: 'Virgo',
    glyph: '\u264D',
    range: 'Aug 23 to Sep 22',
    element: 'Earth',
    modality: 'Mutable',
    planet: 'Mercury',
    traits: 'Analytical, practical, and attentive to detail.',
  },
  Libra: {
    name: 'Libra',
    glyph: '\u264E',
    range: 'Sep 23 to Oct 22',
    element: 'Air',
    modality: 'Cardinal',
    planet: 'Venus',
    traits: 'Diplomatic, fair-minded, and drawn to harmony.',
  },
  Scorpio: {
    name: 'Scorpio',
    glyph: '\u264F',
    range: 'Oct 23 to Nov 21',
    element: 'Water',
    modality: 'Fixed',
    planet: 'Pluto (traditionally Mars)',
    traits: 'Intense, determined, and deeply private.',
  },
  Sagittarius: {
    name: 'Sagittarius',
    glyph: '\u2650',
    range: 'Nov 22 to Dec 21',
    element: 'Fire',
    modality: 'Mutable',
    planet: 'Jupiter',
    traits: 'Adventurous, optimistic, and always chasing the next horizon.',
  },
  Capricorn: {
    name: 'Capricorn',
    glyph: '\u2651',
    range: 'Dec 22 to Jan 19',
    element: 'Earth',
    modality: 'Cardinal',
    planet: 'Saturn',
    traits: 'Disciplined, ambitious, and steady under pressure.',
  },
  Aquarius: {
    name: 'Aquarius',
    glyph: '\u2652',
    range: 'Jan 20 to Feb 18',
    element: 'Air',
    modality: 'Fixed',
    planet: 'Uranus (traditionally Saturn)',
    traits: 'Independent, inventive, and fond of unconventional ideas.',
  },
  Pisces: {
    name: 'Pisces',
    glyph: '\u2653',
    range: 'Feb 19 to Mar 20',
    element: 'Water',
    modality: 'Mutable',
    planet: 'Neptune (traditionally Jupiter)',
    traits: 'Imaginative, empathetic, and creative.',
  },
};

const ORDER = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

const MONTHS = [
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
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function getSignName(month: number, day: number): string {
  const v = month * 100 + day;
  if (v >= 1222 || v <= 119) return 'Capricorn';
  if (v <= 218) return 'Aquarius';
  if (v <= 320) return 'Pisces';
  if (v <= 419) return 'Aries';
  if (v <= 520) return 'Taurus';
  if (v <= 620) return 'Gemini';
  if (v <= 722) return 'Cancer';
  if (v <= 822) return 'Leo';
  if (v <= 922) return 'Virgo';
  if (v <= 1022) return 'Libra';
  if (v <= 1121) return 'Scorpio';
  return 'Sagittarius';
}

const ELEMENT_STYLES: Record<ZodiacSign['element'], string> = {
  Fire: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300',
  Earth: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  Air: 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
  Water: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
};

export const ZodiacSignCalculator: React.FC = () => {
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);

  useEffect(() => {
    const now = new Date();
    setMonth(now.getMonth() + 1);
    setDay(now.getDate());
  }, []);

  const maxDay = DAYS_IN_MONTH[month - 1];
  const safeDay = Math.min(day, maxDay);

  const sign = useMemo(() => SIGNS[getSignName(month, safeDay)], [month, safeDay]);

  const isCusp = useMemo(() => {
    const previous = getSignName(month, safeDay === 1 ? 1 : safeDay - 1);
    const next = getSignName(month, safeDay === maxDay ? maxDay : safeDay + 1);
    const prevMonthDay = (() => {
      const pm = month === 1 ? 12 : month - 1;
      return getSignName(pm, DAYS_IN_MONTH[pm - 1]);
    })();
    const nextMonthDay = getSignName(month === 12 ? 1 : month + 1, 1);
    const before = safeDay === 1 ? prevMonthDay : previous;
    const after = safeDay === maxDay ? nextMonthDay : next;
    return before !== sign.name || after !== sign.name;
  }, [month, safeDay, maxDay, sign.name]);

  const sameElement = ORDER.filter((n) => SIGNS[n].element === sign.element && n !== sign.name);

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Month"
            value={String(month)}
            onChange={(e) => setMonth(parseInt(e.target.value, 10))}
            options={MONTHS.map((m, idx) => ({ value: String(idx + 1), label: m }))}
          />
          <Select
            label="Day"
            value={String(safeDay)}
            onChange={(e) => setDay(parseInt(e.target.value, 10))}
            options={Array.from({ length: maxDay }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))}
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The zodiac sign depends only on the month and day, so the birth year is not needed. The selection starts on
          today&apos;s date.
        </p>
      </Card>

      <Card className="bg-linear-to-r from-indigo-950 via-slate-900 to-slate-950 border-indigo-900/60 text-white">
        <div className="flex items-center gap-5 flex-wrap">
          <span className="text-7xl leading-none text-indigo-300" aria-hidden="true">
            {sign.glyph}
          </span>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
              {MONTHS[month - 1]} {safeDay} falls under
            </span>
            <p className="text-3xl sm:text-4xl font-extrabold">{sign.name}</p>
            <p className="text-sm text-slate-300 mt-1">{sign.range}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-200">{sign.traits}</p>
        {isCusp && (
          <p className="mt-3 text-xs text-amber-300">
            This date sits on the edge of two signs. The exact switch moves by a day in some years, so a birth time
            and place matter for an exact answer.
          </p>
        )}
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Element', value: sign.element },
          { label: 'Modality', value: sign.modality },
          { label: 'Ruling planet', value: sign.planet },
          { label: 'Other ' + sign.element + ' signs', value: sameElement.join(', ') },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {item.label}
            </span>
            <span className="mt-1 block text-sm font-bold text-slate-900 dark:text-white">{item.value}</span>
          </div>
        ))}
      </div>

      <Card className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          All 12 zodiac signs and their dates
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-2 pr-4 font-semibold">Sign</th>
                <th className="py-2 pr-4 font-semibold">Dates</th>
                <th className="py-2 pr-4 font-semibold">Element</th>
                <th className="py-2 font-semibold">Modality</th>
              </tr>
            </thead>
            <tbody>
              {ORDER.map((name) => {
                const s = SIGNS[name];
                const active = s.name === sign.name;
                return (
                  <tr
                    key={name}
                    className={`border-b border-slate-100 dark:border-slate-800/70 ${
                      active ? 'bg-blue-50 dark:bg-blue-950/30 font-semibold' : ''
                    }`}
                  >
                    <td className="py-2 pr-4 text-slate-900 dark:text-slate-100">
                      <span aria-hidden="true" className="mr-2">
                        {s.glyph}
                      </span>
                      {s.name}
                    </td>
                    <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">{s.range}</td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${ELEMENT_STYLES[s.element]}`}>
                        {s.element}
                      </span>
                    </td>
                    <td className="py-2 text-slate-700 dark:text-slate-300">{s.modality}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Dates follow the common tropical zodiac. Zodiac signs are a cultural tradition and are provided for
          entertainment, not as scientific or predictive advice.
        </p>
      </Card>
    </div>
  );
};
