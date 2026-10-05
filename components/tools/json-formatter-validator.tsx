'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { CopyButton } from '@/components/ui/CopyButton';
import {
  CheckCircle2,
  AlertCircle,
  Download,
  Minimize2,
  Maximize2,
  Trash2,
  Wrench,
  Search,
  ChevronRight,
  ChevronDown,
  Layers,
  Code2,
  Sparkles,
} from 'lucide-react';

const PRESETS: Record<string, string> = {
  ecommerce: `{
  "orderId": "ORD-2026-8841",
  "customer": {
    "name": "Sarah Jenkins",
    "email": "sarah.j@example.com",
    "tier": "Gold Member"
  },
  "items": [
    { "sku": "TECH-019", "name": "Mechanical Keyboard", "quantity": 1, "price": 129.99 },
    { "sku": "TECH-088", "name": "USB-C Braided Cable", "quantity": 2, "price": 14.50 }
  ],
  "shipping": {
    "carrier": "FedEx Express",
    "tracking": "FX-992014-US",
    "delivered": false
  },
  "totalAmount": 158.99,
  "currency": "USD"
}`,
  api: `{
  "status": 200,
  "success": true,
  "message": "Resource fetched successfully",
  "data": {
    "userId": "usr_99a8b1",
    "roles": ["admin", "developer"],
    "permissions": {
      "read": true,
      "write": true,
      "delete": false
    },
    "lastLogin": "2026-10-05T18:42:00Z"
  },
  "meta": {
    "apiVersion": "v2.4",
    "responseTimeMs": 14.2
  }
}`,
  geojson: `{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-122.4194, 37.7749]
      },
      "properties": {
        "name": "San Francisco Tech Center",
        "category": "Office",
        "active": true
      }
    }
  ]
}`,
  packageJson: `{
  "name": "digital-tools-suite",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^15.2.0",
    "react": "^19.0.0",
    "lucide-react": "^0.540.0"
  }
}`,
};

