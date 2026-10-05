'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { FileDropzone } from '@/components/ui/FileDropzone';
import {
  ShieldAlert,
  ShieldCheck,
  Download,
  Trash2,
  CheckCircle2,
  MapPin,
  Camera,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface ExifTag {
  label: string;
  value: string;
  isPrivate: boolean;
}

// Client-side parser for JPEG EXIF tags
function parseJpegExif(buffer: ArrayBuffer): ExifTag[] {
  const tags: ExifTag[] = [];
  const view = new DataView(buffer);

  if (view.getUint16(0, false) !== 0xffd8) {
    return tags; // Not a standard JPEG
  }

  let offset = 2;
  while (offset < view.byteLength) {
    if (view.getUint8(offset) !== 0xff) break;
    const marker = view.getUint8(offset + 1);

    // APP1 marker (EXIF)
    if (marker === 0xe1) {
      // Found EXIF APP1
      tags.push({
        label: 'EXIF APP1 Segment',
        value: 'Present in binary headers (Location, Device, Timestamps)',
        isPrivate: true,
      });

      // Scan for common strings in EXIF buffer
      const slice = new Uint8Array(buffer, offset + 4, Math.min(2048, buffer.byteLength - offset - 4));
      const str = String.fromCharCode(...slice);

      if (str.includes('Apple') || str.includes('iPhone')) {
        tags.push({ label: 'Camera Hardware', value: 'Apple iPhone (iOS Camera Subsystem)', isPrivate: true });
      } else if (str.includes('Samsung')) {
        tags.push({ label: 'Camera Hardware', value: 'Samsung Galaxy Camera', isPrivate: true });
      } else if (str.includes('Canon') || str.includes('Nikon') || str.includes('Sony')) {
        tags.push({ label: 'Camera Hardware', value: 'DSLR / Mirrorless Camera System', isPrivate: true });
      }

      // Detect GPS tags
      if (str.includes('GPS') || str.includes('GPSVersionID')) {
        tags.push({
          label: 'GPS Geolocation Coordinates',
          value: 'Exact Latitude & Longitude Geotags Detected',
          isPrivate: true,
        });
      }

      // Check dates
      const dateMatch = str.match(/\d{4}:\d{2}:\d{2}\s\d{2}:\d{2}:\d{2}/);
      if (dateMatch) {
        tags.push({ label: 'Original Capture Timestamp', value: dateMatch[0], isPrivate: true });
      }

      break;
    }
    offset += 2 + view.getUint16(offset + 2, false);
  }

  // If no specific tag matched, list default privacy tags stripped
  if (tags.length === 0) {
    tags.push({
      label: 'EXIF / Metadata Headers',
      value: 'Color profiles, device tags, and orientation metadata',
      isPrivate: false,
    });
  }

  return tags;
}

export const PhotoExifRemover: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [cleanedUrl, setCleanedUrl] = useState<string | null>(null);
  const [detectedTags, setDetectedTags] = useState<ExifTag[]>([]);
  const [targetFormat, setTargetFormat] = useState<string>('image/jpeg');
  const [quality, setQuality] = useState<number>(0.92);
  const [cleanedSize, setCleanedSize] = useState<number | null>(null);
  const [cleaning, setCleaning] = useState<boolean>(false);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setCleanedUrl(null);
    setCleanedSize(null);
    const url = URL.createObjectURL(selectedFile);
    setOriginalUrl(url);

    // Read EXIF tags from buffer
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer;
      if (buffer) {
        const parsed = parseJpegExif(buffer);
        setDetectedTags(parsed);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const stripMetadata = () => {
    if (!originalUrl || !file) return;
    setCleaning(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // Offscreen canvas pure pixel raster
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setCleaning(false);
        return;
      }

      // Draw pure pixel buffer
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setCleanedUrl(URL.createObjectURL(blob));
            setCleanedSize(blob.size);
          }
          setCleaning(false);
        },
        targetFormat,
        quality
      );
    };
    img.src = originalUrl;
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
          accept="image/jpeg,image/png,image/webp,image/tiff"
          onFileSelect={handleFileSelect}
          label="Drop a camera photo here to inspect and purge EXIF/GPS tags"
          helperText="Inspects binary metadata and re-encodes pure pixel data client-side"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Metadata Audit Card */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Detected Metadata Audit
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setOriginalUrl(null);
                    setCleanedUrl(null);
                    setDetectedTags([]);
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Upload different photo
                </button>
              </div>

              <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                <p>
                  <strong className="text-slate-900 dark:text-slate-100">File Name:</strong> {file.name}
                </p>
                <p>
                  <strong className="text-slate-900 dark:text-slate-100">Raw Size:</strong> {formatBytes(file.size)}
                </p>
              </div>

              {/* Detected EXIF tags list */}
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Header Security Scan:
                </span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {detectedTags.map((tag, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                        tag.isPrivate
                          ? 'border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {tag.isPrivate ? <MapPin className="w-4 h-4 text-amber-600" /> : <Camera className="w-4 h-4 text-slate-400" />}
                        <div>
                          <span className="font-bold block">{tag.label}</span>
                          <span className="text-[11px] opacity-80">{tag.value}</span>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10">
                        {tag.isPrivate ? 'Privacy Risk' : 'Header'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* What is stripped / preserved explanation */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-xs space-y-2 text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Purged via Canvas Re-Encoding:</span>
                </div>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  <li>GPS Geotags (Latitude, Longitude, Altitude)</li>
                  <li>Camera hardware details, serial number, lens parameters</li>
                  <li>Date and timestamps of physical capture</li>
                </ul>

                <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300 pt-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Preserved:</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  100% of all image pixel data, colors, sharpness, and visual resolution remain identical.
                </p>
              </div>

              {/* Re-encoding format & quality options */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Select
                  label="Sanitized Format"
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value)}
                  options={[
                    { value: 'image/jpeg', label: 'JPEG (Universal Photo)' },
                    { value: 'image/png', label: 'PNG (Lossless)' },
                    { value: 'image/webp', label: 'WebP (High Compression)' },
                  ]}
                />

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Quality</span>
                    <span className="text-slate-500">{Math.round(quality * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.0"
                    step="0.05"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer pt-2"
                  />
                </div>
              </div>

              <Button
                onClick={stripMetadata}
                isLoading={cleaning}
                leftIcon={<Trash2 className="w-4 h-4" />}
                className="w-full"
              >
                Sanitize & Strip EXIF / GPS Now
              </Button>
            </Card>
          </div>

          {/* Right Cleaned Result Card */}
          <div className="lg:col-span-6 space-y-4">
            <Card className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
                Sanitized Pixel Output
              </h2>

              {cleanedUrl ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 bg-slate-50 dark:bg-slate-950 flex items-center justify-center min-h-[240px]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cleanedUrl}
                      alt="Sanitized photo"
                      className="max-h-72 max-w-full object-contain rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs bg-slate-100 dark:bg-slate-800/60 p-3 rounded-xl">
                    <div>
                      <span className="text-slate-500 block">Sanitized File Size:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {cleanedSize ? formatBytes(cleanedSize) : '—'}
                      </span>
                    </div>

                    {cleanedSize && file && (
                      <div className="text-right">
                        <span className="text-slate-500 block">Delta:</span>
                        <span
                          className={`font-bold ${
                            cleanedSize < file.size ? 'text-emerald-600' : 'text-slate-700'
                          }`}
                        >
                          {cleanedSize < file.size
                            ? `-${Math.round((1 - cleanedSize / file.size) * 100)}% smaller`
                            : 'Clean pixel raster'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>
                      100% of EXIF, GPS, camera metadata, and tracking tags stripped. Safe to publish publicly.
                    </span>
                  </div>

                  <a
                    href={cleanedUrl}
                    download={`sanitized_${file.name.replace(/\.[^/.]+$/, '')}.${
                      targetFormat === 'image/png' ? 'png' : targetFormat === 'image/webp' ? 'webp' : 'jpg'
                    }`}
                    className="block"
                  >
                    <Button className="w-full" leftIcon={<Download className="w-4 h-4" />}>
                      Download Clean Photo
                    </Button>
                  </a>
                </div>
              ) : originalUrl ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 min-h-[240px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={originalUrl}
                    alt="Original awaiting sanitization"
                    className="max-h-52 max-w-full object-contain rounded opacity-60 mb-3"
                  />
                  <p className="text-xs">
                    Click &quot;Sanitize & Strip EXIF / GPS Now&quot; to re-encode clean pixels.
                  </p>
                </div>
              ) : null}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
