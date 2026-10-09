'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { CopyButton } from '@/components/ui/CopyButton';
import {
  Download,
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  List,
  ListOrdered,
  CheckSquare,
  Table,
  Link as LinkIcon,
  Minus,
  Eye,
  Columns,
  Code2,
  FileDown,
  Sparkles,
  BookOpen,
  Printer,
} from 'lucide-react';

const TEMPLATES: Record<string, { label: string; content: string }> = {
  readme: {
    label: 'Open Source README',
    content: `# Modern Cloud Architecture Engine

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()

Production-grade utility toolkit built with Next.js App Router, TypeScript, and edge-native cryptographic primitives.

## Features
- **100% Client-Side Privacy**: Cryptographic hashes, image conversions, and document parsing run strictly in your browser.
- **Accessible & Responsive**: Meets WCAG 2.1 AA standards with seamless dark mode support.
- **Zero Heavy Hydration**: Ultra-fast page loads optimized for Lighthouse Core Web Vitals.

## Installation & Setup

\`\`\`bash
# Clone repository
git clone https://github.com/digitaltoools/core.git

# Install dependencies
npm install

# Start local development server
npm run dev
\`\`\`

## Architecture Benchmark

| Service Component | Cold Start | Memory Footprint | Runtime Security |
| :--- | :--- | :--- | :--- |
| Client Cryptography | 0 ms | < 2.5 MB | Sandboxed WebCrypto |
| Canvas Image Engine | < 15 ms | < 8.0 MB | Pure In-Memory Pixel Buffer |
| PDF Document Engine | < 40 ms | < 12.0 MB | Strict Client JS Engine |

> "Any sufficiently advanced technology is indistinguishable from simplicity."

---
### Checklist for Production Release
- [x] Strict TypeScript compilation with no implicit any
- [x] Zero tracking cookies or third-party behavioral telemetry
- [ ] Edge CDN replication across all 24 regional points of presence
`,
  },
  changelog: {
    label: 'Software Release Changelog',
    content: `# Changelog

All notable changes to the DigitalToools suite are documented in this file.

## [2.4.0] - 2026-10-05
### Added
- **Interactive JSON Inspector**: Added collapsible tree view with deep type inspection and CSV/YAML export.
- **Social Media Presets**: Added 10+ standard aspect ratio crops to the Image Resizer tool.
- **HMAC Cryptography**: Added SHA-256 and SHA-512 keyed hashing with raw key file verification.

### Changed
- Refactored document rendering engines to eliminate hydration mismatches.
- Enhanced contrast checker algorithms with full WCAG 2.1 relative luminance compliance.

### Security
- Verified zero network requests for EXIF removal and private digital signature exports.
`,
  },
  api: {
    label: 'REST API Documentation',
    content: `# REST API Reference: Currency & FX Rates

Provides real-time currency exchange rates and financial calculations.

### Endpoint
\`GET /api/v1/rates/latest\`

#### Headers
\`\`\`http
Authorization: Bearer <API_TOKEN>
Accept: application/json
\`\`\`

#### Query Parameters
- \`base\` (string, default: \`USD\`): Base currency code.
- \`symbols\` (string, optional): Comma-separated list of currency symbols to filter.

#### Example Response
\`\`\`json
{
  "status": "success",
  "base": "USD",
  "date": "2026-10-05",
  "rates": {
    "EUR": 0.92,
    "GBP": 0.79,
    "PKR": 278.45,
    "JPY": 152.10
  }
}
\`\`\`
`,
  },
};

