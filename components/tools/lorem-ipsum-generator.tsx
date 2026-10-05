'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { CopyButton } from '@/components/ui/CopyButton';
import { RefreshCw, Download, FileText, Sparkles, BookOpen, Clock } from 'lucide-react';

const VOCABULARIES: Record<string, { name: string; words: string[] }> = {
  latin: {
    name: 'Classical Latin (Standard)',
    words: [
      'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do',
      'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim',
      'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi',
      'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit',
      'voluptate', 'velit', 'esse', 'cillum', 'eu', 'fugiat', 'nulla', 'pariatur', 'excepteur',
      'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt',
      'mollit', 'anim', 'id', 'est', 'laborum', 'curabitur', 'pretium', 'tincidunt', 'lacus',
    ],
  },
  tech: {
    name: 'Tech & Modern Software',
    words: [
      'kubernetes', 'microservices', 'distributed', 'latency', 'bandwidth', 'reactive', 'serverless',
      'graphql', 'containerization', 'pipeline', 'deployment', 'immutable', 'infrastructure', 'observability',
      'telemetry', 'concurrency', 'asynchronous', 'throughput', 'cache', 'database', 'indexing',
      'sharding', 'middleware', 'runtime', 'compiler', 'typescript', 'websocket', 'loadbalancer',
      'resilience', 'circuitbreaker', 'idempotent', 'cryptography', 'cluster', 'orchestration',
    ],
  },
  corporate: {
    name: 'Corporate Buzzwords',
    words: [
      'synergy', 'bandwidth', 'deliverables', 'actionable', 'paradigm', 'pivot', 'streamline',
      'stakeholder', 'scalability', 'holistic', 'ecosystem', 'alignment', 'core-competency',
      'touchpoint', 'deep-dive', 'value-add', 'leverage', 'benchmark', 'roadmap', 'frictionless',
      'low-hanging-fruit', 'game-changer', 'omnichannel', 'agile', 'sprint', 'buy-in', 'kpis',
      'ROI', 'milestone', 'incentivize', 'onboarding', 'cross-functional', 'disruptive',
    ],
  },
  pirate: {
    name: 'Pirate Speak',
    words: [
      'ahoy', 'matey', 'avast', 'scallywag', 'plunder', 'booty', 'galleon', 'buccaneer', 'anchor',
      'cutlass', 'broadside', 'shiver-me-timbers', 'davy-jones', 'walk-the-plank', 'black-spot',
      'quartermaster', 'crow-nest', 'landlubber', 'swashbuckler', 'yo-ho-ho', 'rum', 'corsair',
      'privateer', 'compass', 'starboard', 'portside', 'doubloon', 'parley', 'cannon', 'treasure',
    ],
  },
  culinary: {
    name: 'Gourmet Culinary',
    words: [
      'artisanal', 'truffle', 'sous-vide', 'fermentation', 'brioche', 'reduction', 'ganache',
      'emulsify', 'caramelize', 'heirloom', 'saffron', 'infusion', 'confit', 'deconstruct',
      'sustainable', 'farm-to-table', 'flambé', 'charcuterie', 'zest', 'velouté', 'brine',
      'pasture-raised', 'smoked', 'organic', 'marinate', 'poached', 'crispy', 'vinaigrette',
    ],
  },
};

