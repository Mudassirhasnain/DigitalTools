'use client';

import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ClipboardPaste, Copy, Eraser, FileText } from 'lucide-react';

const READING_WPM = 238;
const SPEAKING_WPM = 150;

const SAMPLE_TEXT = `Writing is easier when you can see the numbers. Paste any text into this box and every count updates as you type.

Use the advanced view to check keyword density, sentence length, and the limits of platforms such as X, LinkedIn, and Google search results. Nothing you type leaves your device.`;

const STOP_WORDS = new Set(
  (
    'a about above after again against all am an and any are as at be because been before being below between both but by ' +
    'can could did do does doing down during each few for from further had has have having he her here hers him his how i if ' +
    'in into is it its itself just me more most my no nor not now of off on once only or other our out over own same she should ' +
    'so some such than that the their them then there these they this those through to too under until up very was we were what ' +
    'when where which while who whom why will with would you your yours'
  ).split(' ')
);

const LIMITS = [
  { id: 'title', label: 'SEO title (about 60)', max: 60 },
  { id: 'meta', label: 'Meta description (about 160)', max: 160 },
  { id: 'x', label: 'X / Twitter post (280)', max: 280 },
  { id: 'ig', label: 'Instagram caption (2,200)', max: 2200 },
  { id: 'li', label: 'LinkedIn post (3,000)', max: 3000 },
  { id: 'sms', label: 'SMS segment (160)', max: 160 },
];

function countWords(text: string): string[] {
  if (!text.trim()) return [];
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' });
    const words: string[] = [];
    for (const seg of segmenter.segment(text)) {
      if (seg.isWordLike) words.push(seg.segment);
    }
    return words;
  }
  return text.match(/\S+/g) ?? [];
}

function formatMinutes(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0 sec';
  const totalSeconds = Math.round(totalMinutes * 60);
  if (totalSeconds < 60) return `${totalSeconds} sec`;
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return s === 0 ? `${m} min` : `${m} min ${s} sec`;
}

const StatCard: React.FC<{ label: string; value: string | number; hint?: string }> = ({ label, value, hint }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
    <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      {label}
    </span>
    <span className="mt-1 block text-2xl font-extrabold text-slate-900 dark:text-white break-all">{value}</span>
    {hint && <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{hint}</span>}
  </div>
);

