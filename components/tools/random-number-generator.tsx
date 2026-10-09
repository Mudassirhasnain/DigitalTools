'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ResultBox } from '@/components/ui/ResultBox';
import { Dices, RefreshCw } from 'lucide-react';

function secureUint32(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0];
}

function secureFloat(): number {
  const buf = new Uint32Array(2);
  crypto.getRandomValues(buf);
  // 53 bits of randomness, uniform in [0, 1)
  return ((buf[0] >>> 5) * 67108864 + (buf[1] >>> 6)) / 9007199254740992;
}

function randomIntInclusive(min: number, max: number): number {
  const range = max - min + 1;
  if (range <= 4294967296) {
    const limit = Math.floor(4294967296 / range) * range;
    let x = secureUint32();
    while (x >= limit) x = secureUint32();
    return min + (x % range);
  }
  return min + Math.floor(secureFloat() * range);
}

function uniqueInts(min: number, max: number, count: number): number[] {
  const range = max - min + 1;
  if (range <= 100000) {
    // Partial Fisher-Yates shuffle
    const pool = Array.from({ length: range }, (_, i) => min + i);
    for (let i = 0; i < count; i++) {
      const j = i + randomIntInclusive(0, range - i - 1);
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, count);
  }
  const seen = new Set<number>();
  while (seen.size < count) seen.add(randomIntInclusive(min, max));
  return Array.from(seen);
}

const PRESETS = [
  { label: '1 to 10', min: '1', max: '10', count: '1', unique: false },
  { label: '1 to 100', min: '1', max: '100', count: '1', unique: false },
  { label: '1 to 1000', min: '1', max: '1000', count: '1', unique: false },
  { label: 'Dice (1 to 6)', min: '1', max: '6', count: '1', unique: false },
  { label: 'Lottery (6 of 49)', min: '1', max: '49', count: '6', unique: true },
];