export const LoremIpsumGenerator: React.FC = () => {
  const [styleKey, setStyleKey] = useState<string>('latin');
  const [unitType, setUnitType] = useState<'paragraphs' | 'sentences' | 'words' | 'lists'>('paragraphs');
  const [count, setCount] = useState<number>(3);
  const [startWithLorem, setStartWithLorem] = useState<boolean>(true);
  const [outputFormat, setOutputFormat] = useState<'plain' | 'html' | 'markdown'>('plain');

  const vocab = VOCABULARIES[styleKey].words;

  const getRandomWord = () => vocab[Math.floor(Math.random() * vocab.length)];

  const generateSentence = (forceStart = false): string => {
    const length = Math.floor(Math.random() * 8) + 8;
    const words: string[] = [];
    if (forceStart && styleKey === 'latin') {
      words.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet');
    }
    while (words.length < length) {
      words.push(getRandomWord());
    }
    const sentence = words.join(' ');
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
  };

  const generateParagraph = (forceStart = false): string => {
    const sentenceCount = Math.floor(Math.random() * 3) + 4;
    const sentences: string[] = [];
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence(forceStart && i === 0));
    }
    return sentences.join(' ');
  };

  const generateOutput = (): string => {
    const safeCount = Math.max(1, Math.min(count, 100));

    if (unitType === 'words') {
      const words: string[] = [];
      if (startWithLorem && styleKey === 'latin') {
        words.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet');
      }
      while (words.length < safeCount) {
        words.push(getRandomWord());
      }
      const trimmed = words.slice(0, safeCount).join(' ');
      if (outputFormat === 'html') return `<p>${trimmed}</p>`;
      return trimmed;
    }

    if (unitType === 'sentences') {
      const sentences: string[] = [];
      for (let i = 0; i < safeCount; i++) {
        sentences.push(generateSentence(startWithLorem && i === 0));
      }
      const joined = sentences.join(' ');
      if (outputFormat === 'html') return `<p>${joined}</p>`;
      return joined;
    }

    if (unitType === 'lists') {
      const items: string[] = [];
      for (let i = 0; i < safeCount; i++) {
        items.push(generateSentence(false));
      }
      if (outputFormat === 'html') {
        return `<ul>\n${items.map((it) => `  <li>${it}</li>`).join('\n')}\n</ul>`;
      }
      if (outputFormat === 'markdown') {
        return items.map((it) => `- ${it}`).join('\n');
      }
      return items.map((it, idx) => `${idx + 1}. ${it}`).join('\n');
    }

    // Paragraphs
    const paras: string[] = [];
    for (let i = 0; i < safeCount; i++) {
      paras.push(generateParagraph(startWithLorem && i === 0));
    }

    if (outputFormat === 'html') {
      return paras.map((p) => `<p>${p}</p>`).join('\n\n');
    }
    if (outputFormat === 'markdown') {
      return paras.map((p, i) => (i === 0 ? `### ${generateSentence(false).replace('.', '')}\n\n${p}` : p)).join('\n\n');
    }
    return paras.join('\n\n');
  };

  const [generatedText, setGeneratedText] = useState<string>(generateOutput());

  const handleGenerate = () => {
    setGeneratedText(generateOutput());
  };

  // Metrics
  const metrics = useMemo(() => {
    const rawWords = generatedText.trim().split(/\s+/).filter(Boolean);
    const wordTotal = rawWords.length;
    const charTotal = generatedText.length;
    const readTimeMinutes = Math.max(1, Math.round(wordTotal / 200));
    return {
      wordTotal,
      charTotal,
      readTimeMinutes,
    };
  }, [generatedText]);

  const handleDownload = () => {
    const ext = outputFormat === 'html' ? 'html' : outputFormat === 'markdown' ? 'md' : 'txt';
    const mime = outputFormat === 'html' ? 'text/html' : outputFormat === 'markdown' ? 'text/markdown' : 'text/plain';
    const blob = new Blob([generatedText], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lorem_ipsum_${styleKey}_${Date.now()}.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Control Toolbar */}
      <Card className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Select
            label="Vocabulary Style"
            value={styleKey}
            onChange={(e) => setStyleKey(e.target.value)}
            options={Object.keys(VOCABULARIES).map((k) => ({
              value: k,
              label: VOCABULARIES[k].name,
            }))}
          />

          <Select
            label="Generate By"
            value={unitType}
            onChange={(e) => setUnitType(e.target.value as any)}
            options={[
              { value: 'paragraphs', label: 'Paragraphs' },
              { value: 'sentences', label: 'Sentences' },
              { value: 'words', label: 'Words' },
              { value: 'lists', label: 'Bulleted Lists' },
            ]}
          />

          <Input
            label="Count (1 – 100)"
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />

          <Select
            label="Output Format"
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value as any)}
            options={[
              { value: 'plain', label: 'Plain Text' },
              { value: 'html', label: 'HTML Tags (<p>, <ul>)' },
              { value: 'markdown', label: 'Markdown Format' },
            ]}
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={startWithLorem}
              onChange={(e) => setStartWithLorem(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Start with &quot;Lorem ipsum dolor sit amet...&quot;</span>
          </label>

          <Button onClick={handleGenerate} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Generate Placeholder Copy
          </Button>
        </div>
      </Card>

      {/* Metrics Header */}
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-center">
          <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Total Words</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">
            {metrics.wordTotal}
          </span>
        </div>
        <div className="p-3 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-center">
          <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Total Characters</span>
          <span className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5 block">
            {metrics.charTotal}
          </span>
        </div>
        <div className="p-3 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-center">
          <span className="text-slate-500 uppercase tracking-wider block text-[10px]">Reading Time</span>
          <span className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 mt-0.5 block">
            ~{metrics.readTimeMinutes} min
          </span>
        </div>
      </div>

      {/* Result Display */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Generated Output ({VOCABULARIES[styleKey].name})
          </span>
          <div className="flex items-center gap-2">
            <CopyButton textToCopy={generatedText} />
            <Button size="sm" variant="outline" onClick={handleDownload} leftIcon={<Download className="w-3.5 h-3.5" />}>
              Download .{outputFormat === 'html' ? 'html' : outputFormat === 'markdown' ? 'md' : 'txt'}
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/40 text-slate-800 dark:text-slate-200 text-sm leading-relaxed max-h-[460px] overflow-y-auto whitespace-pre-wrap font-sans selection:bg-blue-500/20">
          {generatedText}
        </div>
      </Card>
    </div>
  );
};