export const WordCharacterCounter: React.FC = () => {
  const [text, setText] = useState('');
  const [view, setView] = useState<'simple' | 'advanced'>('simple');
  const [goalType, setGoalType] = useState<'words' | 'characters'>('words');
  const [goal, setGoal] = useState('');
  const [minWordLength, setMinWordLength] = useState('3');
  const [ignoreStopWords, setIgnoreStopWords] = useState(true);
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const words = countWords(text);
    const characters = Array.from(text).length;
    const charactersNoSpaces = Array.from(text.replace(/\s/g, '')).length;
    const sentences = text.trim()
      ? (text.match(/[^.!?。！？]+[.!?。！？]+|[^.!?。！？]+$/g) ?? []).filter((s) =>
          s.trim()
        ).length
      : 0;
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
    const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
    const bytes = new TextEncoder().encode(text).length;

    const lowerWords = words.map((w) => w.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''));
    const uniqueWords = new Set(lowerWords.filter(Boolean)).size;
    const totalWordLength = words.reduce((sum, w) => sum + Array.from(w).length, 0);
    const longest = words.reduce((best, w) => (Array.from(w).length > Array.from(best).length ? w : best), '');

    return {
      words: words.length,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
      lines,
      bytes,
      uniqueWords,
      avgWordLength: words.length ? totalWordLength / words.length : 0,
      avgSentenceLength: sentences ? words.length / sentences : 0,
      longest,
      readingMinutes: words.length / READING_WPM,
      speakingMinutes: words.length / SPEAKING_WPM,
      lowerWords,
    };
  }, [text]);

  const density = useMemo(() => {
    const minLen = Math.max(1, parseInt(minWordLength, 10) || 1);
    const counts = new Map<string, number>();
    for (const w of stats.lowerWords) {
      if (!w || Array.from(w).length < minLen) continue;
      if (ignoreStopWords && STOP_WORDS.has(w)) continue;
      counts.set(w, (counts.get(w) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 12)
      .map(([word, count]) => ({ word, count, percent: stats.words ? (count / stats.words) * 100 : 0 }));
  }, [stats.lowerWords, stats.words, minWordLength, ignoreStopWords]);

  const goalNumber = parseInt(goal, 10);
  const goalCurrent = goalType === 'words' ? stats.words : stats.characters;
  const goalPercent = goalNumber > 0 ? Math.min(100, (goalCurrent / goalNumber) * 100) : 0;

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard permission denied, ignore
    }
  };

  const pasteText = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      setText(clip);
    } catch {
      // Clipboard permission denied, ignore
    }
  };

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="inline-flex rounded-lg border border-slate-300 p-0.5 dark:border-slate-700"
            role="tablist"
            aria-label="Counter view"
          >
            {(['simple', 'advanced'] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                  view === v
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                {v === 'simple' ? 'Simple' : 'Advanced'}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setText(SAMPLE_TEXT)}
              leftIcon={<FileText className="w-3.5 h-3.5" />}
            >
              Sample
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={pasteText}
              leftIcon={<ClipboardPaste className="w-3.5 h-3.5" />}
            >
              Paste
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={copyText}
              disabled={!text}
              leftIcon={<Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setText('')}
              disabled={!text}
              leftIcon={<Eraser className="w-3.5 h-3.5" />}
            >
              Clear
            </Button>
          </div>
        </div>

        <label htmlFor="counter-text" className="sr-only">
          Text to count
        </label>
        <textarea
          id="counter-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here. Counts update instantly."
          rows={10}
          spellCheck
          className="w-full rounded-lg border border-slate-300 bg-white p-4 text-base leading-relaxed text-slate-900 placeholder:text-slate-400 outline-none resize-y focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" aria-live="polite">
          <StatCard label="Words" value={stats.words.toLocaleString()} />
          <StatCard label="Characters" value={stats.characters.toLocaleString()} hint="with spaces" />
          <StatCard label="No spaces" value={stats.charactersNoSpaces.toLocaleString()} hint="characters" />
          <StatCard label="Sentences" value={stats.sentences.toLocaleString()} />
          <StatCard label="Paragraphs" value={stats.paragraphs.toLocaleString()} />
          <StatCard label="Reading time" value={formatMinutes(stats.readingMinutes)} hint={`at ${READING_WPM} wpm`} />
        </div>
      </Card>

      {view === 'advanced' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <StatCard label="Speaking time" value={formatMinutes(stats.speakingMinutes)} hint={`at ${SPEAKING_WPM} wpm`} />
            <StatCard label="Unique words" value={stats.uniqueWords.toLocaleString()} />
            <StatCard label="Lines" value={stats.lines.toLocaleString()} />
            <StatCard label="Size" value={`${stats.bytes.toLocaleString()} B`} hint="UTF-8 bytes" />
            <StatCard label="Avg word length" value={stats.avgWordLength.toFixed(1)} hint="characters" />
            <StatCard label="Avg sentence length" value={stats.avgSentenceLength.toFixed(1)} hint="words" />
            <StatCard
              label="Longest word"
              value={stats.longest || '0'}
              hint={stats.longest ? `${Array.from(stats.longest).length} characters` : undefined}
            />
            <StatCard
              label="Lexical variety"
              value={stats.words ? `${Math.round((stats.uniqueWords / stats.words) * 100)}%` : '0%'}
              hint="unique / total words"
            />
          </div>

          <Card className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Your goal</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Count by"
                value={goalType}
                onChange={(e) => setGoalType(e.target.value as 'words' | 'characters')}
                options={[
                  { value: 'words', label: 'Words' },
                  { value: 'characters', label: 'Characters' },
                ]}
              />
              <Input
                label="Target"
                type="number"
                min={1}
                placeholder="For example 500"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
              <div className="flex flex-col justify-end">
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {goalNumber > 0
                    ? goalCurrent <= goalNumber
                      ? `${(goalNumber - goalCurrent).toLocaleString()} ${goalType} to go`
                      : `${(goalCurrent - goalNumber).toLocaleString()} ${goalType} over the target`
                    : 'Set a target to track it'}
                </span>
              </div>
            </div>
            {goalNumber > 0 && (
              <div
                className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden"
                role="progressbar"
                aria-valuenow={Math.round(goalPercent)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progress toward your target"
              >
                <div
                  className={`h-full rounded-full transition-all ${goalCurrent > goalNumber ? 'bg-amber-500' : 'bg-blue-600'}`}
                  style={{ width: `${goalPercent}%` }}
                />
              </div>
            )}
          </Card>

          <Card className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Character limits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {LIMITS.map((l) => {
                const pct = Math.min(100, (stats.characters / l.max) * 100);
                const over = stats.characters > l.max;
                return (
                  <div key={l.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{l.label}</span>
                      <span
                        className={
                          over ? 'font-semibold text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'
                        }
                      >
                        {stats.characters.toLocaleString()} / {l.max.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${over ? 'bg-red-500' : pct > 90 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Limits are typical values and platforms change them. Search engines truncate titles and descriptions by
              pixel width, so treat the SEO numbers as a guide.
            </p>
          </Card>

          <Card className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Keyword density (top 12)
              </h3>
              <div className="flex flex-wrap items-end gap-4">
                <div className="w-32">
                  <Input
                    label="Min length"
                    type="number"
                    min={1}
                    max={20}
                    value={minWordLength}
                    onChange={(e) => setMinWordLength(e.target.value)}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none pb-2">
                  <input
                    type="checkbox"
                    checked={ignoreStopWords}
                    onChange={(e) => setIgnoreStopWords(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Ignore common English words
                </label>
              </div>
            </div>
            {density.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Type some text to see the most used words.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <th className="py-2 pr-4 font-semibold">Word</th>
                      <th className="py-2 pr-4 font-semibold">Count</th>
                      <th className="py-2 pr-4 font-semibold">Density</th>
                      <th className="py-2 font-semibold w-1/2">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {density.map((row) => (
                      <tr key={row.word} className="border-b border-slate-100 dark:border-slate-800/70">
                        <td className="py-2 pr-4 font-medium text-slate-900 dark:text-slate-100 break-all">{row.word}</td>
                        <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">{row.count}</td>
                        <td className="py-2 pr-4 text-slate-700 dark:text-slate-300">{row.percent.toFixed(1)}%</td>
                        <td className="py-2">
                          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-600"
                              style={{ width: `${Math.min(100, (row.count / density[0].count) * 100)}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};
