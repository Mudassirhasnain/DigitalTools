'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { CopyButton } from '@/components/ui/CopyButton';
import { Clock, Calendar, Globe, Code2, AlertTriangle, ArrowRight, Play, Pause } from 'lucide-react';

const TIMEZONES = [
  { id: 'UTC', name: 'Coordinated Universal Time (UTC)', tz: 'UTC' },
  { id: 'America/New_York', name: 'New York (EDT/EST)', tz: 'America/New_York' },
  { id: 'Europe/London', name: 'London (BST/GMT)', tz: 'Europe/London' },
  { id: 'Europe/Paris', name: 'Paris / Berlin (CEST/CET)', tz: 'Europe/Paris' },
  { id: 'Asia/Dubai', name: 'Dubai (GST - UTC+4)', tz: 'Asia/Dubai' },
  { id: 'Asia/Karachi', name: 'Karachi / Islamabad (PKT - UTC+5)', tz: 'Asia/Karachi' },
  { id: 'Asia/Tokyo', name: 'Tokyo (JST - UTC+9)', tz: 'Asia/Tokyo' },
  { id: 'Australia/Sydney', name: 'Sydney (AEST - UTC+10)', tz: 'Australia/Sydney' },
];

export const UnixTimestampConverter: React.FC = () => {
  const [currentEpoch, setCurrentEpoch] = useState<number>(Math.floor(Date.now() / 1000));
  const [isClockRunning, setIsClockRunning] = useState<boolean>(true);
  const [epochInput, setEpochInput] = useState<string>(Math.floor(Date.now() / 1000).toString());

  // Date to epoch state
  const [dateInput, setDateInput] = useState<string>(new Date().toISOString().slice(0, 16));

  // Language snippet
  const [snippetLang, setSnippetLang] = useState<'js' | 'python' | 'go' | 'php' | 'sql' | 'java'>('js');

  // Live ticking clock
  useEffect(() => {
    if (!isClockRunning) return;
    const timer = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [isClockRunning]);

  // Parse epoch input (seconds or milliseconds)
  const numericEpoch = parseInt(epochInput.trim(), 10);
  let parsedDate: Date | null = null;
  let isMillis = false;

  if (!isNaN(numericEpoch)) {
    if (numericEpoch > 9999999999) {
      parsedDate = new Date(numericEpoch);
      isMillis = true;
    } else {
      parsedDate = new Date(numericEpoch * 1000);
      isMillis = false;
    }
  }

  const isValidEpoch = parsedDate && !isNaN(parsedDate.getTime());

  // Relative time helper
  const getRelativeTime = (d: Date): string => {
    const diffSec = Math.round((d.getTime() - Date.now()) / 1000);
    const absSec = Math.abs(diffSec);
    const isPast = diffSec < 0;

    let timeStr = '';
    if (absSec < 60) timeStr = `${absSec} seconds`;
    else if (absSec < 3600) timeStr = `${Math.floor(absSec / 60)} minutes`;
    else if (absSec < 86400) timeStr = `${Math.floor(absSec / 3600)} hours`;
    else if (absSec < 2592000) timeStr = `${Math.floor(absSec / 86400)} days`;
    else if (absSec < 31536000) timeStr = `${Math.floor(absSec / 2592000)} months`;
    else timeStr = `${Math.floor(absSec / 31536000)} years`;

    return isPast ? `${timeStr} ago` : `in ${timeStr}`;
  };

  // Date input to epoch
  const targetDate = new Date(dateInput);
  const convertedSeconds = !isNaN(targetDate.getTime()) ? Math.floor(targetDate.getTime() / 1000) : 0;
  const convertedMillis = !isNaN(targetDate.getTime()) ? targetDate.getTime() : 0;

  // Year Progress
  const yearProgress = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1).getTime();
    const end = new Date(now.getFullYear() + 1, 0, 1).getTime();
    const pct = ((now.getTime() - start) / (end - start)) * 100;
    const dayOfYear = Math.floor((now.getTime() - start) / (1000 * 60 * 60 * 24)) + 1;
    return {
      year: now.getFullYear(),
      pct: pct.toFixed(1),
      dayOfYear,
    };
  }, [currentEpoch]);

  // Code snippets generator
  const getCodeSnippet = (lang: string) => {
    switch (lang) {
      case 'js':
        return `// Get current timestamp in seconds\nconst timestamp = Math.floor(Date.now() / 1000);\n\n// Convert Unix timestamp to Date\nconst date = new Date(${numericEpoch || 1767225600} * 1000);`;
      case 'python':
        return `# Get current timestamp in seconds\nimport time\nepoch_time = int(time.time())\n\n# Convert Unix timestamp to datetime\nfrom datetime import datetime, timezone\ndt = datetime.fromtimestamp(${numericEpoch || 1767225600}, tz=timezone.utc)`;
      case 'go':
        return `// Get current timestamp in seconds\nnow := time.Now().Unix()\n\n// Convert Unix timestamp to Time\ntm := time.Unix(${numericEpoch || 1767225600}, 0)`;
      case 'php':
        return `// Get current timestamp\n$timestamp = time();\n\n// Convert Unix timestamp to formatted date\n$date = date('Y-m-d H:i:s', ${numericEpoch || 1767225600});`;
      case 'sql':
        return `-- Current Unix timestamp\nSELECT UNIX_TIMESTAMP();\n\n-- Convert Unix timestamp to datetime\nSELECT FROM_UNIXTIME(${numericEpoch || 1767225600});`;
      case 'java':
        return `// Current Unix timestamp in seconds\nlong epoch = Instant.now().getEpochSecond();\n\n// Convert Unix timestamp to Instant\nInstant instant = Instant.ofEpochSecond(${numericEpoch || 1767225600}L);`;
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Live Current Epoch Clock Card */}
      <Card className="flex items-center justify-between p-5 bg-linear-to-r from-blue-950 via-slate-900 to-slate-950 border-blue-900/60 text-white flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-600/30 text-blue-400">
            <Clock className={`w-6 h-6 ${isClockRunning ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block">
              Current Unix Epoch Timestamp
            </span>
            <span className="text-3xl sm:text-4xl font-mono font-extrabold text-white mt-0.5 block tracking-wider">
              {currentEpoch}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsClockRunning(!isClockRunning)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {isClockRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isClockRunning ? 'Pause' : 'Resume'}</span>
          </button>

          <CopyButton textToCopy={currentEpoch.toString()} label="Copy Timestamp" />

          <button
            type="button"
            onClick={() => setEpochInput(currentEpoch.toString())}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            Load into Converter
          </button>
        </div>
      </Card>

      {/* Year Progress Bar */}
      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5 text-xs">
        <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
          <span>{yearProgress.year} Calendar Progress (Day {yearProgress.dayOfYear} of 365)</span>
          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{yearProgress.pct}% Complete</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${yearProgress.pct}%` }} />
        </div>
      </div>

      {/* Dual Converter Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Section 1: Timestamp -> Human Date */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Timestamp to Human Date</span>
            </h2>
            <div className="flex gap-1 text-[11px] text-blue-600 dark:text-blue-400">
              <button
                type="button"
                onClick={() => setEpochInput('0')}
                className="hover:underline"
              >
                1970 Epoch
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setEpochInput('2147483647')}
                className="hover:underline"
              >
                Y2K38 Limit
              </button>
            </div>
          </div>

          <Input
            label="Unix Epoch Timestamp (10 or 13 digits)"
            value={epochInput}
            onChange={(e) => setEpochInput(e.target.value)}
            placeholder="e.g. 1767225600"
          />

          {isValidEpoch && parsedDate ? (
            <div className="space-y-2.5 pt-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
                <span className="text-slate-500">Relative Time:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {getRelativeTime(parsedDate)}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">UTC Standard:</span>
                  <CopyButton textToCopy={parsedDate.toUTCString()} size="sm" />
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white block select-all">
                  {parsedDate.toUTCString()}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Local System Time:</span>
                  <CopyButton textToCopy={parsedDate.toLocaleString()} size="sm" />
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white block select-all">
                  {parsedDate.toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">ISO-8601 (API Standard):</span>
                  <CopyButton textToCopy={parsedDate.toISOString()} size="sm" />
                </div>
                <span className="font-mono font-bold text-slate-900 dark:text-white block select-all">
                  {parsedDate.toISOString()}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-rose-500 pt-2">Please enter a valid numeric Unix timestamp.</p>
          )}
        </Card>

        {/* Section 2: Human Date -> Timestamp */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Human Date to Epoch Timestamp</span>
            </h2>
            <button
              type="button"
              onClick={() => setDateInput(new Date().toISOString().slice(0, 16))}
              className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
            >
              Set to Now
            </button>
          </div>

          <Input
            label="Date & Time (Local Clock)"
            type="datetime-local"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
          />

          {!isNaN(targetDate.getTime()) ? (
            <div className="space-y-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block">Seconds (Standard 10-digit):</span>
                  <span className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400">
                    {convertedSeconds}
                  </span>
                </div>
                <CopyButton textToCopy={convertedSeconds.toString()} size="sm" />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block">Milliseconds (JS 13-digit):</span>
                  <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                    {convertedMillis}
                  </span>
                </div>
                <CopyButton textToCopy={convertedMillis.toString()} size="sm" />
              </div>

              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[11px] text-blue-800 dark:text-blue-300">
                Corresponds to <strong>{targetDate.toUTCString()}</strong> in UTC time.
              </div>
            </div>
          ) : (
            <p className="text-xs text-rose-500 pt-2">Please enter a valid date.</p>
          )}
        </Card>
      </div>

      {/* World Timezones Table */}
      {isValidEpoch && parsedDate && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Worldwide Regional Timezone Representation</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Epoch: {numericEpoch}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {TIMEZONES.map((tz) => {
              const formattedTime = new Intl.DateTimeFormat('en-US', {
                timeZone: tz.tz,
                dateStyle: 'medium',
                timeStyle: 'medium',
              }).format(parsedDate);

              return (
                <div
                  key={tz.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-1"
                >
                  <span className="text-slate-500 text-[11px] block">{tz.name}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white block select-all">
                    {formattedTime}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Developer Code Snippets Accordion */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-600" />
            <span>Developer Code Reference</span>
          </h2>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
            {['js', 'python', 'go', 'php', 'sql', 'java'].map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setSnippetLang(lang as any)}
                className={`px-2.5 py-1 rounded font-semibold uppercase ${
                  snippetLang === lang ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
            {getCodeSnippet(snippetLang)}
          </pre>
          <div className="absolute top-3 right-3">
            <CopyButton textToCopy={getCodeSnippet(snippetLang)} size="sm" />
          </div>
        </div>
      </Card>
    </div>
  );
};
