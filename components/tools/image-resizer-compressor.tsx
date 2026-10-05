'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { Download, Lock, Unlock, RefreshCw, Sparkles, CheckCircle2, Target } from 'lucide-react';

const SOCIAL_PRESETS = [
  { name: 'Instagram Square', w: 1080, h: 1080 },
  { name: 'Instagram Story / Reel', w: 1080, h: 1920 },
  { name: 'YouTube 720p Thumbnail', w: 1280, h: 720 },
  { name: 'Twitter / X Post', w: 1200, h: 675 },
  { name: 'LinkedIn Banner', w: 1584, h: 396 },
  { name: 'Facebook Cover', w: 820, h: 312 },
  { name: 'Web Favicon', w: 64, h: 64 },
];

export const ImageResizerCompressor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [origWidth, setOrigWidth] = useState<number>(0);
  const [origHeight, setOrigHeight] = useState<number>(0);

  const [targetWidth, setTargetWidth] = useState<number>(0);
  const [targetHeight, setTargetHeight] = useState<number>(0);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [fitMode, setFitMode] = useState<'fit' | 'fill'>('fit');
  const [exportFormat, setExportFormat] = useState<string>('image/jpeg');
  const [quality, setQuality] = useState<number>(0.85);

  // Target size compression mode
  const [enableTargetSize, setEnableTargetSize] = useState<boolean>(false);
  const [targetSizeKb, setTargetSizeKb] = useState<number>(100);

  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setOutputUrl(null);
    setOutputSize(null);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    const img = new Image();
    img.onload = () => {
      setOrigWidth(img.naturalWidth);
      setOrigHeight(img.naturalHeight);
      setTargetWidth(img.naturalWidth);
      setTargetHeight(img.naturalHeight);
    };
    img.src = url;
  };

  const handleWidthChange = (w: number) => {
    setTargetWidth(w);
    if (lockAspect && origWidth > 0 && origHeight > 0) {
      setTargetHeight(Math.round((w / origWidth) * origHeight));
    }
  };

  const handleHeightChange = (h: number) => {
    setTargetHeight(h);
    if (lockAspect && origWidth > 0 && origHeight > 0) {
      setTargetWidth(Math.round((h / origHeight) * origWidth));
    }
  };

  const applyPreset = (w: number, h: number) => {
    setLockAspect(false);
    setTargetWidth(w);
    setTargetHeight(h);
  };

  const handleResizeAndCompress = async () => {
    if (!previewUrl || targetWidth <= 0 || targetHeight <= 0) return;
    setProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setProcessing(false);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (fitMode === 'fit') {
        // Fit within dimensions preserving aspect
        const hRatio = targetWidth / img.naturalWidth;
        const vRatio = targetHeight / img.naturalHeight;
        const ratio = Math.min(hRatio, vRatio);
        const centerShiftX = (targetWidth - img.naturalWidth * ratio) / 2;
        const centerShiftY = (targetHeight - img.naturalHeight * ratio) / 2;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, centerShiftX, centerShiftY, img.naturalWidth * ratio, img.naturalHeight * ratio);
      } else {
        // Center crop / fill
        const hRatio = targetWidth / img.naturalWidth;
        const vRatio = targetHeight / img.naturalHeight;
        const ratio = Math.max(hRatio, vRatio);
        const centerShiftX = (targetWidth - img.naturalWidth * ratio) / 2;
        const centerShiftY = (targetHeight - img.naturalHeight * ratio) / 2;

        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, centerShiftX, centerShiftY, img.naturalWidth * ratio, img.naturalHeight * ratio);
      }

      if (enableTargetSize && targetSizeKb > 0) {
        // Binary search for optimal quality to meet target KB
        let low = 0.05;
        let high = 0.98;
        let bestBlob: Blob | null = null;
        const targetBytes = targetSizeKb * 1024;

        for (let iter = 0; iter < 6; iter++) {
          const mid = (low + high) / 2;
          const blob: Blob | null = await new Promise((resolve) =>
            canvas.toBlob((b) => resolve(b), exportFormat, mid)
          );
          if (!blob) break;

          bestBlob = blob;
          if (blob.size > targetBytes) {
            high = mid; // Needs more compression
          } else {
            low = mid; // Can afford higher quality
          }
        }

        if (bestBlob) {
          setOutputUrl(URL.createObjectURL(bestBlob));
          setOutputSize(bestBlob.size);
        }
      } else {
        // Standard single pass
        canvas.toBlob(
          (blob) => {
            if (blob) {
              setOutputUrl(URL.createObjectURL(blob));
              setOutputSize(blob.size);
            }
          },
          exportFormat,
          quality
        );
      }

      setProcessing(false);
    };
    img.src = previewUrl;
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <FileDropzone
          accept="image/*"
          onFileSelect={handleFileSelect}
          label="Drop an image here to resize dimensions and compress"
          helperText="Resize, center-crop, compress to target KB with zero server uploads"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Resize & Compress Engine
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                    setOutputUrl(null);
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Change Image
                </button>
              </div>

              <div className="text-xs text-slate-500">
                Original: <strong className="text-slate-800 dark:text-slate-200">{origWidth} × {origHeight} px</strong> ({formatBytes(file.size)})
              </div>

              {/* Social Presets */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Platform Presets
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SOCIAL_PRESETS.map((pre) => (
                    <button
                      key={pre.name}
                      type="button"
                      onClick={() => applyPreset(pre.w, pre.h)}
                      className="px-2.5 py-1 text-[11px] rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {pre.name} ({pre.w}×{pre.h})
                    </button>
                  ))}
                </div>
              </div>

              {/* Dimension Inputs */}
              <div className="grid grid-cols-2 gap-3 items-end pt-1">
                <Input
                  label="Width (Pixels)"
                  type="number"
                  min={1}
                  value={targetWidth}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                />
                <Input
                  label="Height (Pixels)"
                  type="number"
                  min={1}
                  value={targetHeight}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                />
              </div>

              {/* Aspect Ratio Lock & Fit Mode */}
              <div className="flex items-center justify-between text-xs pt-1 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setLockAspect(!lockAspect)}
                  className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900"
                >
                  {lockAspect ? <Lock className="w-3.5 h-3.5 text-blue-600" /> : <Unlock className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{lockAspect ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Scale Mode:</span>
                  <select
                    value={fitMode}
                    onChange={(e) => setFitMode(e.target.value as any)}
                    className="px-2 py-0.5 text-xs rounded border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
                  >
                    <option value="fit">Fit (Pad with white)</option>
                    <option value="fill">Fill (Center Crop)</option>
                  </select>
                </div>
              </div>

              {/* Format selection */}
              <Select
                label="Output Format"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                options={[
                  { value: 'image/jpeg', label: 'JPEG (Best for Photos & Size Reduction)' },
                  { value: 'image/webp', label: 'WebP (Next-Gen High Compression)' },
                  { value: 'image/png', label: 'PNG (Lossless Quality)' },
                ]}
              />

              {/* Target KB Mode vs Quality Slider */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={enableTargetSize}
                    onChange={(e) => setEnableTargetSize(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-blue-600" />
                    <span>Compress to Exact Target File Size (Max KB)</span>
                  </span>
                </label>

                {enableTargetSize ? (
                  <Input
                    label="Maximum Target File Size (KB)"
                    type="number"
                    min={10}
                    max={5000}
                    value={targetSizeKb}
                    onChange={(e) => setTargetSizeKb(Number(e.target.value))}
                    rightAddon="KB"
                    helperText="Calculates iterative optimal quality level to stay under this threshold."
                  />
                ) : (
                  exportFormat !== 'image/png' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Compression Quality</span>
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
                  )
                )}
              </div>

              <Button
                onClick={handleResizeAndCompress}
                isLoading={processing}
                leftIcon={<RefreshCw className="w-4 h-4" />}
                className="w-full"
              >
                Compile Resized & Compressed Image
              </Button>
            </Card>
          </div>

          {/* Right Column: Output Preview */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
                Processed Preview
              </h2>

              {outputUrl ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 bg-slate-50 dark:bg-slate-950 flex items-center justify-center min-h-[250px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={outputUrl}
                      alt="Resized result"
                      className="max-h-72 max-w-full object-contain rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs bg-slate-100 dark:bg-slate-800/60 p-3.5 rounded-xl">
                    <div>
                      <span className="text-slate-500 block">Output Dimensions:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {targetWidth} × {targetHeight} px
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-500 block">Final Size:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {outputSize ? formatBytes(outputSize) : '—'}
                      </span>
                    </div>
                  </div>

                  <a
                    href={outputUrl}
                    download={`resized_${targetWidth}x${targetHeight}.${exportFormat === 'image/png' ? 'png' : exportFormat === 'image/webp' ? 'webp' : 'jpg'}`}
                    className="block"
                  >
                    <Button className="w-full" leftIcon={<Download className="w-4 h-4" />}>
                      Download Resized Image
                    </Button>
                  </a>
                </div>
              ) : previewUrl ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 min-h-[250px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Original preview"
                    className="max-h-52 max-w-full object-contain rounded opacity-60 mb-3"
                  />
                  <p className="text-xs">Adjust dimensions or target KB, then click compile.</p>
                </div>
              ) : null}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