// Tree node component for interactive JSON Tree
const JsonTreeNode: React.FC<{ keyName?: string; value: any; depth?: number }> = ({
  keyName,
  value,
  depth = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(depth < 2);

  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);

  const type = isArray
    ? 'array'
    : value === null
    ? 'null'
    : typeof value;

  if (isObject) {
    const keys = Object.keys(value);
    const count = keys.length;

    return (
      <div className="pl-3 border-l border-slate-200 dark:border-slate-800 text-xs font-mono my-0.5">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded px-1 py-0.5 select-none"
        >
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )}
          {keyName && <span className="text-purple-600 dark:text-purple-400 font-semibold">&quot;{keyName}&quot;: </span>}
          <span className="text-slate-500 text-[11px]">
            {isArray ? `Array[${count}]` : `{${count} ${count === 1 ? 'key' : 'keys'}}`}
          </span>
        </div>

        {isExpanded && (
          <div className="mt-0.5">
            {keys.map((k) => (
              <JsonTreeNode key={k} keyName={isArray ? undefined : k} value={value[k]} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Primitive value
  let valueColor = 'text-slate-700 dark:text-slate-300';
  if (type === 'string') valueColor = 'text-emerald-600 dark:text-emerald-400';
  else if (type === 'number') valueColor = 'text-blue-600 dark:text-blue-400 font-bold';
  else if (type === 'boolean') valueColor = 'text-amber-600 dark:text-amber-400 font-bold';
  else if (type === 'null') valueColor = 'text-rose-500 italic';

  return (
    <div className="pl-5 text-xs font-mono py-0.5 flex items-baseline gap-1.5 flex-wrap">
      {keyName && <span className="text-purple-600 dark:text-purple-400 font-semibold">&quot;{keyName}&quot;: </span>}
      <span className={valueColor}>
        {type === 'string' ? `"${value}"` : String(value)}
      </span>
      <span className="text-[10px] text-slate-400 opacity-60">({type})</span>
    </div>
  );
};

export const JsonFormatterValidator: React.FC = () => {
  const [jsonInput, setJsonInput] = useState<string>(PRESETS.ecommerce);
  const [errorDetails, setErrorDetails] = useState<{ message: string; line?: number; position?: number } | null>(null);
  const [viewMode, setViewMode] = useState<'editor' | 'tree' | 'csv'>('editor');
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [autoFixNotice, setAutoFixNotice] = useState<string | null>(null);

  // Parse state
  const { parsedData, isValid } = useMemo(() => {
    if (!jsonInput.trim()) return { parsedData: null, isValid: false };
    try {
      const data = JSON.parse(jsonInput);
      return { parsedData: data, isValid: true };
    } catch {
      return { parsedData: null, isValid: false };
    }
  }, [jsonInput]);

  // Statistics calculation
  const stats = useMemo(() => {
    if (!parsedData) return null;
    let totalKeys = 0;
    let totalObjects = 0;
    let totalArrays = 0;
    let maxDepth = 0;

    const traverse = (node: any, currentDepth: number) => {
      if (currentDepth > maxDepth) maxDepth = currentDepth;
      if (node !== null && typeof node === 'object') {
        if (Array.isArray(node)) {
          totalArrays++;
          node.forEach((item) => traverse(item, currentDepth + 1));
        } else {
          totalObjects++;
          const keys = Object.keys(node);
          totalKeys += keys.length;
          keys.forEach((k) => traverse(node[k], currentDepth + 1));
        }
      }
    };

    traverse(parsedData, 1);

    const minified = JSON.stringify(parsedData);
    const formatted = JSON.stringify(parsedData, null, 2);
    const savings = Math.max(0, Math.round((1 - minified.length / formatted.length) * 100));

    return {
      totalKeys,
      totalObjects,
      totalArrays,
      maxDepth,
      formattedSize: formatted.length,
      minifiedSize: minified.length,
      savings,
    };
  }, [parsedData]);

  // Validate and format
  const validateAndFormat = (spaces: number) => {
    setErrorDetails(null);
    setAutoFixNotice(null);
    try {
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed, null, spaces);
      setJsonInput(formatted);
    } catch (err: any) {
      handleParseError(err);
    }
  };

  const handleMinify = () => {
    setErrorDetails(null);
    setAutoFixNotice(null);
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed));
    } catch (err: any) {
      handleParseError(err);
    }
  };

  const handleParseError = (err: any) => {
    const msg = err.message || 'Syntax error';
    const lineMatch = msg.match(/at line (\d+)/i) || msg.match(/line (\d+)/i);
    const posMatch = msg.match(/position (\d+)/i);
    setErrorDetails({
      message: msg,
      line: lineMatch ? parseInt(lineMatch[1], 10) : undefined,
      position: posMatch ? parseInt(posMatch[1], 10) : undefined,
    });
  };

  // Auto-Fix common JSON mistakes (trailing commas, single quotes, unquoted keys)
  const handleAutoFix = () => {
    setErrorDetails(null);
    let fixed = jsonInput;

    // 1. Replace single quotes around strings
    fixed = fixed.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');

    // 2. Fix unquoted keys e.g. { name: "John" } -> { "name": "John" }
    fixed = fixed.replace(/([{,]\s*)([a-zA-Z0-9_$-]+)\s*:/g, '$1"$2":');

    // 3. Remove trailing commas before } or ]
    fixed = fixed.replace(/,\s*([}\]])/g, '$1');

    try {
      const parsed = JSON.parse(fixed);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setAutoFixNotice('Syntax repaired successfully: single quotes replaced, unquoted keys fixed, and trailing commas removed.');
    } catch (err: any) {
      handleParseError(err);
      setAutoFixNotice('Auto-fix applied heuristics, but additional manual syntax correction is still required.');
    }
  };

  // Convert JSON Array to CSV
  const jsonToCsv = useMemo(() => {
    if (!parsedData) return '';
    const arrayData = Array.isArray(parsedData)
      ? parsedData
      : Array.isArray((parsedData as any).items)
      ? (parsedData as any).items
      : Array.isArray((parsedData as any).data)
      ? (parsedData as any).data
      : [parsedData];

    if (!arrayData.length || typeof arrayData[0] !== 'object') {
      return 'JSON structure cannot be flattened into tabular CSV. Requires an array of objects.';
    }

    const typedArray = arrayData as Record<string, any>[];
    const headers: string[] = Array.from(new Set(typedArray.flatMap((obj: Record<string, any>) => (obj && typeof obj === 'object' ? Object.keys(obj) : []))));
    const csvRows = [headers.join(',')];

    for (const row of typedArray) {
      const values = headers.map((header: string) => {
        const val = row[header];
        if (val === null || val === undefined) return '""';
        const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }, [parsedData]);

  // File Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonInput(content);
      setErrorDetails(null);
      setAutoFixNotice(null);
    };
    reader.readAsText(file);
  };

  const handleDownload = (format: 'json' | 'csv') => {
    const content = format === 'json' ? jsonInput : jsonToCsv;
    const mime = format === 'json' ? 'application/json' : 'text/csv';
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data_${Date.now()}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filtered view
  const filteredJson = useMemo(() => {
    if (!filterQuery.trim() || !parsedData) return null;
    const query = filterQuery.toLowerCase();

    const filterNode = (node: any): any => {
      if (node === null || typeof node !== 'object') {
        return String(node).toLowerCase().includes(query) ? node : undefined;
      }
      if (Array.isArray(node)) {
        const matched = node.map(filterNode).filter((v) => v !== undefined);
        return matched.length > 0 ? matched : undefined;
      }
      const result: Record<string, any> = {};
      let hasMatch = false;
      for (const [k, v] of Object.entries(node)) {
        if (k.toLowerCase().includes(query)) {
          result[k] = v;
          hasMatch = true;
        } else {
          const child = filterNode(v);
          if (child !== undefined) {
            result[k] = child;
            hasMatch = true;
          }
        }
      }
      return hasMatch ? result : undefined;
    };

    return filterNode(parsedData);
  }, [filterQuery, parsedData]);

  return (
    <div className="space-y-6">
      {/* Top Preset & Format Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Presets:</span>
          {Object.keys(PRESETS).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setJsonInput(PRESETS[key]);
                setErrorDetails(null);
                setAutoFixNotice(null);
              }}
              className="px-2.5 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 capitalize"
            >
              {key}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="cursor-pointer px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300">
            <span>Upload .JSON File</span>
            <input type="file" accept=".json,application/json,text/plain" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Main Action Bar */}
      <Card className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" onClick={() => validateAndFormat(2)} leftIcon={<Maximize2 className="w-3.5 h-3.5" />}>
            Beautify (2 Spaces)
          </Button>
          <Button size="sm" variant="secondary" onClick={() => validateAndFormat(4)}>
            Beautify (4 Spaces)
          </Button>
          <Button size="sm" variant="secondary" onClick={handleMinify} leftIcon={<Minimize2 className="w-3.5 h-3.5" />}>
            Minify JSON
          </Button>
          <Button size="sm" variant="outline" onClick={handleAutoFix} leftIcon={<Wrench className="w-3.5 h-3.5 text-amber-500" />}>
            Auto-Fix Syntax
          </Button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode('editor')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              viewMode === 'editor'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Code
          </button>
          <button
            type="button"
            onClick={() => setViewMode('tree')}
            disabled={!isValid}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors disabled:opacity-40 ${
              viewMode === 'tree'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Tree View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('csv')}
            disabled={!isValid}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors disabled:opacity-40 ${
              viewMode === 'csv'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            CSV Export
          </button>
        </div>

        <div className="flex items-center gap-2">
          <CopyButton textToCopy={jsonInput} />
          <Button size="sm" variant="outline" onClick={() => handleDownload('json')} leftIcon={<Download className="w-3.5 h-3.5" />}>
            Download .JSON
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setJsonInput('');
              setErrorDetails(null);
              setAutoFixNotice(null);
            }}
            aria-label="Clear JSON workspace"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
          </Button>
        </div>
      </Card>

      {/* Auto-Fix Banner */}
      {autoFixNotice && (
        <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50 text-xs text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{autoFixNotice}</span>
        </div>
      )}

      {/* Status Bar */}
      {errorDetails ? (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Invalid JSON Syntax:</span>
            <p className="font-mono">{errorDetails.message}</p>
            {errorDetails.line && (
              <p className="font-semibold text-rose-800 dark:text-rose-200">
                Check syntax around Line {errorDetails.line}
              </p>
            )}
            <p className="text-[11px] text-rose-600 dark:text-rose-400">
              Tip: Click &quot;Auto-Fix Syntax&quot; above to automatically repair unquoted keys, trailing commas, or single quotes.
            </p>
          </div>
        </div>
      ) : isValid && jsonInput.trim() ? (
        <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">Valid JSON Syntax · RFC 8259 Standard Verified</span>
          </div>
          {stats && (
            <div className="flex items-center gap-3 text-[11px] font-mono text-emerald-900 dark:text-emerald-200">
              <span>{stats.totalKeys} Keys</span>
              <span>•</span>
              <span>{stats.totalObjects} Objects</span>
              <span>•</span>
              <span>{stats.totalArrays} Arrays</span>
              <span>•</span>
              <span>Depth {stats.maxDepth}</span>
              <span>•</span>
              <span className="text-emerald-700 dark:text-emerald-300 font-bold">-{stats.savings}% Minified</span>
            </div>
          )}
        </div>
      ) : null}

      {/* Views */}
      {viewMode === 'editor' && (
        <Card className="p-0 overflow-hidden">
          <Textarea
            rows={18}
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value);
              try {
                if (e.target.value.trim()) {
                  JSON.parse(e.target.value);
                  setErrorDetails(null);
                }
              } catch (err: any) {
                // Keep typing fluidly, handle on explicit action
              }
            }}
            className="font-mono text-xs sm:text-sm leading-relaxed p-4 border-none focus:ring-0 rounded-none bg-white dark:bg-slate-950"
            placeholder="Paste JSON payload here..."
            aria-label="JSON code editor"
          />
        </Card>
      )}

      {viewMode === 'tree' && isValid && parsedData && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800 gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Filter keys or values..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
              {filterQuery && (
                <button type="button" onClick={() => setFilterQuery('')} className="text-xs text-slate-400 hover:text-slate-600">
                  Clear
                </button>
              )}
            </div>
            <span className="text-xs text-slate-500">Interactive Object Inspector</span>
          </div>

          <div className="max-h-[500px] overflow-y-auto p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            {filterQuery.trim() ? (
              filteredJson !== undefined ? (
                <JsonTreeNode value={filteredJson} />
              ) : (
                <div className="text-xs text-slate-400 p-4 text-center">No keys or values matched &quot;{filterQuery}&quot;</div>
              )
            ) : (
              <JsonTreeNode value={parsedData} />
            )}
          </div>
        </Card>
      )}

      {viewMode === 'csv' && isValid && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tabular CSV Export Preview
            </span>
            <div className="flex items-center gap-2">
              <CopyButton textToCopy={jsonToCsv} size="sm" />
              <Button size="sm" onClick={() => handleDownload('csv')} leftIcon={<Download className="w-3.5 h-3.5" />}>
                Download .CSV
              </Button>
            </div>
          </div>
          <Textarea
            rows={14}
            value={jsonToCsv}
            readOnly
            className="font-mono text-xs bg-slate-50 dark:bg-slate-950"
            aria-label="CSV output"
          />
        </Card>
      )}
    </div>
  );
};