export const RandomNumberGenerator: React.FC = () => {
  const [minInput, setMinInput] = useState('1');
  const [maxInput, setMaxInput] = useState('100');
  const [countInput, setCountInput] = useState('1');
  const [mode, setMode] = useState<'integer' | 'decimal'>('integer');
  const [decimals, setDecimals] = useState('2');
  const [unique, setUnique] = useState(false);
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');
  const [results, setResults] = useState<number[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState('');

  const generate = useCallback(
    (overrides?: { min: string; max: string; count: string; unique: boolean }) => {
      const minRaw = Number(overrides?.min ?? minInput);
      const maxRaw = Number(overrides?.max ?? maxInput);
      const count = Math.floor(Number(overrides?.count ?? countInput));
      const wantUnique = overrides?.unique ?? unique;

      if (!Number.isFinite(minRaw) || !Number.isFinite(maxRaw)) {
        setError('Enter valid numbers for the minimum and maximum.');
        return;
      }
      if (!Number.isFinite(count) || count < 1 || count > 1000) {
        setError('How many numbers must be between 1 and 1000.');
        return;
      }
      if (minRaw > maxRaw) {
        setError('The minimum cannot be greater than the maximum.');
        return;
      }

      let output: number[] = [];

      if (mode === 'integer') {
        const min = Math.ceil(minRaw);
        const max = Math.floor(maxRaw);
        if (min > max) {
          setError('There is no whole number between your minimum and maximum.');
          return;
        }
        if (Math.abs(min) > 9007199254740000 || Math.abs(max) > 9007199254740000) {
          setError('Use numbers smaller than 9,007,199,254,740,000.');
          return;
        }
        const range = max - min + 1;
        if (wantUnique && count > range) {
          setError(`You asked for ${count} unique numbers but the range only holds ${range}.`);
          return;
        }
        output = wantUnique
          ? uniqueInts(min, max, count)
          : Array.from({ length: count }, () => randomIntInclusive(min, max));
      } else {
        const places = Math.min(6, Math.max(0, parseInt(decimals, 10) || 0));
        const factor = Math.pow(10, places);
        const round = (n: number) => Math.round(n * factor) / factor;
        if (wantUnique) {
          const seen = new Set<number>();
          let attempts = 0;
          while (seen.size < count && attempts < count * 50 + 1000) {
            seen.add(round(minRaw + secureFloat() * (maxRaw - minRaw)));
            attempts++;
          }
          if (seen.size < count) {
            setError('Could not find enough unique decimals. Widen the range or add decimal places.');
            return;
          }
          output = Array.from(seen);
        } else {
          output = Array.from({ length: count }, () => round(minRaw + secureFloat() * (maxRaw - minRaw)));
        }
      }

      if (sortOrder === 'asc') output = [...output].sort((a, b) => a - b);
      if (sortOrder === 'desc') output = [...output].sort((a, b) => b - a);

      setError('');
      setResults(output);
      setHistory((prev) => [output.length > 8 ? `${output.slice(0, 8).join(', ')}, ...` : output.join(', '), ...prev].slice(0, 6));
    },
    [minInput, maxInput, countInput, mode, decimals, unique, sortOrder]
  );

  useEffect(() => {
    generate();
    // Generate one number on first load only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyPreset = (p: (typeof PRESETS)[number]) => {
    setMode('integer');
    setMinInput(p.min);
    setMaxInput(p.max);
    setCountInput(p.count);
    setUnique(p.unique);
    generate({ min: p.min, max: p.max, count: p.count, unique: p.unique });
  };

  const sum = results.reduce((a, b) => a + b, 0);
  const formatNumber = (n: number) =>
    mode === 'decimal' ? n.toFixed(Math.min(6, Math.max(0, parseInt(decimals, 10) || 0))) : n.toString();

  return (
    <div className="space-y-6">
      <Card className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p)}
              className="px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:text-blue-400 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Minimum"
            type="number"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
          />
          <Input
            label="Maximum"
            type="number"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
          />
          <Input
            label="How many numbers"
            type="number"
            min={1}
            max={1000}
            value={countInput}
            onChange={(e) => setCountInput(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Number type"
            value={mode}
            onChange={(e) => setMode(e.target.value as 'integer' | 'decimal')}
            options={[
              { value: 'integer', label: 'Whole numbers' },
              { value: 'decimal', label: 'Decimal numbers' },
            ]}
          />
          <Select
            label="Decimal places"
            value={decimals}
            disabled={mode !== 'decimal'}
            onChange={(e) => setDecimals(e.target.value)}
            options={[1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n}` }))}
          />
          <Select
            label="Sort results"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'none' | 'asc' | 'desc')}
            options={[
              { value: 'none', label: 'Keep random order' },
              { value: 'asc', label: 'Low to high' },
              { value: 'desc', label: 'High to low' },
            ]}
          />
        </div>

        <label className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={unique}
            onChange={(e) => setUnique(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span>No repeats (every number is unique)</span>
        </label>

        {error && (
          <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
            {error}
          </p>
        )}

        <Button type="button" size="lg" onClick={() => generate()} leftIcon={<Dices className="w-5 h-5" />}>
          Generate numbers
        </Button>
      </Card>

      {results.length > 0 && (
        <Card className="space-y-5">
          {results.length === 1 ? (
            <div className="text-center py-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Your random number
              </span>
              <p className="mt-2 text-6xl sm:text-7xl font-extrabold font-mono text-blue-600 dark:text-blue-400 break-all">
                {formatNumber(results[0])}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-5"
                onClick={() => generate()}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Roll again
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto">
                {results.map((n, idx) => (
                  <span
                    key={`${n}-${idx}`}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-mono text-sm font-semibold"
                  >
                    {formatNumber(n)}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {[
                  { label: 'Count', value: results.length.toString() },
                  { label: 'Sum', value: Number(sum.toFixed(6)).toLocaleString() },
                  { label: 'Average', value: Number((sum / results.length).toFixed(4)).toLocaleString() },
                  {
                    label: 'Lowest / Highest',
                    value: `${formatNumber(Math.min(...results))} / ${formatNumber(Math.max(...results))}`,
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {s.label}
                    </span>
                    <span className="block text-sm font-bold text-slate-900 dark:text-white break-all">{s.value}</span>
                  </div>
                ))}
              </div>
              <ResultBox title="Copy the list" value={results.map(formatNumber).join(', ')} />
            </>
          )}
        </Card>
      )}

      {history.length > 1 && (
        <Card className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Recent draws
          </h3>
          <ul className="space-y-1 text-sm font-mono text-slate-600 dark:text-slate-300">
            {history.slice(1).map((h, idx) => (
              <li key={idx} className="truncate">
                {h}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};
