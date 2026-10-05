'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { CopyButton } from '@/components/ui/CopyButton';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { Download, Code, Image as ImageIcon, ArrowLeftRight, Check, Sparkles } from 'lucide-react';

const PRESET_SAMPLES = {
  transparentPixel:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  svgStar:
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjZjU5ZTA4Ij48cG9seWdvbiBwb2ludHM9IjEyIDIgMTUgOC41IDIyIDkuMyAxNyAxNC4xIDE4LjUgMjEgMTIgMTcuNSA1LjUgMjEgNyAxNC4xIDIgOS4zIDkgOC41IDEyIDIiLz48L3N2Zz4=',
  blueBadge:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAALElEQVRYR+3QQREAAAgDMCyA/btGBNczYf9m25f2K8DAwMDAwMDAwMDAwMBgoIB5fAJ402lOogAAAABJRU5ErkJggg==',
};

export const Base64ImageConverter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'encode' | 'decode'>('encode');

  // Encoder state
  const [encodedUri, setEncodedUri] = useState<string>('');
  const [fileDetails, setFileDetails] = useState<{
    name: string;
    size: number;
    type: string;
    width?: number;
    height?: number;
  } | null>(null);

  // Decoder state
  const [decodeInput, setDecodeInput] = useState<string>('');
  const [decodeFormat, setDecodeFormat] = useState<'png' | 'jpeg' | 'webp'>('png');

  const handleFileToEncode = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setEncodedUri(result || '');

      const img = new Image();
      img.onload = () => {
        setFileDetails({
          name: file.name,
          size: file.size,
          type: file.type || 'image/png',
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  // Strip prefix for raw base64 string
  const rawBase64Only = encodedUri.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

  // Snippets
  const htmlImgTag = encodedUri ? `<img src="${encodedUri}" alt="Embedded graphic" />` : '';
  const cssBackgroundSnippet = encodedUri ? `background-image: url("${encodedUri}");` : '';
  const reactJsxSnippet = encodedUri ? `<img src="${encodedUri}" alt="Graphic" width={${fileDetails?.width || 100}} height={${fileDetails?.height || 100}} />` : '';
  const markdownSnippet = encodedUri ? `![Embedded Asset](${encodedUri})` : '';

  const handleDownloadDecoded = () => {
    if (!decodeInput.trim()) return;
    const link = document.createElement('a');
    link.href = decodeInput.trim();
    link.download = `decoded_image_${Date.now()}.${decodeFormat}`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('encode')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'encode'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Image to Base64 (Encode)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('decode')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'decode'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>Base64 to Image (Decode)</span>
        </button>
      </div>

      {activeTab === 'encode' ? (
        <div className="space-y-6">
          {!encodedUri ? (
            <div className="space-y-4">
              <FileDropzone
                accept="image/*"
                onFileSelect={handleFileToEncode}
                label="Drop any image file here to encode to Base64"
                helperText="PNG, JPEG, WebP, SVG, GIF, ICO, or BMP up to 20MB"
              />

              {/* Sample Presets */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="text-slate-500 font-semibold uppercase tracking-wider">Try Sample Assets:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEncodedUri(PRESET_SAMPLES.svgStar);
                      setFileDetails({ name: 'gold-star.svg', size: 312, type: 'image/svg+xml', width: 48, height: 48 });
                    }}
                    className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 font-medium"
                  >
                    SVG Gold Star
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEncodedUri(PRESET_SAMPLES.transparentPixel);
                      setFileDetails({ name: 'transparent-1x1.png', size: 68, type: 'image/png', width: 1, height: 1 });
                    }}
                    className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 font-medium"
                  >
                    1x1 Transparent PNG
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Asset Meta Info */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-1 flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={encodedUri} alt="Encoded thumbnail" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 dark:text-white block">{fileDetails?.name}</span>
                    <span className="text-slate-500">
                      {fileDetails?.width} × {fileDetails?.height} px · {fileDetails?.type} · Original:{' '}
                      {((fileDetails?.size || 0) / 1024).toFixed(1)} KB → Base64:{' '}
                      {(encodedUri.length / 1024).toFixed(1)} KB (+33% base64 payload ratio)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEncodedUri('');
                    setFileDetails(null);
                  }}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Encode another image
                </button>
              </div>

              {/* Data URI String Card */}
              <Card className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Standard Data URI Scheme (Ready for img src / CSS)
                  </span>
                  <div className="flex items-center gap-2">
                    <CopyButton textToCopy={rawBase64Only} label="Copy Raw Base64" size="sm" />
                    <CopyButton textToCopy={encodedUri} label="Copy Data URI" size="sm" />
                  </div>
                </div>
                <div className="max-h-36 overflow-y-auto p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs break-all text-slate-700 dark:text-slate-300 select-all">
                  {encodedUri}
                </div>
              </Card>

              {/* Code Snippets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">HTML &lt;img&gt; Tag</span>
                    <CopyButton textToCopy={htmlImgTag} size="sm" />
                  </div>
                  <pre className="p-3 rounded-lg bg-slate-100 dark:bg-slate-950 text-xs font-mono overflow-x-auto truncate">
                    {htmlImgTag}
                  </pre>
                </Card>

                <Card className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">CSS background-image</span>
                    <CopyButton textToCopy={cssBackgroundSnippet} size="sm" />
                  </div>
                  <pre className="p-3 rounded-lg bg-slate-100 dark:bg-slate-950 text-xs font-mono overflow-x-auto truncate">
                    {cssBackgroundSnippet}
                  </pre>
                </Card>

                <Card className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">React JSX &lt;img&gt;</span>
                    <CopyButton textToCopy={reactJsxSnippet} size="sm" />
                  </div>
                  <pre className="p-3 rounded-lg bg-slate-100 dark:bg-slate-950 text-xs font-mono overflow-x-auto truncate">
                    {reactJsxSnippet}
                  </pre>
                </Card>

                <Card className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Markdown Format</span>
                    <CopyButton textToCopy={markdownSnippet} size="sm" />
                  </div>
                  <pre className="p-3 rounded-lg bg-slate-100 dark:bg-slate-950 text-xs font-mono overflow-x-auto truncate">
                    {markdownSnippet}
                  </pre>
                </Card>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Decode Tab */
        <div className="space-y-6">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Paste Base64 Encoded String or Data URI
              </span>
              <button
                type="button"
                onClick={() => setDecodeInput(PRESET_SAMPLES.svgStar)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Load Sample Star SVG
              </button>
            </div>

            <Textarea
              rows={6}
              value={decodeInput}
              onChange={(e) => setDecodeInput(e.target.value)}
              placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
              className="font-mono text-xs"
              aria-label="Base64 data string input"
            />
          </Card>

          {decodeInput.trim() && (
            <Card className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Reconstructed Image Output
                </span>

                <div className="flex items-center gap-2">
                  <select
                    value={decodeFormat}
                    onChange={(e) => setDecodeFormat(e.target.value as any)}
                    className="px-2 py-1 text-xs rounded border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
                  >
                    <option value="png">Save as PNG</option>
                    <option value="jpeg">Save as JPEG</option>
                    <option value="webp">Save as WebP</option>
                  </select>

                  <Button size="sm" onClick={handleDownloadDecoded} leftIcon={<Download className="w-3.5 h-3.5" />}>
                    Download Image File
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-center p-8 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 min-h-[220px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    decodeInput.startsWith('data:')
                      ? decodeInput.trim()
                      : `data:image/png;base64,${decodeInput.trim()}`
                  }
                  alt="Decoded result preview"
                  className="max-h-72 max-w-full object-contain rounded shadow-xs"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
