'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { Download, RefreshCw, Image as ImageIcon, ArrowLeftRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const ImageFormatConverter: React.FC = () => {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [sourceDimensions, setSourceDimensions] = useState<{ width: number; height: number } | null>(null);

  const [targetFormat, setTargetFormat] = useState<string>('image/webp');
  const [quality, setQuality] = useState<number>(0.85);
  const [fillBgColor, setFillBgColor] = useState<string>('#ffffff'); // For transparent images converted to JPEG
  const [scaleFactor, setScaleFactor] = useState<number>(100);

  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [convertedSize, setConvertedSize] = useState<number | null>(null);
  const [converting, setConverting] = useState<boolean>(false);

  const handleFileSelect = (file: File) => {
    setSourceFile(file);
    setConvertedUrl(null);
    setConvertedSize(null);
    const url = URL.createObjectURL(file);
    setSourcePreview(url);

    const img = new Image();
    img.onload = () => {
      setSourceDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = url;
  };

  const handleConvert = () => {
    if (!sourcePreview || !sourceFile) return;
    setConverting(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const scale = scaleFactor / 100;
      const targetW = Math.max(1, Math.round(img.naturalWidth * scale));
      const targetH = Math.max(1, Math.round(img.naturalHeight * scale));

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setConverting(false);
        return;
      }

      // If converting to JPEG or specified background
      if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = fillBgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetW, targetH);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setConvertedUrl(url);
            setConvertedSize(blob.size);
          }
          setConverting(false);
        },
        targetFormat,
        quality
      );
    };
    img.src = sourcePreview;
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getExtension = () => {
    switch (targetFormat) {
      case 'image/png':
        return 'png';
      case 'image/jpeg':
        return 'jpg';
      case 'image/webp':
        return 'webp';
      case 'image/avif':
        return 'avif';
      default:
        return 'bin';
    }
  };

  return (
    <div className="space-y-6">
      {!sourceFile ? (
        <FileDropzone
          accept="image/png,image/jpeg,image/webp,image/avif,image/gif,image/bmp"
          onFileSelect={handleFileSelect}
          label="Drop an image file here to convert format"
          helperText="Converts PNG, JPG, WebP, AVIF, BMP client-side in browser memory"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Conversion Settings
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSourceFile(null);
                    setSourcePreview(null);
                    setConvertedUrl(null);
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Choose different file
                </button>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <p>
                  <strong className="text-slate-900 dark:text-slate-100">Original:</strong> {sourceFile.name}
                </p>
                <p>
                  <strong className="text-slate-900 dark:text-slate-100">Dimensions:</strong>{' '}
                  {sourceDimensions?.width} × {sourceDimensions?.height} px ({formatBytes(sourceFile.size)})
                </p>
              </div>

              <Select
                label="Target Format"
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value)}
                options={[
                  { value: 'image/webp', label: 'WEBP (Recommended for Fast Web Loading)' },
                  { value: 'image/png', label: 'PNG (Lossless with Full Alpha Transparency)' },
                  { value: 'image/jpeg', label: 'JPEG (Universal Photo Standard)' },
                  { value: 'image/avif', label: 'AVIF (Next-Gen High Efficiency)' },
                ]}
              />

              {/* Quality Slider */}
              {targetFormat !== 'image/png' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Compression Quality
                    </span>
                    <span className="font-mono text-slate-500">{Math.round(quality * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              )}

              {/* Scale / Dimension Presets */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Scale Dimensions: {scaleFactor}% (
                  {Math.round((sourceDimensions?.width || 0) * (scaleFactor / 100))} ×{' '}
                  {Math.round((sourceDimensions?.height || 0) * (scaleFactor / 100))} px)
                </span>
                <div className="flex gap-2">
                  {[100, 75, 50, 25].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setScaleFactor(pct)}
                      className={`px-3 py-1 text-xs rounded-md border font-semibold ${
                        scaleFactor === pct
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Background color for JPEG */}
              {targetFormat === 'image/jpeg' && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Transparent Alpha Background Fill
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={fillBgColor}
                      onChange={(e) => setFillBgColor(e.target.value)}
                      className="w-10 h-8 p-0 rounded cursor-pointer border border-slate-300 dark:border-slate-700"
                    />
                    <span className="text-xs font-mono">{fillBgColor} (Prevents black background in JPEG)</span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleConvert}
                isLoading={converting}
                leftIcon={<RefreshCw className="w-4 h-4" />}
                className="w-full"
              >
                Convert Image Format
              </Button>
            </Card>
          </div>

          {/* Right Preview and Download Stage */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
                Converted Output Preview
              </h2>

              {convertedUrl ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 bg-slate-50 dark:bg-slate-950 flex items-center justify-center min-h-[260px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={convertedUrl}
                      alt="Converted output"
                      className="max-h-72 max-w-full object-contain rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs bg-slate-100 dark:bg-slate-800/60 p-3.5 rounded-xl">
                    <div>
                      <span className="text-slate-500 block">Converted Size:</span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {convertedSize ? formatBytes(convertedSize) : '—'}
                      </span>
                    </div>

                    {convertedSize && sourceFile && (
                      <div className="text-right">
                        <span className="text-slate-500 block">Compression Delta:</span>
                        <span
                          className={`font-bold text-sm ${
                            convertedSize < sourceFile.size ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {convertedSize < sourceFile.size
                            ? `-${Math.round((1 - convertedSize / sourceFile.size) * 100)}% smaller`
                            : `+${Math.round((convertedSize / sourceFile.size - 1) * 100)}% larger`}
                        </span>
                      </div>
                    )}
                  </div>

                  <a
                    href={convertedUrl}
                    download={`converted_${Date.now()}.${getExtension()}`}
                    className="block"
                  >
                    <Button className="w-full" leftIcon={<Download className="w-4 h-4" />}>
                      Download Converted {getExtension().toUpperCase()} Image
                    </Button>
                  </a>
                </div>
              ) : sourcePreview ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 min-h-[260px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sourcePreview}
                    alt="Original upload"
                    className="max-h-52 max-w-full object-contain rounded opacity-60 mb-3"
                  />
                  <p className="text-xs">Select target parameters and click &quot;Convert Image Format&quot;.</p>
                </div>
              ) : null}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
