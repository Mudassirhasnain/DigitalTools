'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Calendar, Cake, Clock, Heart, Moon, Compass, Sparkles, ArrowLeftRight, Award } from 'lucide-react';

const ZODIAC_SIGNS = [
  { name: 'Capricorn', symbol: '♑', element: 'Earth', start: [12, 22], end: [1, 19] },
  { name: 'Aquarius', symbol: '♒', element: 'Air', start: [1, 20], end: [2, 18] },
  { name: 'Pisces', symbol: '♓', element: 'Water', start: [2, 19], end: [3, 20] },
  { name: 'Aries', symbol: '♈', element: 'Fire', start: [3, 21], end: [4, 19] },
  { name: 'Taurus', symbol: '♉', element: 'Earth', start: [4, 20], end: [5, 20] },
  { name: 'Gemini', symbol: '♊', element: 'Air', start: [5, 21], end: [6, 20] },
  { name: 'Cancer', symbol: '♋', element: 'Water', start: [6, 21], end: [7, 22] },
  { name: 'Leo', symbol: '♌', element: 'Fire', start: [7, 23], end: [8, 22] },
  { name: 'Virgo', symbol: '♍', element: 'Earth', start: [8, 23], end: [9, 22] },
  { name: 'Libra', symbol: '♎', element: 'Air', start: [9, 23], end: [10, 22] },
  { name: 'Scorpio', symbol: '♏', element: 'Water', start: [10, 23], end: [11, 21] },
  { name: 'Sagittarius', symbol: '♐', element: 'Fire', start: [11, 22], end: [12, 21] },
];

const CHINESE_ZODIAC = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];

function getZodiac(month: number, day: number) {
  for (const sign of ZODIAC_SIGNS) {
    const [sm, sd] = sign.start;
    const [em, ed] = sign.end;
    if (sm === 12 && em === 1) {
      if ((month === 12 && day >= sd) || (month === 1 && day <= ed)) return sign;
    } else if ((month === sm && day >= sd) || (month === em && day <= ed)) {
      return sign;
    }
  }
  return ZODIAC_SIGNS[0];
}

