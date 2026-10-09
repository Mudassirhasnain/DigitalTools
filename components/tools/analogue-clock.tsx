'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Maximize2, Minimize2, Shuffle } from 'lucide-react';
import { getLocalZone, getZoneParts, pad2, zonesWithLocal } from '@/lib/time-utils';

type ThemeId = 'classic' | 'dark' | 'ocean';
type Numerals = 'arabic' | 'roman' | 'none';

const THEMES: Record<ThemeId, { face: string; rim: string; ticks: string; text: string; hands: string; second: string; page: string }> = {
  classic: {
    face: '#ffffff',
    rim: '#1e293b',
    ticks: '#334155',
    text: '#0f172a',
    hands: '#0f172a',
    second: '#dc2626',
    page: '#f1f5f9',
  },
  dark: {
    face: '#0b1120',
    rim: '#475569',
    ticks: '#94a3b8',
    text: '#f1f5f9',
    hands: '#f8fafc',
    second: '#f59e0b',
    page: '#020617',
  },
  ocean: {
    face: '#e0f2fe',
    rim: '#0369a1',
    ticks: '#0c4a6e',
    text: '#0c4a6e',
    hands: '#082f49',
    second: '#e11d48',
    page: '#bae6fd',
  },
};

const ROMAN = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

function polar(angleDeg: number, radius: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: 100 + radius * Math.sin(rad), y: 100 - radius * Math.cos(rad) };
}

interface ClockFaceProps {
  hours: number;
  minutes: number;
  seconds: number;
  showSeconds: boolean;
  numerals: Numerals;
  theme: ThemeId;
  label: string;
}

const ClockFace: React.FC<ClockFaceProps> = ({ hours, minutes, seconds, showSeconds, numerals, theme, label }) => {
  const t = THEMES[theme];
  const secAngle = seconds * 6;
  const minAngle = (minutes + seconds / 60) * 6;
  const hourAngle = ((hours % 12) + minutes / 60 + seconds / 3600) * 30;

  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={label} className="w-full h-auto">
      <circle cx="100" cy="100" r="97" fill={t.face} stroke={t.rim} strokeWidth="5" />
      {Array.from({ length: 60 }, (_, i) => {
        const major = i % 5 === 0;
        const outer = polar(i * 6, 90);
        const inner = polar(i * 6, major ? 80 : 85);
        return (
          <line
            key={i}
            x1={outer.x}
            y1={outer.y}
            x2={inner.x}
            y2={inner.y}
            stroke={t.ticks}
            strokeWidth={major ? 2.2 : 0.9}
            strokeLinecap="round"
          />
        );
      })}
      {numerals !== 'none' &&
        Array.from({ length: 12 }, (_, i) => {
          const n = i === 0 ? 12 : i;
          const pos = polar(i * 30, numerals === 'roman' ? 67 : 68);
          return (
            <text
              key={i}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={numerals === 'roman' ? 11 : 15}
              fontWeight={600}
              fill={t.text}
              fontFamily="Inter, system-ui, sans-serif"
            >
              {numerals === 'roman' ? ROMAN[i] : n}
            </text>
          );
        })}

      {/* Hour hand */}
      <g transform={`rotate(${hourAngle} 100 100)`}>
        <line x1="100" y1="108" x2="100" y2="56" stroke={t.hands} strokeWidth="6" strokeLinecap="round" />
      </g>
      {/* Minute hand */}
      <g transform={`rotate(${minAngle} 100 100)`}>
        <line x1="100" y1="110" x2="100" y2="30" stroke={t.hands} strokeWidth="4" strokeLinecap="round" />
      </g>
      {/* Second hand */}
      {showSeconds && (
        <g transform={`rotate(${secAngle} 100 100)`}>
          <line x1="100" y1="118" x2="100" y2="22" stroke={t.second} strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="100" cy="100" r="3.4" fill={t.second} />
        </g>
      )}
      <circle cx="100" cy="100" r="3.2" fill={t.hands} />
      {showSeconds && <circle cx="100" cy="100" r="1.4" fill={t.face} />}
    </svg>
  );
};

