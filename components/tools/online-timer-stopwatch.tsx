'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Bell,
  BellOff,
  Copy,
  Flag,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Timer as TimerIcon,
  Watch,
  Coffee,
} from 'lucide-react';

type Tab = 'timer' | 'stopwatch' | 'pomodoro';
type Status = 'idle' | 'running' | 'paused' | 'finished';

/* ---------- helpers ---------- */

function pad(n: number, size = 2) {
  return Math.floor(n).toString().padStart(size, '0');
}

function formatClock(ms: number, withCentiseconds = false): string {
  const total = Math.max(0, ms);
  const totalSeconds = withCentiseconds ? Math.floor(total / 1000) : Math.ceil(total / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const base = h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  if (!withCentiseconds) return base;
  return `${base}.${pad(Math.floor((total % 1000) / 10))}`;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

/* ---------- alarm sound ---------- */

function useAlarm(soundOn: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ringing, setRinging] = useState(false);

  const prime = useCallback(() => {
    try {
      if (!ctxRef.current) {
        const AC =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AC) ctxRef.current = new AC();
      }
      void ctxRef.current?.resume();
    } catch {
      // Audio is not available, the visual alert still works
    }
  }, []);

  const beepPattern = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    [0, 0.25, 0.5].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.35, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.18);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.2);
    });
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    intervalRef.current = null;
    stopTimeoutRef.current = null;
    setRinging(false);
  }, []);

  const start = useCallback(() => {
    stop();
    setRinging(true);
    if (soundOn) {
      beepPattern();
      intervalRef.current = setInterval(beepPattern, 1500);
    }
    stopTimeoutRef.current = setTimeout(stop, 30000);
  }, [beepPattern, soundOn, stop]);

  useEffect(() => stop, [stop]);

  return {
    ringing,
    start,
    stop,
    prime,
    test: () => {
      prime();
      beepPattern();
    },
  };
}

/* ---------- countdown hook (uses end timestamps, so it stays accurate in background tabs) ---------- */

function useCountdown(onDone: () => void) {
  const [totalMs, setTotalMs] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [running, setRunning] = useState(false);
  const endRef = useRef(0);
  const doneRef = useRef(onDone);

  useEffect(() => {
    doneRef.current = onDone;
  });

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const rem = endRef.current - Date.now();
      if (rem <= 0) {
        setRemainingMs(0);
        setRunning(false);
        doneRef.current();
      } else {
        setRemainingMs(rem);
      }
    }, 100);
    return () => clearInterval(id);
  }, [running]);

  const setup = useCallback((ms: number) => {
    setTotalMs(ms);
    setRemainingMs(ms);
    setRunning(false);
  }, []);

  const start = useCallback(
    (ms?: number) => {
      const base = ms ?? remainingMs;
      if (base <= 0) return;
      endRef.current = Date.now() + base;
      setRemainingMs(base);
      setRunning(true);
    },
    [remainingMs]
  );

  const pause = useCallback(() => {
    setRemainingMs(Math.max(0, endRef.current - Date.now()));
    setRunning(false);
  }, []);

  const addMs = useCallback(
    (ms: number) => {
      if (running) endRef.current += ms;
      setRemainingMs((r) => r + ms);
      setTotalMs((t) => t + ms);
    },
    [running]
  );

  return { totalMs, remainingMs, running, setup, start, pause, addMs };
}

function useTabTitle(active: boolean, running: boolean, text: string) {
  useEffect(() => {
    if (!active || !running) return;
    const previous = document.title;
    document.title = text;
    return () => {
      document.title = previous;
    };
  }, [active, running, text]);
}

/* ---------- shared UI ---------- */

const ProgressRing: React.FC<{ progress: number; stroke: string; children: React.ReactNode }> = ({
  progress,
  stroke,
  children,
}) => {
  const radius = 108;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative mx-auto w-full max-w-xs aspect-square">
      <svg viewBox="0 0 240 240" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="120" cy="120" r={radius} fill="none" strokeWidth="10" className="stroke-slate-200 dark:stroke-slate-800" />
        <circle
          cx="120"
          cy="120"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          stroke={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - Math.min(1, Math.max(0, progress)))}
          style={{ transition: 'stroke-dashoffset 0.2s linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">{children}</div>
    </div>
  );
};

