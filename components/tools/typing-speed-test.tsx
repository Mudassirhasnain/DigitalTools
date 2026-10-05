'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RotateCcw, Timer, Award, Zap, Code, BookOpen, Hash, TrendingUp } from 'lucide-react';

const CATEGORIES: Record<string, { name: string; passages: string[] }> = {
  prose: {
    name: 'Standard Prose',
    passages: [
      'Digital privacy is a fundamental human right in the connected age. Applications should minimize server data transmission and empower users with transparent local execution whenever technically feasible.',
      'Clear technical communication bridges the gap between complex software systems and end-user needs. Documentation must be concise, accurate, and structured with logical hierarchy to maximize comprehension.',
      'Sustainable software engineering requires deliberate architectural choices. Clean code, automated test coverage, and strict type safety form the bedrock of resilient distributed platforms.',
    ],
  },
  tech: {
    name: 'Tech & Architecture',
    passages: [
      'Modern web frameworks leverage server-side rendering and client-side hydration to deliver lightning-fast interactive user interfaces with zero unnecessary bundle overhead.',
      'Cryptographic hashing produces fixed-length deterministic digests from arbitrary binary input. SHA-256 remains the cornerstone of modern ledger integrity and digital certificates.',
      'Relational database indexing drastically accelerates query retrieval by constructing balanced tree data structures over indexed columns at the cost of slight write overhead.',
    ],
  },
  code: {
    name: 'Code Syntax (JS/TS)',
    passages: [
      'const formatNumber = (val: number): string => val.toLocaleString("en-US", { maximumFractionDigits: 2 });',
      'export async function POST(req: NextRequest) { const body = await req.json(); return NextResponse.json(body); }',
      'const filtered = items.filter((x) => x.active).map((item) => ({ id: item.id, score: item.points * 1.5 }));',
    ],
  },
};

interface TestRecord {
  date: string;
  wpm: number;
  accuracy: number;
  duration: number;
}

