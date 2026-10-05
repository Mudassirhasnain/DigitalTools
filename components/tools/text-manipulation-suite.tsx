'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { CopyButton } from '@/components/ui/CopyButton';
import {
  Sparkles,
  Trash2,
  ArrowDownAZ,
  ArrowUpZA,
  Search,
  Replace,
  Hash,
  ListOrdered,
  Binary,
  Code2,
  FileText,
  Filter,
  RefreshCw,
  BookOpen,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

export const TextManipulationSuite: React.FC = () => {
  const [text, setText] = useState(
    'The quick brown fox jumps over the lazy dog.\nSoftware engineering requires disciplined attention to detail.\nContact us at dev-team@digitaltools.dev or visit https://digitaltools.dev for production utilities.\nThe quick brown fox jumps over the lazy dog.'
  );

  const [activeTab, setActiveTab] = useState<'case' | 'clean' | 'find' | 'encode' | 'extract' | 'stats'>('case');

  // Find & Replace state
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [useRegex, setUseRegex] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  const [replaceCount, setReplaceCount] = useState<number | null>(null);

  // Prefix & Suffix state
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');

  // Extracted results state
  const [extractedItems, setExtractedItems] = useState<string[]>([]);
  const [extractType, setExtractType] = useState<string>('');

  // Statistics calculation
  const stats = useMemo(() => {
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s+/g, '').length;
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
    const wordCount = words.length;
    const uniqueWords = new Set(words.map((w) => w.toLowerCase())).size;
    const lines = text ? text.split('\n') : [];
    const lineCount = lines.length;
    const sentences = text ? (text.match(/[^.!?]+[.!?]+(\s|$)/g) || []).length : 0;
    const paragraphs = text ? text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length : 0;
    const readingTimeSec = Math.ceil((wordCount / 200) * 60);
    const speakingTimeSec = Math.ceil((wordCount / 130) * 60);

    // Automated Readability Index (ARI)
    // 4.71 * (characters/words) + 0.5 * (words/sentences) - 21.43
    let readabilityGrade = 'N/A';
    if (wordCount > 5 && sentences > 0) {
      const score = Math.round(
        4.71 * (charsNoSpaces / wordCount) + 0.5 * (wordCount / sentences) - 21.43
      );
      if (score <= 5) readabilityGrade = 'Elementary (5th Grade)';
      else if (score <= 8) readabilityGrade = 'Middle School (6-8th)';
      else if (score <= 12) readabilityGrade = 'High School (9-12th)';
      else if (score <= 14) readabilityGrade = 'College Undergraduate';
      else readabilityGrade = 'Graduate / Professional';
    }

    return {
      chars,
      charsNoSpaces,
      wordCount,
      uniqueWords,
      lineCount,
      sentences: Math.max(sentences, wordCount > 0 ? 1 : 0),
      paragraphs: Math.max(paragraphs, wordCount > 0 ? 1 : 0),
      readingTime: `${Math.floor(readingTimeSec / 60)}m ${readingTimeSec % 60}s`,
      speakingTime: `${Math.floor(speakingTimeSec / 60)}m ${speakingTimeSec % 60}s`,
      readabilityGrade,
    };
  }, [text]);

  // Case transforms
  const transform = (fn: (input: string) => string) => {
    setText((prev) => fn(prev));
  };

  // Encoders / Decoders
  const handleUrlEncode = () => transform((t) => encodeURIComponent(t));
  const handleUrlDecode = () => {
    try {
      transform((t) => decodeURIComponent(t));
    } catch {
      alert('Invalid URL encoding sequence');
    }
  };

  const handleBase64Encode = () => {
    try {
      transform((t) => btoa(unescape(encodeURIComponent(t))));
    } catch {
      alert('Failed to Base64 encode text');
    }
  };

  const handleBase64Decode = () => {
    try {
      transform((t) => decodeURIComponent(escape(atob(t.trim()))));
    } catch {
      alert('Invalid Base64 sequence');
    }
  };

  const handleHtmlEscape = () => {
    transform((t) =>
      t
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
    );
  };

  const handleHtmlUnescape = () => {
    const doc = new DOMParser().parseFromString(text, 'text/html');
    setText(doc.documentElement.textContent || '');
  };

  const handleRot13 = () => {
    transform((t) =>
      t.replace(/[a-zA-Z]/g, (c) => {
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCharCode(((code - 65 + 13) % 26) + 65);
        if (code >= 97 && code <= 122) return String.fromCharCode(((code - 97 + 13) % 26) + 97);
        return c;
      })
    );
  };

  const handleTextToBinary = () => {
    transform((t) =>
      t
        .split('')
        .map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))
        .join(' ')
    );
  };

  const handleBinaryToText = () => {
    try {
      const clean = text.trim().split(/\s+/);
      const res = clean.map((b) => String.fromCharCode(parseInt(b, 2))).join('');
      setText(res);
    } catch {
      alert('Invalid binary sequence');
    }
  };

  const handleTextToHex = () => {
    transform((t) =>
      t
        .split('')
        .map((char) => char.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(' ')
    );
  };

  const handleHexToText = () => {
    try {
      const clean = text.replace(/[^0-9a-fA-F]/g, '');
      let str = '';
      for (let i = 0; i < clean.length; i += 2) {
        str += String.fromCharCode(parseInt(clean.substr(i, 2), 16));
      }
      setText(str);
    } catch {
      alert('Invalid hexadecimal sequence');
    }
  };

  const handleLeetSpeak = () => {
    const map: Record<string, string> = {
      a: '4', A: '4', e: '3', E: '3', i: '1', I: '1', o: '0', O: '0', s: '5', S: '5', t: '7', T: '7',
    };
    transform((t) => t.replace(/[aeiost]/gi, (m) => map[m] || m));
  };

  const handleReverseText = () => transform((t) => t.split('').reverse().join(''));
  const handleReverseWords = () =>
    transform((t) =>
      t
        .split('\n')
        .map((line) => line.split(/\s+/).reverse().join(' '))
        .join('\n')
    );

  // Line cleaning
  const removeDuplicates = () => {
    const lines = text.split('\n');
    const seen = new Set<string>();
    const filtered = lines.filter((l) => {
      const trimmed = l.trim();
      if (seen.has(trimmed)) return false;
      seen.add(trimmed);
      return true;
    });
    setText(filtered.join('\n'));
  };

  const removeEmptyLines = () => {
    setText(
      text
        .split('\n')
        .filter((l) => l.trim().length > 0)
        .join('\n')
    );
  };

  const sortLinesAsc = () => {
    setText(text.split('\n').sort((a, b) => a.localeCompare(b)).join('\n'));
  };

  const sortLinesDesc = () => {
    setText(text.split('\n').sort((a, b) => b.localeCompare(a)).join('\n'));
  };

  const trimWhitespace = () => {
    setText(
      text
        .split('\n')
        .map((l) => l.trim())
        .join('\n')
    );
  };

  const addLineNumbers = () => {
    setText(
      text
        .split('\n')
        .map((l, i) => `${i + 1}. ${l}`)
        .join('\n')
    );
  };

  const applyPrefixSuffix = () => {
    if (!prefix && !suffix) return;
    setText(
      text
        .split('\n')
        .map((l) => `${prefix}${l}${suffix}`)
        .join('\n')
    );
  };

  const handleFindReplace = () => {
    if (!findText) return;
    try {
      let count = 0;
      let newText = '';
      if (useRegex) {
        const flags = matchCase ? 'g' : 'gi';
        const re = new RegExp(findText, flags);
        const matches = text.match(re);
        count = matches ? matches.length : 0;
        newText = text.replace(re, replaceText);
      } else {
        if (matchCase) {
          const parts = text.split(findText);
          count = parts.length - 1;
          newText = parts.join(replaceText);
        } else {
          const re = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          const matches = text.match(re);
          count = matches ? matches.length : 0;
          newText = text.replace(re, replaceText);
        }
      }
      setText(newText);
      setReplaceCount(count);
    } catch {
      alert('Invalid regular expression pattern.');
    }
  };

  // Extractors
  const extractPatterns = (type: 'urls' | 'emails' | 'phones' | 'ips' | 'hashtags' | 'mentions') => {
    setExtractType(type);
    let regex: RegExp;
    switch (type) {
      case 'urls':
        regex = /https?:\/\/[^\s/$.?#].[^\s]*/gi;
        break;
      case 'emails':
        regex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        break;
      case 'phones':
        regex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
        break;
      case 'ips':
        regex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
        break;
      case 'hashtags':
        regex = /#[a-zA-Z0-9_]+/g;
        break;
      case 'mentions':
        regex = /@[a-zA-Z0-9_]+/g;
        break;
    }
    const matches = text.match(regex) || [];
    setExtractedItems(Array.from(new Set(matches)));
  };

  return (
    <div className="space-y-6">
      {/* Metrics Header Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
          <span className="text-[11px] text-slate-500 block uppercase font-semibold">Chars</span>
          <span className="text-base font-bold text-slate-900 dark:text-white font-mono">{stats.chars}</span>
        </div>
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
          <span className="text-[11px] text-slate-500 block uppercase font-semibold">No Space</span>
          <span className="text-base font-bold text-slate-900 dark:text-white font-mono">{stats.charsNoSpaces}</span>
        </div>
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
          <span className="text-[11px] text-slate-500 block uppercase font-semibold">Words</span>
          <span className="text-base font-bold text-blue-600 dark:text-blue-400 font-mono">{stats.wordCount}</span>
        </div>
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
          <span className="text-[11px] text-slate-500 block uppercase font-semibold">Unique</span>
          <span className="text-base font-bold text-slate-900 dark:text-white font-mono">{stats.uniqueWords}</span>
        </div>
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
          <span className="text-[11px] text-slate-500 block uppercase font-semibold">Lines</span>
          <span className="text-base font-bold text-slate-900 dark:text-white font-mono">{stats.lineCount}</span>
        </div>
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
          <span className="text-[11px] text-slate-500 block uppercase font-semibold">Sentences</span>
          <span className="text-base font-bold text-slate-900 dark:text-white font-mono">{stats.sentences}</span>
        </div>
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
          <span className="text-[11px] text-slate-500 block uppercase font-semibold">Reading</span>
          <span className="text-xs font-bold text-slate-900 dark:text-white font-mono mt-1 block">{stats.readingTime}</span>
        </div>
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
          <span className="text-[11px] text-slate-500 block uppercase font-semibold">Speaking</span>
          <span className="text-xs font-bold text-slate-900 dark:text-white font-mono mt-1 block">{stats.speakingTime}</span>
        </div>
      </div>

      {/* Main Textarea Card */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Active Text Workspace
          </span>
          <div className="flex items-center gap-2">
            <CopyButton textToCopy={text} size="sm" />
            <button
              type="button"
              onClick={() => setText('')}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 hover:border-rose-300 transition-colors"
              title="Clear all text"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <Textarea
          rows={9}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or write your text here..."
          className="w-full resize-y font-mono text-sm leading-relaxed"
          aria-label="Text Manipulation input area"
        />

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
          <span>Readability: <strong className="text-slate-800 dark:text-slate-200">{stats.readabilityGrade}</strong></span>
          <button
            type="button"
            onClick={() =>
              setText(
                'The quick brown fox jumps over the lazy dog.\nSoftware engineering requires disciplined attention to detail.\nContact us at dev-team@digitaltools.dev or visit https://digitaltools.dev for production utilities.'
              )
            }
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Reset Sample Text
          </button>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
        {[
          { key: 'case', label: 'Case Converter', icon: FileText },
          { key: 'clean', label: 'Clean & Organize', icon: Filter },
          { key: 'find', label: 'Find & Replace', icon: Search },
          { key: 'encode', label: 'Encode & Ciphers', icon: Binary },
          { key: 'extract', label: 'Data Extractor', icon: Code2 },
          { key: 'stats', label: 'Text Analytics', icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {/* 1. Case Conversions */}
      {activeTab === 'case' && (
        <Card className="p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Letter Case Transformation</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            <Button variant="outline" size="sm" onClick={() => transform((t) => t.toUpperCase())}>
              UPPERCASE
            </Button>
            <Button variant="outline" size="sm" onClick={() => transform((t) => t.toLowerCase())}>
              lowercase
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                transform((t) =>
                  t.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase())
                )
              }
            >
              Title Case
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                transform((t) =>
                  t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase())
                )
              }
            >
              Sentence case
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                transform((t) =>
                  t
                    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
                    .replace(/^[A-Z]/, (c) => c.toLowerCase())
                )
              }
            >
              camelCase
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                transform((t) =>
                  t
                    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
                    .replace(/^[a-z]/, (c) => c.toUpperCase())
                )
              }
            >
              PascalCase
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                transform((t) =>
                  t
                    .trim()
                    .replace(/\W+/g, '_')
                    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
                    .toLowerCase()
                )
              }
            >
              snake_case
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                transform((t) =>
                  t
                    .trim()
                    .replace(/\W+/g, '-')
                    .replace(/([a-z\d])([A-Z])/g, '$1-$2')
                    .toLowerCase()
                )
              }
            >
              kebab-case
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                transform((t) =>
                  t
                    .trim()
                    .replace(/\W+/g, '_')
                    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
                    .toUpperCase()
                )
              }
            >
              CONSTANT_CASE
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                transform((t) =>
                  t
                    .toLowerCase()
                    .trim()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/[\s_-]+/g, '-')
                    .replace(/^-+|-+$/g, '')
                )
              }
            >
              URL-slug
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                transform((t) =>
                  t
                    .split('')
                    .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
                    .join('')
                )
              }
            >
              aLtErNaTiNg
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                transform((t) =>
                  t
                    .split('')
                    .map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
                    .join('')
                )
              }
            >
              iNVERSE cASE
            </Button>
          </div>
        </Card>
      )}

      {/* 2. Clean & Organize */}
      {activeTab === 'clean' && (
        <Card className="p-5 space-y-5">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Line & Whitespace Cleaning</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              <Button variant="outline" size="sm" onClick={removeDuplicates} leftIcon={<Filter className="w-3.5 h-3.5" />}>
                Deduplicate Lines
              </Button>
              <Button variant="outline" size="sm" onClick={removeEmptyLines} leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
                Remove Empty Lines
              </Button>
              <Button variant="outline" size="sm" onClick={trimWhitespace}>
                Trim Line Edges
              </Button>
              <Button variant="outline" size="sm" onClick={() => transform((t) => t.replace(/[ \t]+/g, ' '))}>
                Collapse Spaces
              </Button>
              <Button variant="outline" size="sm" onClick={sortLinesAsc} leftIcon={<ArrowDownAZ className="w-3.5 h-3.5" />}>
                Sort Lines A → Z
              </Button>
              <Button variant="outline" size="sm" onClick={sortLinesDesc} leftIcon={<ArrowUpZA className="w-3.5 h-3.5" />}>
                Sort Lines Z → A
              </Button>
              <Button variant="outline" size="sm" onClick={() => transform((t) => t.split('\n').reverse().join('\n'))}>
                Reverse Line Order
              </Button>
              <Button variant="outline" size="sm" onClick={addLineNumbers} leftIcon={<ListOrdered className="w-3.5 h-3.5" />}>
                Number All Lines
              </Button>
              <Button variant="outline" size="sm" onClick={handleReverseText}>
                Reverse Characters
              </Button>
              <Button variant="outline" size="sm" onClick={handleReverseWords}>
                Reverse Words
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => transform((t) => t.replace(/[^\w\s\n]/gi, ''))}
              >
                Remove Punctuation
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  transform((t) =>
                    t.replace(
                      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
                      ''
                    )
                  )
                }
              >
                Strip Emojis
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Prefix and Suffix Lines</h4>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Input
                placeholder="Prefix e.g. - [ ] "
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Suffix e.g. ;"
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                className="flex-1"
              />
              <Button onClick={applyPrefixSuffix} size="sm">
                Apply to All Lines
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 3. Find & Replace */}
      {activeTab === 'find' && (
        <Card className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Find String / Pattern"
              placeholder="Text or Regex pattern..."
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
            />
            <Input
              label="Replace With"
              placeholder="Replacement text..."
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-5 text-xs text-slate-700 dark:text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={matchCase}
                  onChange={(e) => setMatchCase(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600"
                />
                <span>Match Case Sensitive</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useRegex}
                  onChange={(e) => setUseRegex(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600"
                />
                <span>Regular Expression (RegEx)</span>
              </label>
            </div>

            <div className="flex items-center gap-3">
              {replaceCount !== null && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {replaceCount} match{replaceCount === 1 ? '' : 'es'} replaced
                </span>
              )}
              <Button onClick={handleFindReplace} leftIcon={<Replace className="w-3.5 h-3.5" />}>
                Execute Replace All
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 4. Encode & Ciphers */}
      {activeTab === 'encode' && (
        <Card className="p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Developer Encodings and Classic Ciphers</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            <Button variant="outline" size="sm" onClick={handleUrlEncode}>
              URL Encode
            </Button>
            <Button variant="outline" size="sm" onClick={handleUrlDecode}>
              URL Decode
            </Button>
            <Button variant="outline" size="sm" onClick={handleBase64Encode}>
              Base64 Encode
            </Button>
            <Button variant="outline" size="sm" onClick={handleBase64Decode}>
              Base64 Decode
            </Button>
            <Button variant="outline" size="sm" onClick={handleHtmlEscape}>
              HTML Entity Escape
            </Button>
            <Button variant="outline" size="sm" onClick={handleHtmlUnescape}>
              HTML Entity Unescape
            </Button>
            <Button variant="outline" size="sm" onClick={handleRot13}>
              ROT13 Cipher
            </Button>
            <Button variant="outline" size="sm" onClick={handleLeetSpeak}>
              Leet Speak (1337)
            </Button>
            <Button variant="outline" size="sm" onClick={handleTextToBinary}>
              Text → Binary (8-bit)
            </Button>
            <Button variant="outline" size="sm" onClick={handleBinaryToText}>
              Binary → Text
            </Button>
            <Button variant="outline" size="sm" onClick={handleTextToHex}>
              Text → Hexadecimal
            </Button>
            <Button variant="outline" size="sm" onClick={handleHexToText}>
              Hexadecimal → Text
            </Button>
          </div>
        </Card>
      )}

      {/* 5. Data Extractor */}
      {activeTab === 'extract' && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Extract Specific Entities from Text</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => extractPatterns('urls')}>
                Extract URLs
              </Button>
              <Button variant="outline" size="sm" onClick={() => extractPatterns('emails')}>
                Extract Emails
              </Button>
              <Button variant="outline" size="sm" onClick={() => extractPatterns('phones')}>
                Extract Phones
              </Button>
              <Button variant="outline" size="sm" onClick={() => extractPatterns('ips')}>
                Extract IPs
              </Button>
              <Button variant="outline" size="sm" onClick={() => extractPatterns('hashtags')}>
                Extract #Hashtags
              </Button>
              <Button variant="outline" size="sm" onClick={() => extractPatterns('mentions')}>
                Extract @Mentions
              </Button>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Extracted {extractType ? extractType.toUpperCase() : 'Items'} ({extractedItems.length})
              </span>
              {extractedItems.length > 0 && (
                <div className="flex items-center gap-2">
                  <CopyButton textToCopy={extractedItems.join('\n')} size="sm" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setText(extractedItems.join('\n'))}
                  >
                    Replace Editor Text
                  </Button>
                </div>
              )}
            </div>

            {extractedItems.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                Click one of the extraction buttons above to parse URLs, email addresses, phone numbers, or hashtags.
              </p>
            ) : (
              <ul className="space-y-1 max-h-56 overflow-y-auto text-xs font-mono text-slate-800 dark:text-slate-200">
                {extractedItems.map((item, idx) => (
                  <li key={idx} className="p-1.5 rounded hover:bg-slate-200/50 dark:hover:bg-slate-800/60 truncate">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      )}

      {/* 6. Text Analytics */}
      {activeTab === 'stats' && (
        <Card className="p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Comprehensive Text Composition Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase block">Volume Metrics</span>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span>Total Characters:</span>
                <span className="font-mono font-bold">{stats.chars}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span>Non-Space Characters:</span>
                <span className="font-mono font-bold">{stats.charsNoSpaces}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span>Total Words:</span>
                <span className="font-mono font-bold">{stats.wordCount}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Unique Words:</span>
                <span className="font-mono font-bold">{stats.uniqueWords}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase block">Structure Metrics</span>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span>Total Sentences:</span>
                <span className="font-mono font-bold">{stats.sentences}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span>Total Paragraphs:</span>
                <span className="font-mono font-bold">{stats.paragraphs}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span>Total Lines:</span>
                <span className="font-mono font-bold">{stats.lineCount}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Avg Words per Sentence:</span>
                <span className="font-mono font-bold">
                  {stats.sentences > 0 ? (stats.wordCount / stats.sentences).toFixed(1) : 0}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase block">Time & Readability</span>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span>Silent Reading Time:</span>
                <span className="font-mono font-bold">{stats.readingTime}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span>Speaking Time:</span>
                <span className="font-mono font-bold">{stats.speakingTime}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-800">
                <span>Readability Level:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 text-xs">{stats.readabilityGrade}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Vocabulary Diversity:</span>
                <span className="font-mono font-bold">
                  {stats.wordCount > 0 ? `${Math.round((stats.uniqueWords / stats.wordCount) * 100)}%` : '0%'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