const AlarmBanner: React.FC<{ message: string; onStop: () => void }> = ({ message, onStop }) => (
  <div
    role="alert"
    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/40"
  >
    <span className="text-base font-bold text-amber-900 dark:text-amber-200">{message}</span>
    <Button type="button" onClick={onStop} variant="primary">
      Stop alarm
    </Button>
  </div>
);

const NumberField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  max: number;
  disabled?: boolean;
}> = ({ label, value, onChange, max, disabled }) => (
  <Input
    label={label}
    type="number"
    inputMode="numeric"
    min={0}
    max={max}
    value={value}
    disabled={disabled}
    onChange={(e) => onChange(e.target.value)}
  />
);

/* ---------- Timer ---------- */

const TIMER_PRESETS = [1, 3, 5, 10, 15, 20, 30, 45, 60];

const TimerPanel: React.FC<{ active: boolean; soundOn: boolean }> = ({ active, soundOn }) => {
  const [h, setH] = useState('0');
  const [m, setM] = useState('5');
  const [s, setS] = useState('0');
  const [label, setLabel] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const alarm = useAlarm(soundOn);
  const countdown = useCountdown(() => {
    setStatus('finished');
    alarm.start();
  });

  const inputMs =
    Math.min(359999, Math.max(0, (parseInt(h, 10) || 0) * 3600 + (parseInt(m, 10) || 0) * 60 + (parseInt(s, 10) || 0))) *
    1000;

  const displayMs = status === 'idle' ? inputMs : countdown.remainingMs;
  const progress = status === 'idle' || countdown.totalMs === 0 ? 1 : countdown.remainingMs / countdown.totalMs;

  useTabTitle(active, countdown.running, `${formatClock(countdown.remainingMs)} ${label || 'Timer'}`);

  const applyPreset = (minutes: number) => {
    if (status === 'running' || status === 'paused') return;
    setH(String(Math.floor(minutes / 60)));
    setM(String(minutes % 60));
    setS('0');
    setStatus('idle');
    alarm.stop();
  };

  const handleStart = () => {
    alarm.prime();
    if (status === 'paused') {
      countdown.start();
      setStatus('running');
      return;
    }
    if (inputMs <= 0) return;
    alarm.stop();
    countdown.setup(inputMs);
    countdown.start(inputMs);
    setStatus('running');
  };

  const handlePause = () => {
    countdown.pause();
    setStatus('paused');
  };

  const handleReset = () => {
    alarm.stop();
    countdown.setup(0);
    setStatus('idle');
  };

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (status === 'running') handlePause();
        else handleStart();
      } else if (e.key.toLowerCase() === 'r') {
        handleReset();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="space-y-5">
      {alarm.ringing && <AlarmBanner message={`${label ? label + ': ' : ''}Time is up!`} onStop={alarm.stop} />}

      <ProgressRing progress={progress} stroke={status === 'finished' ? '#f59e0b' : '#2563eb'}>
        <span
          className="font-mono text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          role="timer"
          aria-label={`Time remaining ${formatClock(displayMs)}`}
        >
          {formatClock(displayMs)}
        </span>
        <span className="mt-2 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {status === 'idle' ? 'Ready' : status === 'running' ? 'Running' : status === 'paused' ? 'Paused' : 'Finished'}
          {label ? ` · ${label}` : ''}
        </span>
      </ProgressRing>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {status === 'running' ? (
          <Button type="button" size="lg" onClick={handlePause} leftIcon={<Pause className="w-5 h-5" />}>
            Pause
          </Button>
        ) : (
          <Button
            type="button"
            size="lg"
            onClick={handleStart}
            disabled={status === 'idle' && inputMs <= 0}
            leftIcon={<Play className="w-5 h-5" />}
          >
            {status === 'paused' ? 'Resume' : 'Start'}
          </Button>
        )}
        <Button type="button" size="lg" variant="outline" onClick={handleReset} leftIcon={<RotateCcw className="w-5 h-5" />}>
          Reset
        </Button>
        {(status === 'running' || status === 'paused') && (
          <>
            <Button type="button" size="lg" variant="ghost" onClick={() => countdown.addMs(60000)}>
              +1 min
            </Button>
            <Button type="button" size="lg" variant="ghost" onClick={() => countdown.addMs(300000)}>
              +5 min
            </Button>
          </>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
        <NumberField label="Hours" value={h} onChange={setH} max={99} disabled={status !== 'idle'} />
        <NumberField label="Minutes" value={m} onChange={setM} max={59} disabled={status !== 'idle'} />
        <NumberField label="Seconds" value={s} onChange={setS} max={59} disabled={status !== 'idle'} />
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {TIMER_PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => applyPreset(p)}
            disabled={status === 'running' || status === 'paused'}
            className="px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600 disabled:opacity-40 disabled:hover:border-slate-300 disabled:hover:text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:text-blue-400 transition-colors"
          >
            {p >= 60 ? `${p / 60} hour` : `${p} min`}
          </button>
        ))}
      </div>

      <div className="max-w-md mx-auto">
        <Input
          label="Label (optional)"
          placeholder="For example: Tea, Workout, Presentation"
          value={label}
          maxLength={40}
          onChange={(e) => setLabel(e.target.value)}
        />
      </div>
    </div>
  );
};

