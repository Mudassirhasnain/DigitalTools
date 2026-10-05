'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { CopyButton } from '@/components/ui/CopyButton';
import {
  RefreshCw,
  Key,
  Lock,
  Hash,
  Cpu,
  Layers,
  Download,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{}|;:,.<>?';
const AMBIGUOUS = /[1lI0O]/g;

const PASSPHRASE_WORDS = [
  'amber', 'beacon', 'canyon', 'delta', 'ember', 'falcon', 'glacier', 'harbor',
  'island', 'jungle', 'kinetic', 'lunar', 'meadow', 'nebula', 'ocean', 'prism',
  'quantum', 'river', 'summit', 'timber', 'unity', 'valley', 'zenith', 'vortex',
  'crypto', 'silver', 'stellar', 'matrix', 'cipher', 'aurora', 'vertex', 'orbit',
  'zenith', 'comet', 'falcon', 'galaxy', 'horizon', 'meteor', 'pulsar', 'quasar',
  'radiant', 'shadow', 'thunder', 'voyage', 'whisper', 'zephyr', 'blaze', 'cascade',
];

export const SecurePasswordGenerator: React.FC = () => {
  const [mode, setMode] = useState<'password' | 'passphrase' | 'pin' | 'developer'>('password');

  // Random Password settings
  const [length, setLength] = useState<number>(20);
  const [includeUpper, setIncludeUpper] = useState<boolean>(true);
  const [includeLower, setIncludeLower] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(true);

  // Passphrase settings
  const [wordCount, setWordCount] = useState<number>(4);
  const [separator, setSeparator] = useState<string>('-');
  const [capitalizeWords, setCapitalizeWords] = useState<boolean>(true);
  const [includeNumberInPassphrase, setIncludeNumberInPassphrase] = useState<boolean>(true);

  // PIN settings
  const [pinLength, setPinLength] = useState<number>(6);

  // Developer token settings
  const [devTokenType, setDevTokenType] = useState<'uuid' | 'base64_256' | 'hex_32' | 'hex_64'>('uuid');

  // Primary Output
  const [generatedSecret, setGeneratedSecret] = useState<string>('');

  // Bulk Generator Mode
  const [bulkCount, setBulkCount] = useState<number>(10);
  const [bulkList, setBulkList] = useState<string[]>([]);
  const [showBulk, setShowBulk] = useState<boolean>(false);

  // Core generator logic
  const generateSingleSecret = (): string => {
    if (typeof window === 'undefined' || !window.crypto) return '';

    if (mode === 'pin') {
      const buffer = new Uint8Array(pinLength);
      window.crypto.getRandomValues(buffer);
      return Array.from(buffer)
        .map((b) => (b % 10).toString())
        .join('');
    }

    if (mode === 'developer') {
      if (devTokenType === 'uuid') {
        // RFC 4122 v4 UUID
        const buf = new Uint8Array(16);
        window.crypto.getRandomValues(buf);
        buf[6] = (buf[6] & 0x0f) | 0x40; // Version 4
        buf[8] = (buf[8] & 0x3f) | 0x80; // Variant 10
        const hex = Array.from(buf)
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
        return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
      }

      if (devTokenType === 'base64_256') {
        const buf = new Uint8Array(32); // 256 bits
        window.crypto.getRandomValues(buf);
        let binary = '';
        for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
        return btoa(binary);
      }

      const byteLength = devTokenType === 'hex_64' ? 64 : 32;
      const buf = new Uint8Array(byteLength);
      window.crypto.getRandomValues(buf);
      return Array.from(buf)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }

    if (mode === 'passphrase') {
      const words: string[] = [];
      const randomValues = new Uint32Array(wordCount);
      window.crypto.getRandomValues(randomValues);

      for (let i = 0; i < wordCount; i++) {
        let w = PASSPHRASE_WORDS[randomValues[i] % PASSPHRASE_WORDS.length];
        if (capitalizeWords) {
          w = w.charAt(0).toUpperCase() + w.slice(1);
        }
        words.push(w);
      }

      let res = words.join(separator);
      if (includeNumberInPassphrase) {
        const randNum = new Uint8Array(1);
        window.crypto.getRandomValues(randNum);
        res += `${separator}${(randNum[0] % 90) + 10}`;
      }
      return res;
    }

    // Default Random Password
    let charset = '';
    if (includeUpper) charset += UPPER;
    if (includeLower) charset += LOWER;
    if (includeNumbers) charset += NUMBERS;
    if (includeSymbols) charset += SYMBOLS;

    if (excludeAmbiguous) {
      charset = charset.replace(AMBIGUOUS, '');
    }

    if (!charset) charset = LOWER;

    const randomBuffer = new Uint32Array(length);
    window.crypto.getRandomValues(randomBuffer);

    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset[randomBuffer[i] % charset.length];
    }
    return result;
  };

  const handleGenerate = () => {
    const single = generateSingleSecret();
    setGeneratedSecret(single);

    if (showBulk) {
      const list: string[] = [];
      for (let i = 0; i < bulkCount; i++) {
        list.push(generateSingleSecret());
      }
      setBulkList(list);
    }
  };

  useEffect(() => {
    handleGenerate();
  }, [
    mode,
    length,
    includeUpper,
    includeLower,
    includeNumbers,
    includeSymbols,
    excludeAmbiguous,
    wordCount,
    separator,
    capitalizeWords,
    includeNumberInPassphrase,
    pinLength,
    devTokenType,
    bulkCount,
    showBulk,
  ]);

  // Entropy and Brute Force calculations
  let poolSize = 2;
  if (mode === 'pin') {
    poolSize = 10;
  } else if (mode === 'developer') {
    poolSize = devTokenType === 'base64_256' ? 64 : 16;
  } else if (mode === 'passphrase') {
    poolSize = PASSPHRASE_WORDS.length;
  } else {
    poolSize = 0;
    if (includeUpper) poolSize += 26;
    if (includeLower) poolSize += 26;
    if (includeNumbers) poolSize += 10;
    if (includeSymbols) poolSize += SYMBOLS.length;
    if (excludeAmbiguous) poolSize -= 5;
    poolSize = Math.max(2, poolSize);
  }

  const effectiveLength =
    mode === 'pin'
      ? pinLength
      : mode === 'passphrase'
      ? wordCount
      : mode === 'developer'
      ? devTokenType === 'hex_64'
        ? 128
        : devTokenType === 'hex_32'
        ? 64
        : devTokenType === 'base64_256'
        ? 44
        : 36
      : length;

  const entropyBits = Math.round(
    mode === 'passphrase'
      ? wordCount * Math.log2(PASSPHRASE_WORDS.length) + (includeNumberInPassphrase ? 7 : 0)
      : mode === 'developer'
      ? devTokenType === 'hex_64'
        ? 512
        : 256
      : effectiveLength * Math.log2(poolSize)
  );

  const getStrengthCategory = () => {
    if (entropyBits >= 100) return { label: 'Quantum Resilient', color: 'text-emerald-400', bar: 'w-full bg-emerald-500', time: 'Trillions of centuries' };
    if (entropyBits >= 75) return { label: 'Extremely Strong', color: 'text-emerald-400', bar: 'w-5/6 bg-emerald-500', time: 'Millions of years' };
    if (entropyBits >= 55) return { label: 'Strong', color: 'text-blue-400', bar: 'w-3/4 bg-blue-500', time: 'Several centuries' };
    if (entropyBits >= 36) return { label: 'Moderate', color: 'text-amber-400', bar: 'w-1/2 bg-amber-500', time: 'A few days to months' };
    return { label: 'Weak', color: 'text-rose-400', bar: 'w-1/4 bg-rose-500', time: 'Seconds to minutes' };
  };

  const strength = getStrengthCategory();

  const handleDownloadBulk = () => {
    const content = bulkList.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `passwords_${mode}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Mode Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
        {[
          { id: 'password', label: 'Random Password', icon: Key },
          { id: 'passphrase', label: 'Memorable Passphrase', icon: Lock },
          { id: 'pin', label: 'Numeric PIN Code', icon: Hash },
          { id: 'developer', label: 'Developer & API Secret', icon: Cpu },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = mode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMode(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Secret Presentation Display */}
      <Card className="p-6 space-y-4 bg-linear-to-br from-slate-900 to-slate-950 text-white border-slate-800">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Hardware CSPRNG Secret
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
              window.crypto
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Brute-Force Estimate:</span>
            <span className={`font-bold ${strength.color}`}>
              {strength.label} ({entropyBits} bits) · {strength.time}
            </span>
          </div>
        </div>

        {/* Secret Output Banner */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 gap-3">
          <span className="font-mono text-base sm:text-2xl font-bold tracking-wider text-blue-300 break-all select-all">
            {generatedSecret}
          </span>

          <div className="flex items-center gap-2 shrink-0">
            <CopyButton textToCopy={generatedSecret} size="sm" />
            <button
              type="button"
              onClick={handleGenerate}
              aria-label="Generate new password"
              className="p-2 rounded-lg hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Strength Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div className={`h-full transition-all duration-300 ${strength.bar}`} />
        </div>
      </Card>

      {/* Configuration Controls */}
      <Card className="space-y-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
          Security & Complexity Parameters
        </h2>

        {mode === 'password' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Password Length</span>
                <span className="font-mono font-bold text-blue-600">{length} characters</span>
              </div>
              <input
                type="range"
                min="8"
                max="64"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={includeUpper}
                  onChange={(e) => setIncludeUpper(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Include Uppercase Letters (A-Z)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={includeLower}
                  onChange={(e) => setIncludeLower(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Include Lowercase Letters (a-z)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Include Numbers (0-9)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Include Symbols (!@#$%^&*)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 col-span-full">
                <input
                  type="checkbox"
                  checked={excludeAmbiguous}
                  onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Exclude Ambiguous Characters (1, l, I, 0, O)</span>
              </label>
            </div>
          </div>
        )}

        {mode === 'passphrase' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Word Count</span>
                <span className="font-mono font-bold text-blue-600">{wordCount} words</span>
              </div>
              <input
                type="range"
                min="3"
                max="8"
                value={wordCount}
                onChange={(e) => setWordCount(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Word Separator
                </label>
                <div className="flex gap-2">
                  {['-', '.', '_', ' '].map((sep) => (
                    <button
                      key={sep}
                      type="button"
                      onClick={() => setSeparator(sep)}
                      className={`px-3 py-1.5 rounded border text-xs font-mono font-bold ${
                        separator === sep ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                      }`}
                    >
                      {sep === ' ' ? 'Space' : sep}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={capitalizeWords}
                    onChange={(e) => setCapitalizeWords(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Capitalize Each Word (CamelCase)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={includeNumberInPassphrase}
                    onChange={(e) => setIncludeNumberInPassphrase(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Append Random 2-digit Number</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {mode === 'pin' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">PIN Code Length</span>
                <span className="font-mono font-bold text-blue-600">{pinLength} Digits</span>
              </div>
              <input
                type="range"
                min="4"
                max="12"
                value={pinLength}
                onChange={(e) => setPinLength(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div className="flex gap-2">
              {[4, 6, 8].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setPinLength(preset)}
                  className={`px-3 py-1 text-xs rounded-lg border font-mono ${
                    pinLength === preset ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300'
                  }`}
                >
                  {preset} Digits {preset === 4 ? '(ATM)' : preset === 6 ? '(Standard Phone)' : ''}
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === 'developer' && (
          <div className="space-y-3">
            <span className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Developer Token Standard
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { id: 'uuid', label: 'UUID v4 (RFC 4122 GUID)', desc: '128-bit distributed identifier' },
                { id: 'base64_256', label: '256-bit Base64 Secret', desc: 'Ideal for JWT / Cookie sessions' },
                { id: 'hex_32', label: '32-Byte Hex Token (64 chars)', desc: 'Standard API Key / Webhook secret' },
                { id: 'hex_64', label: '64-Byte Hex Token (128 chars)', desc: 'High-security symmetric key' },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setDevTokenType(item.id as any)}
                  className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                    devTokenType === item.id
                      ? 'border-blue-500 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className="font-semibold text-slate-900 dark:text-white block">{item.label}</span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bulk Generation Toggle */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={showBulk}
                onChange={(e) => setShowBulk(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Bulk Generation Mode (Multi-Account Provisioning)</span>
            </label>

            {showBulk && (
              <div className="flex items-center gap-2">
                <select
                  value={bulkCount}
                  onChange={(e) => setBulkCount(Number(e.target.value))}
                  className="px-2 py-1 text-xs rounded border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value={5}>5 Passwords</option>
                  <option value={10}>10 Passwords</option>
                  <option value={25}>25 Passwords</option>
                  <option value={50}>50 Passwords</option>
                </select>

                <Button size="sm" variant="outline" onClick={handleDownloadBulk} leftIcon={<Download className="w-3.5 h-3.5" />}>
                  Download .TXT
                </Button>
              </div>
            )}
          </div>

          {showBulk && (
            <div className="mt-3 max-h-48 overflow-y-auto p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-1">
              {bulkList.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center text-slate-700 dark:text-slate-300 py-0.5">
                  <span>{idx + 1}. {p}</span>
                  <CopyButton textToCopy={p} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>

        <Button onClick={handleGenerate} leftIcon={<RefreshCw className="w-4 h-4" />} className="w-full">
          Generate New Secure Secret
        </Button>
      </Card>
    </div>
  );
};