export const TypingSpeedTest: React.FC = () => {
  const [categoryKey, setCategoryKey] = useState<string>('prose');
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [passageIndex, setPassageIndex] = useState<number>(0);
  const [userInput, setUserInput] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // History records
  const [history, setHistory] = useState<TestRecord[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  const passages = CATEGORIES[categoryKey].passages;
  const targetText = passages[passageIndex % passages.length];

  // Load history from localStorage safely on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('dt_typing_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const handleReset = () => {
    setIsActive(false);
    setIsFinished(false);
    setTimeLeft(selectedDuration);
    setUserInput('');
    setPassageIndex((prev) => (prev + 1) % passages.length);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleDurationChange = (dur: number) => {
    setSelectedDuration(dur);
    setTimeLeft(dur);
    setIsActive(false);
    setIsFinished(false);
    setUserInput('');
  };

  const handleCategoryChange = (key: string) => {
    setCategoryKey(key);
    setIsActive(false);
    setIsFinished(false);
    setTimeLeft(selectedDuration);
    setUserInput('');
    setPassageIndex(0);
  };

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      setIsFinished(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFinished) return;
    if (!isActive) {
      setIsActive(true);
    }
    const val = e.target.value;
    setUserInput(val);

    if (val.length >= targetText.length) {
      setIsActive(false);
      setIsFinished(true);
    }
  };

  // Calculate Metrics
  const timeElapsedMinutes = (selectedDuration - timeLeft) / 60 || 0.01;
  const typedCharacters = userInput.length;
  let correctCharacters = 0;
  let errors = 0;

  for (let i = 0; i < typedCharacters; i++) {
    if (userInput[i] === targetText[i]) {
      correctCharacters++;
    } else {
      errors++;
    }
  }

  const grossWpm = Math.round(typedCharacters / 5 / timeElapsedMinutes) || 0;
  const netWpm = Math.max(0, Math.round((typedCharacters / 5 - errors) / timeElapsedMinutes)) || 0;
  const accuracy = typedCharacters > 0 ? Math.round((correctCharacters / typedCharacters) * 100) : 100;
  const cpm = Math.round(typedCharacters / timeElapsedMinutes) || 0;

  // On finish, record to history
  useEffect(() => {
    if (isFinished && typedCharacters > 10) {
      const record: TestRecord = {
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        wpm: netWpm,
        accuracy,
        duration: selectedDuration,
      };
      setHistory((prev) => {
        const next = [record, ...prev].slice(0, 5);
        try {
          localStorage.setItem('dt_typing_history', JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  }, [isFinished]);

  // Tier ranking
  const getRankBadge = (wpm: number) => {
    if (wpm >= 110) return { title: 'Typing Wizard / Master', color: 'text-purple-400 bg-purple-950/60 border-purple-800' };
    if (wpm >= 85) return { title: 'Elite Pro Typer', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' };
    if (wpm >= 65) return { title: 'Advanced / Fast', color: 'text-blue-400 bg-blue-950/60 border-blue-800' };
    if (wpm >= 45) return { title: 'Proficient / Average', color: 'text-amber-400 bg-amber-950/60 border-amber-800' };
    return { title: 'Developing / Novice', color: 'text-slate-400 bg-slate-800 border-slate-700' };
  };

  const rank = getRankBadge(netWpm);

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 text-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Time Left</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 block font-mono">
            {timeLeft}s
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 text-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Net WPM</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block font-mono">
            {netWpm}
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 text-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Accuracy</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 block font-mono">
            {accuracy}%
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 text-center">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Errors</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-1 block font-mono">
            {errors}
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60 text-center col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Chars / Min</span>
          <span className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-1 block font-mono">
            {cpm}
          </span>
        </div>
      </div>

      {/* Main Workspace Card */}
      <Card className="space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-3">
          {/* Category Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            {Object.keys(CATEGORIES).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => handleCategoryChange(key)}
                className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                  categoryKey === key
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {CATEGORIES[key].name}
              </button>
            ))}
          </div>

          {/* Duration selectors */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs">
              {[15, 30, 60, 120].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => handleDurationChange(dur)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors ${
                    selectedDuration === dur
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {dur}s
                </button>
              ))}
            </div>

            <Button size="sm" variant="outline" onClick={handleReset} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
              Restart
            </Button>
          </div>
        </div>

        {/* Text Display with character-by-character colorization */}
        <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-base sm:text-lg leading-relaxed select-none min-h-[140px]">
          {targetText.split('').map((char, index) => {
            let color = 'text-slate-400 dark:text-slate-600';
            if (index < userInput.length) {
              color =
                userInput[index] === char
                  ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold';
            } else if (index === userInput.length) {
              color = 'bg-blue-500/20 text-slate-900 dark:text-slate-100 border-b-2 border-blue-500';
            }
            return (
              <span key={index} className={color}>
                {char}
              </span>
            );
          })}
        </div>

        {/* Typing Input */}
        <div>
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            disabled={isFinished}
            placeholder={
              isFinished
                ? 'Test finished! Click "Restart" to try another passage.'
                : 'Start typing here... (Timer starts automatically on first keypress)'
            }
            className="w-full px-4 py-3.5 rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 font-mono text-sm sm:text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
            autoFocus
          />
        </div>

        {/* Results Banner */}
        {isFinished && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-sm block">
                  Speed Assessment Complete: {netWpm} Net WPM ({accuracy}% Accuracy)
                </span>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${rank.color}`}>
                  {rank.title}
                </span>
              </div>
            </div>
            <Button size="sm" onClick={handleReset}>
              Take Next Test
            </Button>
          </div>
        )}
      </Card>

      {/* History Log */}
      {history.length > 0 && (
        <Card className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Recent Session Performance History</span>
            </h3>
            <span className="text-[11px] text-slate-400">Stored in browser local memory</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            {history.map((rec, i) => (
              <div key={i} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 text-center">
                <span className="text-[10px] text-slate-400 block">{rec.date} ({rec.duration}s)</span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block font-mono">
                  {rec.wpm} WPM
                </span>
                <span className="text-[11px] text-slate-500">{rec.accuracy}% accuracy</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