/* ---------- Stopwatch ---------- */

interface Lap {
  index: number;
  split: number;
  total: number;
}

const StopwatchPanel: React.FC<{ active: boolean }> = ({ active }) => {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [copied, setCopied] = useState(false);
  const startRef = useRef(0);
  const baseRef = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed(baseRef.current + (performance.now() - startRef.current)), 33);
    return () => clearInterval(id);
  }, [running]);

  const toggle = useCallback(() => {
    if (running) {
      const total = baseRef.current + (performance.now() - startRef.current);
      baseRef.current = total;
      setElapsed(total);
      setRunning(false);
    } else {
      startRef.current = performance.now();
      setRunning(true);
    }
  }, [running]);

  const lap = useCallback(() => {
    if (!running) return;
    const total = baseRef.current + (performance.now() - startRef.current);
    setLaps((prev) => {
      const previousTotal = prev.length ? prev[0].total : 0;
      return [{ index: prev.length + 1, split: total - previousTotal, total }, ...prev];
    });
  }, [running]);

  const reset = useCallback(() => {
    baseRef.current = 0;
    setElapsed(0);
    setRunning(false);
    setLaps([]);
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        toggle();
      } else if (e.key.toLowerCase() === 'l') {
        lap();
      } else if (e.key.toLowerCase() === 'r') {
        reset();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, toggle, lap, reset]);

  const fastest = laps.length >= 3 ? Math.min(...laps.map((l) => l.split)) : null;
  const slowest = laps.length >= 3 ? Math.max(...laps.map((l) => l.split)) : null;

  const copyLaps = async () => {
    const text = [...laps]
      .reverse()
      .map((l) => `Lap ${l.index}\t${formatClock(l.split, true)}\t${formatClock(l.total, true)}`)
      .join('\n');
    try {
      await navigator.clipboard.writeText(`Lap\tSplit\tTotal\n${text}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard permission denied, ignore
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center py-6">
        <span
          className="font-mono text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white"
          role="timer"
          aria-label={`Elapsed time ${formatClock(elapsed, true)}`}
        >
          {formatClock(elapsed, true)}
        </span>
        <p className="mt-2 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {running ? 'Running' : elapsed > 0 ? 'Stopped' : 'Ready'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          size="lg"
          onClick={toggle}
          leftIcon={running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        >
          {running ? 'Stop' : elapsed > 0 ? 'Resume' : 'Start'}
        </Button>
        <Button type="button" size="lg" variant="outline" onClick={lap} disabled={!running} leftIcon={<Flag className="w-5 h-5" />}>
          Lap
        </Button>
        <Button type="button" size="lg" variant="outline" onClick={reset} disabled={elapsed === 0} leftIcon={<RotateCcw className="w-5 h-5" />}>
          Reset
        </Button>
      </div>

      {laps.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Laps ({laps.length})
            </h3>
            <Button type="button" size="sm" variant="outline" onClick={copyLaps} leftIcon={<Copy className="w-3.5 h-3.5" />}>
              {copied ? 'Copied' : 'Copy laps'}
            </Button>
          </div>
          <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-2 px-3 font-semibold">Lap</th>
                  <th className="py-2 px-3 font-semibold">Split</th>
                  <th className="py-2 px-3 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {laps.map((l) => (
                  <tr key={l.index} className="border-t border-slate-100 dark:border-slate-800/70">
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">#{l.index}</td>
                    <td
                      className={`py-2 px-3 font-semibold ${
                        l.split === fastest
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : l.split === slowest
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {formatClock(l.split, true)}
                      {l.split === fastest ? ' fastest' : l.split === slowest ? ' slowest' : ''}
                    </td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{formatClock(l.total, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        Keyboard shortcuts: Space to start or stop, L for a lap, R to reset.
      </p>
    </div>
  );
};

/* ---------- Pomodoro ---------- */

type Phase = 'focus' | 'short' | 'long';
const PHASE_LABEL: Record<Phase, string> = { focus: 'Focus', short: 'Short break', long: 'Long break' };
const PHASE_COLOR: Record<Phase, string> = { focus: '#2563eb', short: '#10b981', long: '#8b5cf6' };

const PomodoroPanel: React.FC<{ active: boolean; soundOn: boolean }> = ({ active, soundOn }) => {
  const [focusMin, setFocusMin] = useState('25');
  const [shortMin, setShortMin] = useState('5');
  const [longMin, setLongMin] = useState('15');
  const [cycle, setCycle] = useState('4');
  const [autoStart, setAutoStart] = useState(true);
  const [phase, setPhase] = useState<Phase>('focus');
  const [completed, setCompleted] = useState(0);
  const [status, setStatus] = useState<Status>('idle');
  const alarm = useAlarm(soundOn);

  const minutesFor = (p: Phase) => {
    const raw = p === 'focus' ? focusMin : p === 'short' ? shortMin : longMin;
    return Math.min(180, Math.max(1, parseInt(raw, 10) || 1));
  };

  const countdownRef = useRef<ReturnType<typeof useCountdown> | null>(null);
  const countdown = useCountdown(() => {
    const cd = countdownRef.current;
    if (!cd) return;
    alarm.start();
    const sessionsBeforeLong = Math.max(2, parseInt(cycle, 10) || 4);
    let next: Phase;
    if (phase === 'focus') {
      const nextCompleted = completed + 1;
      setCompleted(nextCompleted);
      next = nextCompleted % sessionsBeforeLong === 0 ? 'long' : 'short';
    } else {
      next = 'focus';
    }
    setPhase(next);
    const ms = minutesFor(next) * 60000;
    cd.setup(ms);
    if (autoStart) {
      cd.start(ms);
      setStatus('running');
    } else {
      setStatus('idle');
    }
  });
  countdownRef.current = countdown;

  const idleMs = minutesFor(phase) * 60000;
  const displayMs = status === 'idle' ? idleMs : countdown.remainingMs;
  const totalMs = status === 'idle' ? idleMs : countdown.totalMs || idleMs;
  const progress = totalMs ? displayMs / totalMs : 1;

  useTabTitle(active, countdown.running, `${formatClock(countdown.remainingMs)} ${PHASE_LABEL[phase]}`);

  const handleStart = () => {
    alarm.prime();
    alarm.stop();
    if (status === 'paused') {
      countdown.start();
    } else {
      countdown.setup(idleMs);
      countdown.start(idleMs);
    }
    setStatus('running');
  };

  const handlePause = () => {
    countdown.pause();
    setStatus('paused');
  };

  const goTo = (p: Phase) => {
    alarm.stop();
    setPhase(p);
    countdown.setup(0);
    setStatus('idle');
  };

  const skip = () => {
    const sessionsBeforeLong = Math.max(2, parseInt(cycle, 10) || 4);
    if (phase === 'focus') {
      const n = completed + 1;
      setCompleted(n);
      goTo(n % sessionsBeforeLong === 0 ? 'long' : 'short');
    } else {
      goTo('focus');
    }
  };

  const resetAll = () => {
    alarm.stop();
    setCompleted(0);
    setPhase('focus');
    countdown.setup(0);
    setStatus('idle');
  };

  const sessionsBeforeLong = Math.max(2, parseInt(cycle, 10) || 4);
  const inCycle = completed % sessionsBeforeLong;

  return (
    <div className="space-y-5">
      {alarm.ringing && <AlarmBanner message={`${PHASE_LABEL[phase]} is next. Nice work!`} onStop={alarm.stop} />}

      <div className="flex justify-center gap-2" role="tablist" aria-label="Pomodoro phase">
        {(['focus', 'short', 'long'] as Phase[]).map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={phase === p}
            onClick={() => goTo(p)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
              phase === p
                ? 'border-blue-500 bg-blue-600 text-white'
                : 'border-slate-300 text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            {PHASE_LABEL[p]}
          </button>
        ))}
      </div>

      <ProgressRing progress={progress} stroke={PHASE_COLOR[phase]}>
        <span className="font-mono text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white" role="timer">
          {formatClock(displayMs)}
        </span>
        <span className="mt-2 inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {phase === 'focus' ? <TimerIcon className="w-3.5 h-3.5" /> : <Coffee className="w-3.5 h-3.5" />}
          {PHASE_LABEL[phase]}
        </span>
      </ProgressRing>

      <div
        className="flex items-center justify-center gap-2"
        aria-label={`${inCycle} of ${sessionsBeforeLong} focus sessions done in this cycle`}
      >
        {Array.from({ length: sessionsBeforeLong }, (_, i) => (
          <span key={i} className={`h-3 w-3 rounded-full ${i < inCycle ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`} />
        ))}
        <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{completed} total focus sessions</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {status === 'running' ? (
          <Button type="button" size="lg" onClick={handlePause} leftIcon={<Pause className="w-5 h-5" />}>
            Pause
          </Button>
        ) : (
          <Button type="button" size="lg" onClick={handleStart} leftIcon={<Play className="w-5 h-5" />}>
            {status === 'paused' ? 'Resume' : 'Start'}
          </Button>
        )}
        <Button type="button" size="lg" variant="outline" onClick={skip} leftIcon={<SkipForward className="w-5 h-5" />}>
          Skip
        </Button>
        <Button type="button" size="lg" variant="outline" onClick={resetAll} leftIcon={<RotateCcw className="w-5 h-5" />}>
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-2xl mx-auto">
        <NumberField label="Focus (min)" value={focusMin} onChange={setFocusMin} max={180} disabled={status === 'running'} />
        <NumberField label="Short break" value={shortMin} onChange={setShortMin} max={60} disabled={status === 'running'} />
        <NumberField label="Long break" value={longMin} onChange={setLongMin} max={90} disabled={status === 'running'} />
        <NumberField label="Sessions per cycle" value={cycle} onChange={setCycle} max={12} disabled={status === 'running'} />
      </div>
      <label className="flex items-center justify-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={autoStart}
          onChange={(e) => setAutoStart(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        Start the next phase automatically
      </label>
    </div>
  );
};

/* ---------- Main component ---------- */

export const OnlineTimerStopwatch: React.FC = () => {
  const [tab, setTab] = useState<Tab>('timer');
  const [soundOn, setSoundOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const testAlarm = useAlarm(true);

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === wrapperRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await wrapperRef.current?.requestFullscreen();
    } catch {
      // Fullscreen not available, ignore
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'timer', label: 'Timer', icon: <TimerIcon className="w-4 h-4" /> },
    { id: 'stopwatch', label: 'Stopwatch', icon: <Watch className="w-4 h-4" /> },
    { id: 'pomodoro', label: 'Pomodoro', icon: <Coffee className="w-4 h-4" /> },
  ];

  return (
    <div
      ref={wrapperRef}
      className={`${isFullscreen ? 'h-screen w-screen overflow-y-auto bg-slate-50 p-6 dark:bg-slate-950' : ''}`}
    >
      <Card className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg border border-slate-300 p-0.5 dark:border-slate-700" role="tablist" aria-label="Tool mode">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                  tab === t.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setSoundOn(!soundOn)}
              aria-pressed={soundOn}
              leftIcon={soundOn ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
            >
              Sound {soundOn ? 'on' : 'off'}
            </Button>
            {soundOn && (
              <Button type="button" size="sm" variant="ghost" onClick={testAlarm.test}>
                Test sound
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={toggleFullscreen}
              leftIcon={isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            >
              {isFullscreen ? 'Exit' : 'Full screen'}
            </Button>
          </div>
        </div>

        {/* All panels stay mounted so a running timer keeps going when you switch tabs */}
        <div className={tab === 'timer' ? '' : 'hidden'}>
          <TimerPanel active={tab === 'timer'} soundOn={soundOn} />
        </div>
        <div className={tab === 'stopwatch' ? '' : 'hidden'}>
          <StopwatchPanel active={tab === 'stopwatch'} />
        </div>
        <div className={tab === 'pomodoro' ? '' : 'hidden'}>
          <PomodoroPanel active={tab === 'pomodoro'} soundOn={soundOn} />
        </div>
      </Card>
    </div>
  );
};