export const ExactAgeCalculator: React.FC = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [birthDateStr, setBirthDateStr] = useState<string>('1998-06-15');
  const [targetDateStr, setTargetDateStr] = useState<string>(todayStr);
  const [liveSeconds, setLiveSeconds] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Compare Tab State
  const [calcMode, setCalcMode] = useState<'individual' | 'compare'>('individual');
  const [personADate, setPersonADate] = useState<string>('1995-03-20');
  const [personBDate, setPersonBDate] = useState<string>('1998-08-14');

  // Live ticking
  useEffect(() => {
    if (!liveSeconds) return;
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [liveSeconds]);

  const birthDate = new Date(birthDateStr);
  const targetDate = new Date(targetDateStr);

  const isValid =
    !isNaN(birthDate.getTime()) &&
    !isNaN(targetDate.getTime()) &&
    targetDate >= birthDate;

  let years = 0;
  let months = 0;
  let days = 0;
  let totalDays = 0;
  let totalWeeks = 0;
  let totalHours = 0;
  let totalMinutes = 0;
  let totalSeconds = 0;
  let dayOfWeekBorn = '';
  let daysUntilBirthday = 0;
  let upcomingBirthdays: { year: number; dayOfWeek: string; dateStr: string }[] = [];
  let zodiacSign = ZODIAC_SIGNS[0];
  let chineseZodiac = '';

  if (isValid) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    dayOfWeekBorn = daysOfWeek[birthDate.getUTCDay()];

    const bYear = birthDate.getFullYear();
    const bMonth = birthDate.getMonth();
    const bDay = birthDate.getDate();

    const tYear = targetDate.getFullYear();
    const tMonth = targetDate.getMonth();
    const tDay = targetDate.getDate();

    years = tYear - bYear;
    months = tMonth - bMonth;
    days = tDay - bDay;

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(tYear, tMonth, 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const diffMs = targetDate.getTime() - birthDate.getTime();
    totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    totalWeeks = Math.floor(totalDays / 7);
    totalHours = totalDays * 24;
    totalMinutes = totalHours * 60;
    totalSeconds = totalMinutes * 60;

    // Next Birthday
    const nextBday = new Date(tYear, bMonth, bDay);
    if (nextBday < targetDate) {
      nextBday.setFullYear(tYear + 1);
    }
    const bdayDiffMs = nextBday.getTime() - targetDate.getTime();
    daysUntilBirthday = Math.ceil(bdayDiffMs / (1000 * 60 * 60 * 24));

    // Next 5 Birthdays
    upcomingBirthdays = [];
    const baseNextYear = nextBday.getFullYear();
    for (let i = 0; i < 5; i++) {
      const yr = baseNextYear + i;
      const d = new Date(yr, bMonth, bDay);
      upcomingBirthdays.push({
        year: yr,
        dayOfWeek: daysOfWeek[d.getDay()],
        dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      });
    }

    // Zodiac
    zodiacSign = getZodiac(bMonth + 1, bDay);
    chineseZodiac = CHINESE_ZODIAC[(bYear - 4) % 12];
  }

  // Milestones
  const milestone10k = new Date(birthDate.getTime() + 10000 * 24 * 60 * 60 * 1000);
  const milestone1BillionSec = new Date(birthDate.getTime() + 1000000000 * 1000);

  // Age difference comparison
  const diffComparison = () => {
    const a = new Date(personADate);
    const b = new Date(personBDate);
    if (isNaN(a.getTime()) || isNaN(b.getTime())) return null;

    const older = a < b ? a : b;
    const younger = a < b ? b : a;

    let y = younger.getFullYear() - older.getFullYear();
    let m = younger.getMonth() - older.getMonth();
    let d = younger.getDate() - older.getDate();

    if (d < 0) {
      m -= 1;
      const prev = new Date(younger.getFullYear(), younger.getMonth(), 0);
      d += prev.getDate();
    }
    if (m < 0) {
      y -= 1;
      m += 12;
    }

    const diffDays = Math.floor(Math.abs(b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
    return {
      years: y,
      months: m,
      days: d,
      totalDays: diffDays,
      olderName: a < b ? 'Person A' : 'Person B',
      youngerName: a < b ? 'Person B' : 'Person A',
    };
  };

  const compResult = diffComparison();

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setCalcMode('individual')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            calcMode === 'individual'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Cake className="w-3.5 h-3.5" />
          <span>Individual Exact Age</span>
        </button>
        <button
          type="button"
          onClick={() => setCalcMode('compare')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            calcMode === 'compare'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Compare Two Birthdays</span>
        </button>
      </div>

      {calcMode === 'individual' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Date Inputs */}
            <Card className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Select Dates</span>
              </h2>

              <Input
                label="Date of Birth"
                type="date"
                value={birthDateStr}
                onChange={(e) => setBirthDateStr(e.target.value)}
              />

              <Input
                label="Age at Date (Default: Today)"
                type="date"
                value={targetDateStr}
                onChange={(e) => setTargetDateStr(e.target.value)}
              />

              {isValid && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">Day of the Week Born:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{dayOfWeekBorn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">Western Zodiac Sign:</span>
                    <span>{zodiacSign.symbol} {zodiacSign.name} ({zodiacSign.element})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">Chinese Zodiac:</span>
                    <span>Year of the {chineseZodiac}</span>
                  </div>
                </div>
              )}
            </Card>

            {/* Primary Age Display */}
            {isValid ? (
              <Card className="space-y-5 bg-linear-to-br from-slate-900 to-slate-950 text-white border-slate-800">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Chronological Age
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 mt-1">
                    {years} Years, {months} Months, {days} Days
                  </div>
                  {liveSeconds && targetDateStr === todayStr && (
                    <div className="text-xs font-mono text-slate-400 mt-1">
                      {currentTime.toLocaleTimeString()} live ticking
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-800/60">
                    <span className="text-slate-400 block text-[11px]">Total Days Elapsed</span>
                    <span className="text-base font-bold text-slate-100 mt-0.5 block font-mono">
                      {totalDays.toLocaleString()} days
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/60">
                    <span className="text-slate-400 block text-[11px]">Total Weeks Lived</span>
                    <span className="text-base font-bold text-slate-100 mt-0.5 block font-mono">
                      {totalWeeks.toLocaleString()} weeks
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/60">
                    <span className="text-slate-400 block text-[11px]">Total Hours Lived</span>
                    <span className="text-base font-bold text-slate-100 mt-0.5 block font-mono">
                      {totalHours.toLocaleString()} hours
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-800/60">
                    <span className="text-slate-400 block text-[11px]">Next Birthday In</span>
                    <span className="text-base font-bold text-emerald-400 mt-0.5 block font-mono">
                      {daysUntilBirthday} days
                    </span>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center text-slate-400">
                <p className="text-sm">Please select a valid date of birth before the target date.</p>
              </Card>
            )}
          </div>

          {/* Deep Life Statistics & Milestones */}
          {isValid && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Estimated Life Stats */}
              <Card className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Estimated Biological & Life Stats</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-slate-500 block text-[11px]">Heartbeats</span>
                    <span className="text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5 block font-mono">
                      {Math.round(totalMinutes * 75).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400">@ 75 bpm avg</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-slate-500 block text-[11px]">Breaths Taken</span>
                    <span className="text-base font-bold text-blue-600 dark:text-blue-400 mt-0.5 block font-mono">
                      {Math.round(totalMinutes * 16).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400">@ 16 bpm avg</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                    <span className="text-slate-500 block text-[11px]">Sleep Time</span>
                    <span className="text-base font-bold text-purple-600 dark:text-purple-400 mt-0.5 block font-mono">
                      {Math.round(totalDays * 8).toLocaleString()} hrs
                    </span>
                    <span className="text-[10px] text-slate-400">~{Math.round(years * 0.33)} years asleep</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">10,000 Days Milestone:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      {milestone10k.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">1 Billion Seconds Milestone:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      {milestone1BillionSec.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Next 5 Birthdays Table */}
              <Card className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Cake className="w-4 h-4 text-emerald-500" />
                  <span>Upcoming 5 Birthday Calendar Schedule</span>
                </h3>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {upcomingBirthdays.map((b) => (
                    <div key={b.year} className="py-2 flex justify-between items-center">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Turning {b.year - birthDate.getFullYear()} ({b.year})
                      </span>
                      <div className="text-right">
                        <span className="font-bold text-blue-600 dark:text-blue-400">{b.dayOfWeek}</span>
                        <span className="text-slate-400 ml-2 font-mono text-[11px]">{b.dateStr}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      ) : (
        /* Compare Two Birthdays Mode */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <Card className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Person A
              </h2>
              <Input
                label="Date of Birth"
                type="date"
                value={personADate}
                onChange={(e) => setPersonADate(e.target.value)}
              />
            </Card>

            <Card className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Person B
              </h2>
              <Input
                label="Date of Birth"
                type="date"
                value={personBDate}
                onChange={(e) => setPersonBDate(e.target.value)}
              />
            </Card>
          </div>

          {compResult && (
            <Card className="space-y-4 bg-linear-to-br from-slate-900 to-slate-950 text-white border-slate-800">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                Calculated Age Difference
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-400">
                {compResult.years} Years, {compResult.months} Months, {compResult.days} Days
              </div>
              <p className="text-xs text-slate-300">
                <strong>{compResult.olderName}</strong> is older than <strong>{compResult.youngerName}</strong> by an exact difference of{' '}
                <strong>{compResult.totalDays.toLocaleString()} calendar days</strong>.
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
