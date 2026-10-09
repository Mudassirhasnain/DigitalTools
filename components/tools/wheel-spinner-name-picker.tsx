'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowDownAZ, Copy, Dices, Eraser, Shuffle, Trophy, Users, Volume2, VolumeX } from 'lucide-react';

type Tab = 'wheel' | 'picker' | 'teams';

interface Entry {
  id: number; // index in the visible entry list
  line: number; // index in the raw text lines
  label: string;
  weight: number;
}

const PALETTE = ['#2563eb', '#db2777', '#059669', '#d97706', '#7c3aed', '#0891b2', '#dc2626', '#4f46e5', '#65a30d', '#c026d3'];
const STORAGE_KEY = 'digitaltoools-wheel-entries';
const MAX_ENTRIES = 500;

const DEFAULT_ENTRIES = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Riley'].join('\n');

const PRESETS: { label: string; entries: string[] }[] = [
  { label: 'Yes or No', entries: ['Yes', 'No'] },
  { label: 'Yes, No, Maybe', entries: ['Yes', 'No', 'Maybe'] },
  { label: 'Dice (1 to 6)', entries: ['1', '2', '3', '4', '5', '6'] },
  { label: 'Weekdays', entries: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  { label: 'Truth or dare', entries: ['Truth', 'Dare'] },
  { label: 'Lunch ideas', entries: ['Pizza', 'Burgers', 'Sushi', 'Salad', 'Tacos', 'Pasta', 'Biryani'] },
];

/* ---------- random helpers ---------- */

function secureFloat(): number {
  const buf = new Uint32Array(2);
  crypto.getRandomValues(buf);
  return ((buf[0] >>> 5) * 67108864 + (buf[1] >>> 6)) / 9007199254740992;
}

function secureInt(maxExclusive: number): number {
  return Math.floor(secureFloat() * maxExclusive);
}

function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickWeighted(items: { weight: number }[]): number {
  const total = items.reduce((sum, it) => sum + it.weight, 0);
  let r = secureFloat() * total;
  for (let i = 0; i < items.length; i++) {
    r -= items[i].weight;
    if (r < 0) return i;
  }
  return items.length - 1;
}

/* ---------- parsing ---------- */

function parseEntries(raw: string): { entries: Entry[]; truncated: boolean } {
  const lines = raw.split(/\r?\n/);
  const entries: Entry[] = [];
  let truncated = false;
  lines.forEach((line, lineIdx) => {
    const text = line.trim();
    if (!text) return;
    if (entries.length >= MAX_ENTRIES) {
      truncated = true;
      return;
    }
    let label = text;
    let weight = 1;
    const m = /^(.+?)\s+[xX*]\s*(\d{1,3})$/.exec(text) ?? /^(.+?)\s*\*\s*(\d{1,3})$/.exec(text);
    if (m && m[1].trim()) {
      label = m[1].trim();
      weight = Math.min(100, Math.max(1, parseInt(m[2], 10)));
    }
    entries.push({ id: entries.length, line: lineIdx, label, weight });
  });
  return { entries, truncated };
}

/* ---------- drawing ---------- */

function drawWheel(canvas: HTMLCanvasElement, entries: Entry[], rotation: number, dark: boolean) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const size = canvas.width;
  const c = size / 2;
  const r = c - 8;
  ctx.clearRect(0, 0, size, size);

  if (entries.length === 0) {
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.fillStyle = dark ? '#1e293b' : '#e2e8f0';
    ctx.fill();
    ctx.fillStyle = dark ? '#94a3b8' : '#64748b';
    ctx.font = '600 28px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Add names to begin', c, c);
    return;
  }

  const total = entries.reduce((sum, e) => sum + e.weight, 0);
  ctx.save();
  ctx.translate(c, c);
  ctx.rotate(rotation);

  let start = 0;
  entries.forEach((entry, idx) => {
    const width = (entry.weight / total) * Math.PI * 2;
    const a0 = -Math.PI / 2 + start;
    const a1 = a0 + width;
    let color = PALETTE[idx % PALETTE.length];
    if (idx === entries.length - 1 && entries.length > 1 && idx % PALETTE.length === 0) {
      color = PALETTE[3];
    }
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, a0, a1);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    if (entries.length <= 150) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.85)';
      ctx.stroke();
    }

    if (entries.length <= 60) {
      const fontSize = Math.max(10, Math.min(30, r * 0.8 * width * 0.7));
      ctx.save();
      ctx.rotate(a0 + width / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.font = `700 ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 3;
      const maxWidth = r * 0.64;
      let text = entry.label;
      if (ctx.measureText(text).width > maxWidth) {
        while (text.length > 1 && ctx.measureText(text + '...').width > maxWidth) text = text.slice(0, -1);
        text = text.trimEnd() + '...';
      }
      ctx.fillText(text, r - 20, 0);
      ctx.restore();
    }
    start += width;
  });
  ctx.restore();

  // Hub
  ctx.beginPath();
  ctx.arc(c, c, 34, 0, Math.PI * 2);
  ctx.fillStyle = dark ? '#0f172a' : '#ffffff';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = dark ? '#334155' : '#cbd5e1';
  ctx.stroke();
}

function segmentAtPointer(entries: Entry[], rotation: number): number {
  const total = entries.reduce((sum, e) => sum + e.weight, 0);
  const twoPi = Math.PI * 2;
  let angle = (((-rotation % twoPi) + twoPi) % twoPi) / twoPi; // 0..1 around the wheel from the top
  angle *= total;
  let acc = 0;
  for (let i = 0; i < entries.length; i++) {
    acc += entries[i].weight;
    if (angle < acc) return i;
  }
  return entries.length - 1;
}

/* ---------- component ---------- */

export const WheelSpinnerNamePicker: React.FC = () => {
  const [tab, setTab] = useState<Tab>('wheel');
  const [raw, setRaw] = useState(DEFAULT_ENTRIES);
  const [loaded, setLoaded] = useState(false);
  const [removeWinner, setRemoveWinner] = useState(false);
  const [duration, setDuration] = useState(5);
  const [soundOn, setSoundOn] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<{ label: string; color: string } | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [isDark, setIsDark] = useState(true);

  // Quick picker
  const [pickCount, setPickCount] = useState('1');
  const [picked, setPicked] = useState<string[]>([]);

  // Teams
  const [teamCount, setTeamCount] = useState('2');
  const [teams, setTeams] = useState<string[][]>([]);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const lastSegmentRef = useRef(-1);
  const lastTickRef = useRef(0);

  const { entries, truncated } = useMemo(() => parseEntries(raw), [raw]);
  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  // Load and save entries in this browser only
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null && stored.trim()) setRaw(stored);
    } catch {
      // Storage unavailable, use defaults
    }
    setIsDark(document.documentElement.classList.contains('dark'));
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, raw);
    } catch {
      // Storage unavailable, ignore
    }
  }, [raw, loaded]);

  // Draw whenever entries or theme change
  useEffect(() => {
    if (canvasRef.current && tab === 'wheel') drawWheel(canvasRef.current, entries, rotationRef.current, isDark);
  }, [entries, isDark, tab]);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  const tick = useCallback(() => {
    if (!soundOn) return;
    const ctx = audioRef.current;
    if (!ctx) return;
    const now = performance.now();
    if (now - lastTickRef.current < 40) return;
    lastTickRef.current = now;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = 1100;
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.035);
  }, [soundOn]);

  const removeLine = useCallback((lineIndex: number) => {
    setRaw((prev) => {
      const lines = prev.split(/\r?\n/);
      lines.splice(lineIndex, 1);
      return lines.join('\n');
    });
  }, []);

  const spin = () => {
    const list = entriesRef.current;
    if (spinning || list.length < 2) return;
    setWinner(null);

    try {
      if (!audioRef.current) {
        const AC =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AC) audioRef.current = new AC();
      }
      void audioRef.current?.resume();
    } catch {
      // No audio, the wheel still works
    }

    const winnerIdx = pickWeighted(list);
    const total = list.reduce((sum, e) => sum + e.weight, 0);
    const before = list.slice(0, winnerIdx).reduce((sum, e) => sum + e.weight, 0);
    const twoPi = Math.PI * 2;
    // A random point inside the winning slice, away from the edges
    const offset = ((before + (0.12 + 0.76 * secureFloat()) * list[winnerIdx].weight) / total) * twoPi;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const durationMs = reduceMotion ? 700 : duration * 1000;
    const startRot = rotationRef.current;
    const settle = ((((-offset - startRot) % twoPi) + twoPi) % twoPi);
    const extraTurns = reduceMotion ? 1 : 3 + Math.round(duration);
    const delta = settle + twoPi * extraTurns;
    const startTime = performance.now();

    setSpinning(true);
    lastSegmentRef.current = segmentAtPointer(list, startRot);

    const frame = (now: number) => {
      const t = Math.min(1, (now - startTime) / durationMs);
      const eased = 1 - Math.pow(1 - t, 4);
      const rot = startRot + delta * eased;
      rotationRef.current = rot;
      if (canvasRef.current) drawWheel(canvasRef.current, list, rot, isDark);

      const seg = segmentAtPointer(list, rot);
      if (seg !== lastSegmentRef.current) {
        lastSegmentRef.current = seg;
        tick();
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        rotationRef.current = rot % twoPi;
        const win = list[winnerIdx];
        setSpinning(false);
        setWinner({ label: win.label, color: PALETTE[winnerIdx % PALETTE.length] });
        setHistory((prev) => [win.label, ...prev].slice(0, 100));
        if (removeWinner) setTimeout(() => removeLine(win.line), 900);
      }
    };
    rafRef.current = requestAnimationFrame(frame);
  };

  const applyPreset = (list: string[]) => {
    if (spinning) return;
    setRaw(list.join('\n'));
    setWinner(null);
  };

  const runPicker = () => {
    const count = Math.max(1, Math.min(entries.length, parseInt(pickCount, 10) || 1));
    const pool = [...entries];
    const result: string[] = [];
    while (result.length < count && pool.length > 0) {
      const idx = pickWeighted(pool);
      result.push(pool[idx].label);
      pool.splice(idx, 1);
    }
    setPicked(result);
    setHistory((prev) => [...result, ...prev].slice(0, 100));
  };

  const makeTeams = () => {
    const n = Math.max(2, Math.min(20, parseInt(teamCount, 10) || 2));
    const names = shuffle(entries.map((e) => e.label));
    const groups: string[][] = Array.from({ length: Math.min(n, Math.max(1, names.length)) }, () => []);
    names.forEach((name, idx) => groups[idx % groups.length].push(name));
    setTeams(groups);
  };

  const copyTeams = async () => {
    const text = teams.map((t, i) => `Team ${i + 1}: ${t.join(', ')}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard permission denied, ignore
    }
  };

  const tally = useMemo(() => {
    const map = new Map<string, number>();
    history.forEach((h) => map.set(h, (map.get(h) ?? 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [history]);

  const weightedCount = entries.filter((e) => e.weight > 1).length;

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-lg border border-slate-300 p-0.5 dark:border-slate-700" role="tablist" aria-label="Picker mode">
        {(
          [
            { id: 'wheel', label: 'Spin the wheel', icon: <Dices className="w-4 h-4" /> },
            { id: 'picker', label: 'Quick name picker', icon: <Trophy className="w-4 h-4" /> },
            { id: 'teams', label: 'Team maker', icon: <Users className="w-4 h-4" /> },
          ] as { id: Tab; label: string; icon: React.ReactNode }[]
        ).map((t) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] gap-6 items-start">
        {/* Main stage */}
        <div className="space-y-6 order-2 lg:order-1">
          {tab === 'wheel' && (
            <Card className="space-y-5">
              <div className="relative mx-auto w-full max-w-[30rem] aspect-square">
                <canvas
                  ref={canvasRef}
                  width={720}
                  height={720}
                  className="h-full w-full"
                  role="img"
                  aria-label={`Wheel with ${entries.length} entries`}
                />
                {/* Pointer */}
                <div
                  className="absolute left-1/2 -top-1 -translate-x-1/2 h-0 w-0 border-x-[14px] border-t-[26px] border-x-transparent border-t-slate-900 drop-shadow-md dark:border-t-white"
                  aria-hidden="true"
                />
                <button
                  type="button"
                  onClick={spin}
                  disabled={spinning || entries.length < 2}
                  aria-label="Spin the wheel"
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[18%] w-[18%] rounded-full bg-blue-600 text-xs sm:text-sm font-extrabold text-white shadow-lg hover:bg-blue-500 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/40 transition-colors"
                >
                  SPIN
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button type="button" size="lg" onClick={spin} disabled={spinning || entries.length < 2}>
                  {spinning ? 'Spinning...' : 'Spin the wheel'}
                </Button>
              </div>
              {entries.length < 2 && (
                <p className="text-center text-sm text-amber-600 dark:text-amber-400">
                  Add at least two names to spin the wheel.
                </p>
              )}

              <div aria-live="polite">
                {winner && !spinning && (
                  <div
                    className="rounded-xl p-5 text-center text-white shadow-lg"
                    style={{ backgroundColor: winner.color }}
                  >
                    <span className="text-xs font-bold uppercase tracking-widest opacity-90">The winner is</span>
                    <p className="mt-1 text-3xl sm:text-4xl font-extrabold break-words">{winner.label}</p>
                    {removeWinner && <p className="mt-2 text-xs opacity-90">Removed from the wheel for the next spin.</p>}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200 pt-4 dark:border-slate-800">
                <label className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={removeWinner}
                    onChange={(e) => setRemoveWinner(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Remove the winner after each spin
                </label>
                <div className="flex items-center gap-3">
                  <label htmlFor="spin-duration" className="text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    Spin time: {duration}s
                  </label>
                  <input
                    id="spin-duration"
                    type="range"
                    min={2}
                    max={10}
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>
            </Card>
          )}

          {tab === 'picker' && (
            <Card className="space-y-5">
              <div className="flex flex-wrap items-end gap-4">
                <div className="w-40">
                  <Input
                    label="How many winners"
                    type="number"
                    min={1}
                    max={Math.max(1, entries.length)}
                    value={pickCount}
                    onChange={(e) => setPickCount(e.target.value)}
                  />
                </div>
                <Button type="button" size="lg" onClick={runPicker} disabled={entries.length === 0} leftIcon={<Trophy className="w-5 h-5" />}>
                  Pick now
                </Button>
              </div>
              <div aria-live="polite">
                {picked.length > 0 ? (
                  <ol className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {picked.map((name, i) => (
                      <li
                        key={`${name}-${i}`}
                        className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                          {i + 1}
                        </span>
                        <span className="text-lg font-bold text-slate-900 dark:text-white break-words">{name}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Pick one or several unique winners at once. No one is chosen twice in the same draw.
                  </p>
                )}
              </div>
            </Card>
          )}

          {tab === 'teams' && (
            <Card className="space-y-5">
              <div className="flex flex-wrap items-end gap-4">
                <div className="w-40">
                  <Input
                    label="Number of teams"
                    type="number"
                    min={2}
                    max={20}
                    value={teamCount}
                    onChange={(e) => setTeamCount(e.target.value)}
                  />
                </div>
                <Button type="button" size="lg" onClick={makeTeams} disabled={entries.length < 2} leftIcon={<Shuffle className="w-5 h-5" />}>
                  Make random teams
                </Button>
                {teams.length > 0 && (
                  <Button type="button" variant="outline" onClick={copyTeams} leftIcon={<Copy className="w-4 h-4" />}>
                    {copied ? 'Copied' : 'Copy teams'}
                  </Button>
                )}
              </div>
              {teams.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {teams.map((team, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
                      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                        <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
                        Team {i + 1} ({team.length})
                      </h3>
                      <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                        {team.map((n, k) => (
                          <li key={`${n}-${k}`}>{n}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Everyone on your list is shuffled and dealt into balanced teams. Weights are ignored here.
                </p>
              )}
            </Card>
          )}
        </div>

        {/* Entries panel */}
        <Card className="space-y-4 order-1 lg:order-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Names ({entries.length})
            </h3>
            <button
              type="button"
              onClick={() => setSoundOn(!soundOn)}
              aria-pressed={soundOn}
              aria-label={soundOn ? 'Turn spin sound off' : 'Turn spin sound on'}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400"
            >
              {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              Sound {soundOn ? 'on' : 'off'}
            </button>
          </div>

          <label htmlFor="wheel-entries" className="sr-only">
            One name per line
          </label>
          <textarea
            id="wheel-entries"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            rows={10}
            disabled={spinning}
            placeholder={'One name per line\nAdd a weight like: Sam x3'}
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 outline-none resize-y focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            One entry per line. To make someone more likely to win, add a weight such as <code>Sam x3</code>.
            {weightedCount > 0 ? ` ${weightedCount} weighted ${weightedCount === 1 ? 'entry' : 'entries'}.` : ''}
            {truncated ? ` Only the first ${MAX_ENTRIES} entries are used.` : ''}
          </p>

          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" disabled={spinning} onClick={() => setRaw(shuffle(raw.split(/\r?\n/).filter((l) => l.trim())).join('\n'))} leftIcon={<Shuffle className="w-3.5 h-3.5" />}>
              Shuffle
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={spinning}
              onClick={() => setRaw(raw.split(/\r?\n/).filter((l) => l.trim()).sort((a, b) => a.localeCompare(b)).join('\n'))}
              leftIcon={<ArrowDownAZ className="w-3.5 h-3.5" />}
            >
              Sort A to Z
            </Button>
            <Button type="button" size="sm" variant="outline" disabled={spinning} onClick={() => { setRaw(''); setWinner(null); }} leftIcon={<Eraser className="w-3.5 h-3.5" />}>
              Clear
            </Button>
          </div>

          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Quick lists
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p.entries)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:text-blue-400 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your list is saved only in this browser, so it is still here next time you visit.
          </p>
        </Card>
      </div>

      {history.length > 0 && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Results history ({history.length})
            </h3>
            <Button type="button" size="sm" variant="ghost" onClick={() => setHistory([])}>
              Clear history
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Latest results
              </span>
              <ol className="max-h-56 overflow-y-auto space-y-1 text-sm text-slate-700 dark:text-slate-300">
                {history.slice(0, 20).map((h, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="w-6 text-slate-400">{i + 1}.</span>
                    <span className="break-words">{h}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Times picked
              </span>
              <table className="w-full text-sm text-left">
                <tbody>
                  {tally.slice(0, 10).map(([name, count]) => (
                    <tr key={name} className="border-b border-slate-100 dark:border-slate-800/70">
                      <td className="py-1.5 pr-4 text-slate-900 dark:text-slate-100 break-all">{name}</td>
                      <td className="py-1.5 text-right font-semibold text-slate-700 dark:text-slate-300">{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
