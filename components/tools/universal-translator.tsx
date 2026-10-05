'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { CopyButton } from '@/components/ui/CopyButton';
import {
  ArrowLeftRight,
  Globe,
  Volume2,
  Sparkles,
  Download,
  History,
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

const LANGUAGES = [
  { value: 'en', label: 'English (US / UK)' },
  { value: 'es', label: 'Spanish (Español)' },
  { value: 'fr', label: 'French (Français)' },
  { value: 'de', label: 'German (Deutsch)' },
  { value: 'it', label: 'Italian (Italiano)' },
  { value: 'pt', label: 'Portuguese (Português)' },
  { value: 'ru', label: 'Russian (Русский)' },
  { value: 'zh', label: 'Chinese (Simplified / 简体中文)' },
  { value: 'ja', label: 'Japanese (日本語)' },
  { value: 'ko', label: 'Korean (한국어)' },
  { value: 'ar', label: 'Arabic (العربية)' },
  { value: 'ur', label: 'Urdu (اردو)' },
  { value: 'hi', label: 'Hindi (हिन्दी)' },
  { value: 'tr', label: 'Turkish (Türkçe)' },
  { value: 'nl', label: 'Dutch (Nederlands)' },
  { value: 'pl', label: 'Polish (Polski)' },
  { value: 'sv', label: 'Swedish (Svenska)' },
  { value: 'id', label: 'Indonesian (Bahasa Indonesia)' },
  { value: 'vi', label: 'Vietnamese (Tiếng Việt)' },
  { value: 'el', label: 'Greek (Ελληνικά)' },
  { value: 'th', label: 'Thai (ไทย)' },
  { value: 'cs', label: 'Czech (Čeština)' },
  { value: 'uk', label: 'Ukrainian (Українська)' },
];

const PRESETS = [
  {
    label: 'Tech & Architecture',
    text: 'Modern web architectures utilize edge caching, immutable serverless functions, and client-side cryptography to deliver resilient user experiences.',
  },
  {
    label: 'Business Contract',
    text: 'Both parties agree to treat all exchanged technical documentation, trade secrets, and financial projections as strictly confidential.',
  },
  {
    label: 'Travel & Dining',
    text: 'Could you please recommend a traditional restaurant nearby with vegetarian and gluten-free dining options?',
  },
  {
    label: 'Customer Support',
    text: 'Thank you for reaching out to technical support. We have received your ticket and are investigating the issue immediately.',
  },
];

interface HistoryEntry {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: string;
}

export const UniversalTranslator: React.FC = () => {
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [inputText, setInputText] = useState(
    'Digital tools provide developers and creators with fast, private, and accessible web utilities.'
  );
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [speechRate, setSpeechRate] = useState<number>(1.0);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setNotice(null);

    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          source: sourceLang,
          target: targetLang,
        }),
      });

      const data = await res.json();
      if (res.ok && data.translatedText) {
        setTranslatedText(data.translatedText);
        setProvider(data.provider || 'Active Translation API');

        // Add to history
        const newEntry: HistoryEntry = {
          id: Date.now().toString(),
          sourceText: inputText,
          translatedText: data.translatedText,
          sourceLang,
          targetLang,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setHistory((prev) => [newEntry, ...prev.slice(0, 7)]);
      } else {
        setNotice(
          data.error ||
            'Notice: Translation service endpoint is currently offline or rate-limited. Configure TRANSLATION_API_URL or GEMINI_API_KEY in server environment.'
        );
      }
    } catch {
      setNotice('Network connection error: Failed to reach the translation gateway route.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    if (translatedText) {
      const prevInput = inputText;
      setInputText(translatedText);
      setTranslatedText(prevInput);
    }
  };

  const speakText = (textToSpeak: string, langCode: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = langCode;
    utterance.rate = speechRate;
    window.speechSynthesis.speak(utterance);
  };

  const downloadText = () => {
    if (!translatedText) return;
    const content = `Source (${sourceLang.toUpperCase()}):\n${inputText}\n\nTranslation (${targetLang.toUpperCase()}):\n${translatedText}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `translation_${sourceLang}_to_${targetLang}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Honesty & Architecture Notice */}
      <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-900 dark:text-amber-100">
            External Processing Notice
          </p>
          <p className="leading-relaxed">
            Unlike our client-side cryptographic and document tools, translation requires neural language
            models. Text entered here is dispatched over HTTPS to the configured translation route handler
            (LibreTranslate or Google AI proxy). Please avoid submitting confidential credentials or unmasked
            passwords.
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <Card className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] gap-3 items-end">
          <div>
            <Select
              label="Source Language"
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              options={LANGUAGES}
            />
          </div>

          <div className="flex justify-center pb-0.5">
            <button
              type="button"
              onClick={handleSwap}
              aria-label="Swap source and target languages"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Swap languages"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          <div>
            <Select
              label="Target Language"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              options={LANGUAGES}
            />
          </div>

          <div>
            <Button
              onClick={handleTranslate}
              isLoading={loading}
              leftIcon={<Globe className="w-4 h-4" />}
              className="w-full h-[42px]"
            >
              Translate
            </Button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium flex items-center gap-1 text-slate-700 dark:text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Presets:
          </span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setInputText(p.text)}
              className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Editor & Translated Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Box */}
        <Card className="p-5 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
              <span className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Source Text ({sourceLang.toUpperCase()})
              </span>
              <div className="flex items-center gap-3">
                <span>{inputText.length} chars</span>
                <span>{inputText.trim() ? inputText.trim().split(/\s+/).length : 0} words</span>
                <button
                  type="button"
                  onClick={() => speakText(inputText, sourceLang)}
                  aria-label="Listen to pronunciation of source text"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1"
                  title="Pronounce text"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <Textarea
              rows={9}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type or paste text to translate..."
              aria-label="Source text to translate"
              className="w-full resize-y font-normal"
            />
          </div>

          <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setInputText('')}
              className="hover:text-rose-600 transition-colors"
            >
              Clear Text
            </button>
            <span className="text-[11px] text-slate-400">Press Translate or click preset</span>
          </div>
        </Card>

        {/* Translation Box */}
        <Card className="p-5 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Translation ({targetLang.toUpperCase()})
                </span>
                {provider && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-medium">
                    {provider}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {translatedText && (
                  <>
                    <span>{translatedText.length} chars</span>
                    <button
                      type="button"
                      onClick={() => speakText(translatedText, targetLang)}
                      aria-label="Listen to translated speech"
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1"
                      title="Pronounce translation"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <CopyButton textToCopy={translatedText} size="sm" />
                    <button
                      type="button"
                      onClick={downloadText}
                      aria-label="Download translation as text file"
                      className="p-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Download as TXT"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="min-h-[220px] rounded-lg border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-100 leading-relaxed whitespace-pre-wrap select-text">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-44 gap-2 text-xs text-slate-400">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>Contacting neural translation engine...</span>
                </div>
              ) : translatedText ? (
                translatedText
              ) : (
                <span className="text-slate-400 italic">
                  Translation will appear here after clicking &quot;Translate&quot;.
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <span>Voice speed:</span>
              {[0.8, 1.0, 1.2].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setSpeechRate(rate)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
                    speechRate === rate
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
            {translatedText && (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready
              </span>
            )}
          </div>
        </Card>
      </div>

      {notice && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
          {notice}
        </div>
      )}

      {/* Translation History */}
      {history.length > 0 && (
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
              <History className="w-4 h-4 text-blue-500" />
              <span>Recent Translation Session History</span>
            </div>
            <button
              type="button"
              onClick={() => setHistory([])}
              className="text-xs text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear History
            </button>
          </div>

          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between gap-4 text-xs"
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {item.sourceLang.toUpperCase()} → {item.targetLang.toUpperCase()}
                    </span>
                    <span>• {item.timestamp}</span>
                  </div>
                  <p className="truncate text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                    {item.sourceText}
                  </p>
                  <p className="truncate text-slate-900 dark:text-slate-200 font-medium">
                    {item.translatedText}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSourceLang(item.sourceLang);
                      setTargetLang(item.targetLang);
                      setInputText(item.sourceText);
                      setTranslatedText(item.translatedText);
                    }}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Restore
                  </Button>
                  <CopyButton textToCopy={item.translatedText} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