export const AnalogueClock: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [localZone, setLocalZone] = useState('UTC');
  const [zone, setZone] = useState('UTC');
  const [mode, setMode] = useState<'live' | 'practice'>('live');
  const [theme, setTheme] = useState<ThemeId>('classic');
  const [numerals, setNumerals] = useState<Numerals>('arabic');
  const [showSeconds, setShowSeconds] = useState(true);
  const [smooth, setSmooth] = useState(true);
  const [showDigital, setShowDigital] = useState(true);
  const [now, setNow] = useState<number>(0);
  const [practiceTime, setPracticeTime] = useState('10:10');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const local = getLocalZone();
    setLocalZone(local);
    setZone(local);
    setNow(Date.now());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || mode !== 'live') return;
    const interval = setInterval(() => setNow(Date.now()), smooth && showSeconds ? 50 : 250);
    return () => clearInterval(interval);
  }, [mounted, mode, smooth, showSeconds]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === wrapperRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await wrapperRef.current?.requestFullscreen();
      }
    } catch {
      // Fullscreen is not available in this browser, ignore
    }
  };

  const zoneOptions = useMemo(
    () => zonesWithLocal(localZone).map((z) => ({ value: z.id, label: z.label })),
    [localZone]
  );

  const display = useMemo(() => {
    if (mode === 'practice') {
      const m = /^(\d{2}):(\d{2})$/.exec(practiceTime);
      const h = m ? parseInt(m[1], 10) : 10;
      const min = m ? parseInt(m[2], 10) : 10;
      return { hours: h, minutes: min, seconds: 0, dateText: '' };
    }
    if (!mounted) return { hours: 10, minutes: 10, seconds: 0, dateText: '' };
    const p = getZoneParts(now, zone);
    const ms = now % 1000;
    const seconds = smooth && showSeconds ? p.second + ms / 1000 : p.second;
    const dateText = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(now));
    return { hours: p.hour, minutes: p.minute, seconds, dateText };
  }, [mode, practiceTime, mounted, now, zone, smooth, showSeconds]);

  const digitalText = (() => {
    const h24 = display.hours;
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    const suffix = h24 >= 12 ? 'PM' : 'AM';
    const base = `${h12}:${pad2(display.minutes)}`;
    return showSeconds && mode === 'live'
      ? `${base}:${pad2(Math.floor(display.seconds))} ${suffix}`
      : `${base} ${suffix}`;
  })();

  const randomTime = () => {
    const h = Math.floor(Math.random() * 12) + 1;
    const m = Math.floor(Math.random() * 12) * 5;
    setPracticeTime(`${pad2(h)}:${pad2(m)}`);
    setShowDigital(false);
  };

  const setMinutes = (min: number) => {
    const m = /^(\d{2}):(\d{2})$/.exec(practiceTime);
    const h = m ? m[1] : '10';
    setPracticeTime(`${h}:${pad2(min)}`);
  };

  const zoneName = zoneOptions.find((z) => z.value === zone)?.label ?? zone;
  const t = THEMES[theme];

  return (
    <div className="space-y-6">
      <div
        ref={wrapperRef}
        className={`rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-4 p-4 sm:p-8 ${
          isFullscreen ? 'h-screen w-screen rounded-none border-0' : ''
        }`}
        style={{ backgroundColor: t.page }}
      >
        <div className="w-full" style={{ maxWidth: isFullscreen ? 'min(80vh, 80vw)' : '28rem' }}>
          <ClockFace
            hours={display.hours}
            minutes={display.minutes}
            seconds={display.seconds}
            showSeconds={showSeconds && mode === 'live'}
            numerals={numerals}
            theme={theme}
            label={`Analogue clock showing ${digitalText}`}
          />
        </div>

        {showDigital && (
          <div className="text-center" style={{ color: t.text }}>
            <p className="text-2xl sm:text-3xl font-bold font-mono tracking-wide">{digitalText}</p>
            {mode === 'live' && display.dateText && (
              <p className="text-sm opacity-80 mt-1">
                {display.dateText} ({zoneName})
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={toggleFullscreen}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-400/50 hover:bg-slate-500/10 transition-colors"
          style={{ color: t.text }}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          {isFullscreen ? 'Exit full screen' : 'Full screen'}
        </button>
      </div>

      <Card className="space-y-5">
        <div className="flex gap-2">
          {(
            [
              { id: 'live', label: 'Live clock' },
              { id: 'practice', label: 'Learn to tell time' },
            ] as { id: 'live' | 'practice'; label: string }[]
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              aria-pressed={mode === m.id}
              className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-colors ${
                mode === m.id
                  ? 'border-blue-500 bg-blue-600 text-white'
                  : 'border-slate-300 text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === 'live' ? (
          <Select
            label="Time zone"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            options={zoneOptions}
          />
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
              <Input
                label="Set the time on the clock"
                type="time"
                value={practiceTime}
                onChange={(e) => setPracticeTime(e.target.value)}
              />
              <Button type="button" variant="outline" onClick={randomTime} leftIcon={<Shuffle className="w-4 h-4" />}>
                Random time
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "O'clock", min: 0 },
                { label: 'Quarter past', min: 15 },
                { label: 'Half past', min: 30 },
                { label: 'Quarter to', min: 45 },
              ].map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => setMinutes(q.min)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:text-blue-400 transition-colors"
                >
                  {q.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Teachers and parents: press Random time, hide the digital readout, and ask the learner to read the clock
              before revealing the answer.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Clock style"
            value={theme}
            onChange={(e) => setTheme(e.target.value as ThemeId)}
            options={[
              { value: 'classic', label: 'Classic white' },
              { value: 'dark', label: 'Dark' },
              { value: 'ocean', label: 'Ocean blue' },
            ]}
          />
          <Select
            label="Numbers"
            value={numerals}
            onChange={(e) => setNumerals(e.target.value as Numerals)}
            options={[
              { value: 'arabic', label: 'Numbers (1 to 12)' },
              { value: 'roman', label: 'Roman numerals' },
              { value: 'none', label: 'No numbers' },
            ]}
          />
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {[
            {
              id: 'seconds',
              label: 'Show second hand',
              checked: showSeconds,
              set: setShowSeconds,
              disabled: mode === 'practice',
            },
            {
              id: 'smooth',
              label: 'Smooth sweeping second hand',
              checked: smooth,
              set: setSmooth,
              disabled: mode === 'practice' || !showSeconds,
            },
            { id: 'digital', label: 'Show digital time', checked: showDigital, set: setShowDigital, disabled: false },
          ].map((opt) => (
            <label
              key={opt.id}
              className={`flex items-center gap-2.5 text-sm cursor-pointer select-none ${
                opt.disabled ? 'opacity-50' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={opt.checked}
                disabled={opt.disabled}
                onChange={(e) => opt.set(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
};