function parseMarkdownToHTML(md: string): string {
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Fenced Code Blocks
  html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="bg-slate-900 text-slate-100 p-4 rounded-xl my-4 overflow-x-auto text-xs font-mono border border-slate-800 leading-normal"><code>${code.trim()}</code></pre>`;
  });

  // Inline Code
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-pink-600 dark:text-pink-400 font-mono text-xs border border-slate-200 dark:border-slate-700">$1</code>'
  );

  // Headings
  html = html.replace(
    /^### (.*$)/gim,
    '<h3 class="text-base font-bold mt-5 mb-2 text-slate-900 dark:text-white">$1</h3>'
  );
  html = html.replace(
    /^## (.*$)/gim,
    '<h2 class="text-lg font-bold mt-6 mb-3 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1.5">$1</h2>'
  );
  html = html.replace(
    /^# (.*$)/gim,
    '<h1 class="text-xl font-extrabold mt-6 mb-4 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">$1</h1>'
  );

  // Blockquotes
  html = html.replace(
    /^\> (.*$)/gim,
    '<blockquote class="border-l-4 border-blue-500 pl-4 py-2 italic my-3 text-slate-600 dark:text-slate-400 bg-blue-50/40 dark:bg-blue-950/20 rounded-r-lg">$1</blockquote>'
  );

  // Bold, Italic, Strikethrough
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
  html = html.replace(/~~([^~]+)~~/g, '<del class="line-through text-slate-400">$1</del>');

  // Horizontal Rule
  html = html.replace(/^---$/gim, '<hr class="my-6 border-slate-200 dark:border-slate-800" />');

  // Task lists
  html = html.replace(
    /^- \[x\] (.*$)/gim,
    '<div class="flex items-center gap-2 my-1.5 text-slate-700 dark:text-slate-300"><input type="checkbox" checked disabled class="rounded text-blue-600" /> <span class="line-through text-slate-400 dark:text-slate-500">$1</span></div>'
  );
  html = html.replace(
    /^- \[ \] (.*$)/gim,
    '<div class="flex items-center gap-2 my-1.5 text-slate-700 dark:text-slate-300"><input type="checkbox" disabled class="rounded text-blue-600" /> <span>$1</span></div>'
  );

  // Bullet Lists
  html = html.replace(
    /^- (.*$)/gim,
    '<li class="ml-4 list-disc text-slate-700 dark:text-slate-300 leading-relaxed my-1">$1</li>'
  );

  // Tables
  const lines = html.split('\n');
  const tableBuffer: string[] = [];
  let inTable = false;
  const processedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableBuffer.length = 0;
      }
      tableBuffer.push(line);
    } else {
      if (inTable) {
        processedLines.push(renderTable(tableBuffer));
        inTable = false;
      }
      processedLines.push(lines[i]);
    }
  }
  if (inTable) {
    processedLines.push(renderTable(tableBuffer));
  }
  html = processedLines.join('\n');

  // Paragraphs
  html = html
    .split('\n\n')
    .map((chunk) => {
      const trimmed = chunk.trim();
      if (!trimmed) return '';
      if (
        trimmed.startsWith('<h') ||
        trimmed.startsWith('<pre') ||
        trimmed.startsWith('<blockquote') ||
        trimmed.startsWith('<div') ||
        trimmed.startsWith('<li') ||
        trimmed.startsWith('<table') ||
        trimmed.startsWith('<hr')
      ) {
        return trimmed;
      }
      return `<p class="my-2.5 leading-relaxed text-slate-700 dark:text-slate-300">${trimmed}</p>`;
    })
    .join('\n');

  return html;
}

function renderTable(lines: string[]): string {
  if (lines.length < 2) return lines.join('\n');
  const headerCells = lines[0]
    .split('|')
    .slice(1, -1)
    .map(
      (c) =>
        `<th class="px-3.5 py-2 text-left text-xs font-bold text-slate-900 dark:text-white border-b border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">${c.trim()}</th>`
    )
    .join('');

  const bodyRows: string[] = [];
  for (let i = 2; i < lines.length; i++) {
    const cells = lines[i]
      .split('|')
      .slice(1, -1)
      .map(
        (c) =>
          `<td class="px-3.5 py-2 text-xs text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">${c.trim()}</td>`
      )
      .join('');
    bodyRows.push(`<tr>${cells}</tr>`);
  }

  return `<div class="my-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"><table class="w-full border-collapse text-left"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows.join(
    ''
  )}</tbody></table></div>`;
}

export const MarkdownPreviewer: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(TEMPLATES.readme.content);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');

  // Stats
  const stats = useMemo(() => {
    const chars = markdown.length;
    const words = markdown.trim() ? markdown.trim().split(/\s+/).filter(Boolean).length : 0;
    const lines = markdown.split('\n').length;
    const readingTime = Math.ceil(words / 200);
    return { chars, words, lines, readingTime };
  }, [markdown]);

  // Extract Table of Contents
  const toc = useMemo(() => {
    const headingLines = markdown.split('\n').filter((l) => /^#{1,3}\s/.test(l));
    return headingLines.map((line) => {
      const level = line.match(/^#+/)?.[0].length || 1;
      const text = line.replace(/^#+\s*/, '').trim();
      return { level, text };
    });
  }, [markdown]);

  const insertMarkup = (before: string, after: string = '') => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement | null;
    if (!textarea) {
      setMarkdown((prev) => prev + before + after);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = markdown.substring(start, end);
    const replacement = `${before}${selected || 'text'}${after}`;
    const updated = markdown.substring(0, start) + replacement + markdown.substring(end);

    setMarkdown(updated);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + (selected.length || 4));
    }, 10);
  };

  const handleDownloadMd = () => {
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtml = () => {
    const renderedHtml = parseMarkdownToHTML(markdown);
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rendered Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; max-width: 860px; margin: 40px auto; padding: 0 20px; color: #1e293b; }
    pre { background: #0f172a; color: #f8fafc; padding: 16px; border-radius: 8px; overflow-x: auto; }
    code { font-family: monospace; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    th { background: #f1f5f9; }
    blockquote { border-left: 4px solid #3b82f6; margin: 16px 0; padding-left: 16px; color: #475569; }
    hr { border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0; }
  </style>
</head>
<body>
${renderedHtml}
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rendered_document.html';
    link.click();
    URL.revokeObjectURL(url);
  };

  const parsedHtml = useMemo(() => parseMarkdownToHTML(markdown), [markdown]);

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* View mode toggle */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'edit'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Editor Only</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'preview'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Only</span>
            </button>
          </div>

          {/* Preset Templates */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Templates:</span>
            {Object.entries(TEMPLATES).map(([key, t]) => (
              <button
                key={key}
                type="button"
                onClick={() => setMarkdown(t.content)}
                className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 transition-colors text-slate-700 dark:text-slate-300 font-medium"
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <CopyButton textToCopy={markdown} size="sm" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadMd}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              .MD
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadHtml}
              leftIcon={<FileDown className="w-3.5 h-3.5" />}
            >
              HTML
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
            >
              Print
            </Button>
          </div>
        </div>

        {/* Toolbar for Markup Injection */}
        <div className="flex items-center gap-1 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => insertMarkup('**', '**')}
            title="Bold (**text**)"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkup('*', '*')}
            title="Italic (*text*)"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkup('~~', '~~')}
            title="Strikethrough (~~text~~)"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
          <span className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />
          <button
            type="button"
            onClick={() => insertMarkup('# ')}
            title="Heading 1"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <Heading1 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkup('## ')}
            title="Heading 2"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkup('### ')}
            title="Heading 3"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>
          <span className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />
          <button
            type="button"
            onClick={() => insertMarkup('> ')}
            title="Blockquote"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkup('`', '`')}
            title="Inline Code"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkup('```typescript\n', '\n```')}
            title="Code Fence"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs"
          >
            {'```'}
          </button>
          <button
            type="button"
            onClick={() => insertMarkup('- ')}
            title="Bullet list"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkup('1. ')}
            title="Numbered list"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkup('- [ ] ')}
            title="Task list item"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkup('| Col 1 | Col 2 |\n| :--- | :--- |\n| Val 1 | Val 2 |\n')}
            title="GFM Table"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <Table className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkup('[Link Title](', 'https://example.com)')}
            title="Hyperlink"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => insertMarkup('\n---\n')}
            title="Horizontal rule"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>
      </Card>

      {/* Editor & Preview Workspace */}
      <div
        className={`grid gap-4 ${
          viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {/* Editor Box */}
        {(viewMode === 'split' || viewMode === 'edit') && (
          <Card className="p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                <span className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Markdown Source
                </span>
                <div className="flex items-center gap-3">
                  <span>{stats.lines} lines</span>
                  <span>{stats.words} words</span>
                  <span>{stats.chars} chars</span>
                </div>
              </div>

              <textarea
                id="markdown-editor"
                rows={22}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="Type Markdown content..."
                className="w-full h-[520px] rounded-lg border border-slate-200 bg-white p-3 font-mono text-xs leading-relaxed text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 resize-y"
                aria-label="Markdown source editor"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Estimated reading time: ~{stats.readingTime} min</span>
              <button
                type="button"
                onClick={() => setMarkdown('')}
                className="hover:text-rose-600 transition-colors"
              >
                Clear Editor
              </button>
            </div>
          </Card>
        )}

        {/* Live Preview Box */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <Card className="p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                <span className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Real-Time GFM Rendered Preview
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Live Synced
                </span>
              </div>

              <div
                className="w-full h-[520px] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/50 p-6 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-100 leading-relaxed select-text"
                dangerouslySetInnerHTML={{ __html: parsedHtml }}
              />
            </div>

            {/* Live Table of Contents Bar */}
            {toc.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Table of Contents ({toc.length} sections):
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {toc.slice(0, 5).map((item, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] truncate max-w-[150px]"
                    >
                      {item.level === 1 ? '• ' : '– '}
                      {item.text}
                    </span>
                  ))}
                  {toc.length > 5 && (
                    <span className="text-slate-400 text-[11px]">+{toc.length - 5} more</span>
                  )}
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};
