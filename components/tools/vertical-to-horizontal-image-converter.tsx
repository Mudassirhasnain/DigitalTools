'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, ImageIcon } from 'lucide-react';

type FillMode = 'blur' | 'solid' | 'crop' | 'rotate';

const RATIOS: Record<string, [number, number]> = {
  '16:9': [16, 9],
  '4:3': [4, 3],
  '3:2': [3, 2],
  '1.91:1': [191, 100],
  '2:1': [2, 1],
};

let filterSupportCache: boolean | null = null;
function supportsCanvasFilter(): boolean {
  if (filterSupportCache !== null) return filterSupportCache;
  try {
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    if (!ctx) {
      filterSupportCache = false;
      return false;
    }
    ctx.filter = 'blur(2px)';
    filterSupportCache = ctx.filter === 'blur(2px)';
  } catch {
    filterSupportCache = false;
  }
  return filterSupportCache;
}

interface RenderOptions {
  mode: FillMode;
  ratio: string;
  width: number;
  color: string;
  blur: number;
  focus: number;
  rotateDir: 'cw' | 'ccw';
  format: 'png' | 'jpeg';
}

function renderToCanvas(img: HTMLImageElement, canvas: HTMLCanvasElement, o: RenderOptions) {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  if (o.mode === 'rotate') {
    canvas.width = ih;
    canvas.height = iw;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (o.format === 'jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(o.rotateDir === 'cw' ? Math.PI / 2 : -Math.PI / 2);
    ctx.drawImage(img, -iw / 2, -ih / 2);
    return;
  }

  const [rw, rh] = RATIOS[o.ratio] ?? RATIOS['16:9'];
  const W = o.width;
  const H = Math.round((W * rh) / rw);
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (o.mode === 'crop') {
    if (o.format === 'jpeg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
    }
    const scale = Math.max(W / iw, H / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.drawImage(img, (W - dw) / 2, (H - dh) * o.focus, dw, dh);
    return;
  }

  if (o.mode === 'solid') {
    ctx.fillStyle = o.color;
    ctx.fillRect(0, 0, W, H);
  } else {
    // Blurred background made from the same photo, scaled to cover the frame
    const cover = Math.max(W / iw, H / ih);
    const cw = iw * cover;
    const ch = ih * cover;
    const blurPx = o.blur * (W / 1920);
    if (supportsCanvasFilter()) {
      ctx.filter = `blur(${blurPx}px)`;
      const grow = 1.15; // oversize so blurred edges never show transparent borders
      ctx.drawImage(img, (W - cw * grow) / 2, (H - ch * grow) / 2, cw * grow, ch * grow);
      ctx.filter = 'none';
    } else {
      const small = document.createElement('canvas');
      const factor = Math.max(8, Math.round(o.blur));
      small.width = Math.max(2, Math.round(W / factor));
      small.height = Math.max(2, Math.round(H / factor));
      const sctx = small.getContext('2d');
      if (sctx) {
        sctx.imageSmoothingQuality = 'high';
        sctx.drawImage(img, (small.width - cw / factor) / 2, (small.height - ch / factor) / 2, cw / factor, ch / factor);
        ctx.drawImage(small, 0, 0, W, H);
      }
    }
    // Soft dark overlay so the sharp photo stands out
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.fillRect(0, 0, W, H);
  }

  const contain = Math.min(W / iw, H / ih);
  const dw = iw * contain;
  const dh = ih * contain;
  ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
}

export const VerticalToHorizontalImageConverter: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const urlRef = useRef<string | null>(null);

  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState('image');
  const [error, setError] = useState('');

  const [mode, setMode] = useState<FillMode>('blur');
  const [ratio, setRatio] = useState('16:9');
  const [width, setWidth] = useState('1920');
  const [color, setColor] = useState('#0f172a');
  const [blur, setBlur] = useState(30);
  const [focus, setFocus] = useState('0.5');
  const [rotateDir, setRotateDir] = useState<'cw' | 'ccw'>('cw');
  const [format, setFormat] = useState<'png' | 'jpeg'>('jpeg');

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const handleFile = useCallback((file: File) => {
    setError('');
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file such as JPG, PNG, or WEBP.');
      return;
    }
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(file);
    urlRef.current = url;
    const image = new Image();
    image.onload = () => {
      setImg(image);
      setFileName(file.name.replace(/\.[^.]+$/, '') || 'image');
    };
    image.onerror = () => setError('This image could not be read. Try a different file.');
    image.src = url;
  }, []);

  useEffect(() => {
    if (!img || !canvasRef.current) return;
    renderToCanvas(img, canvasRef.current, {
      mode,
      ratio,
      width: parseInt(width, 10),
      color,
      blur,
      focus: parseFloat(focus),
      rotateDir,
      format,
    });
  }, [img, mode, ratio, width, color, blur, focus, rotateDir, format]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const mime = format === 'png' ? 'image/png' : 'image/jpeg';
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError('The image could not be exported. Try a smaller output width.');
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}-horizontal.${format === 'png' ? 'png' : 'jpg'}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      },
      mime,
      0.92
    );
  };

  const isLandscape = img ? img.naturalWidth >= img.naturalHeight : false;
  const isRotate = mode === 'rotate';

  let outputSize = '';
  if (img) {
    if (isRotate) {
      outputSize = `${img.naturalHeight} x ${img.naturalWidth}`;
    } else {
      const [rw, rh] = RATIOS[ratio] ?? RATIOS['16:9'];
      const w = parseInt(width, 10);
      outputSize = `${w} x ${Math.round((w * rh) / rw)}`;
    }
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <FileDropzone
          accept="image/*"
          onFileSelect={handleFile}
          label="Drop a vertical photo here, or browse"
          helperText="JPG, PNG, WEBP, and other browser-supported images. The file never leaves your device."
        />
        {error && (
          <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </Card>

      {img && (
        <>
          <Card className="space-y-5">
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                How should the sides be filled?
              </span>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {(
                  [
                    { id: 'blur', label: 'Blurred background', hint: 'Best for social media' },
                    { id: 'solid', label: 'Solid color bars', hint: 'Clean and simple' },
                    { id: 'crop', label: 'Crop to fill', hint: 'No bars, trims top and bottom' },
                    { id: 'rotate', label: 'Rotate 90 degrees', hint: 'Turns the whole image' },
                  ] as { id: FillMode; label: string; hint: string }[]
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMode(opt.id)}
                    aria-pressed={mode === opt.id}
                    className={`text-left rounded-xl border p-3 transition-colors ${
                      mode === opt.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="block text-sm font-semibold text-slate-900 dark:text-white">{opt.label}</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {!isRotate && (
                <>
                  <Select
                    label="Aspect ratio"
                    value={ratio}
                    onChange={(e) => setRatio(e.target.value)}
                    options={Object.keys(RATIOS).map((r) => ({ value: r, label: r }))}
                  />
                  <Select
                    label="Output width"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    options={[
                      { value: '1280', label: '1280 px' },
                      { value: '1920', label: '1920 px (Full HD)' },
                      { value: '2560', label: '2560 px' },
                      { value: '3840', label: '3840 px (4K)' },
                    ]}
                  />
                </>
              )}
              {isRotate && (
                <Select
                  label="Rotation"
                  value={rotateDir}
                  onChange={(e) => setRotateDir(e.target.value as 'cw' | 'ccw')}
                  options={[
                    { value: 'cw', label: '90 degrees clockwise' },
                    { value: 'ccw', label: '90 degrees counterclockwise' },
                  ]}
                />
              )}
              {mode === 'crop' && (
                <Select
                  label="Keep which part"
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  options={[
                    { value: '0', label: 'Top of the photo' },
                    { value: '0.5', label: 'Center' },
                    { value: '1', label: 'Bottom of the photo' },
                  ]}
                />
              )}
              {mode === 'solid' && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="bar-color"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                  >
                    Bar color
                  </label>
                  <input
                    id="bar-color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 cursor-pointer"
                  />
                </div>
              )}
              {mode === 'blur' && (
                <div className="space-y-1.5">
                  <label
                    htmlFor="blur-strength"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                  >
                    Blur strength ({blur})
                  </label>
                  <input
                    id="blur-strength"
                    type="range"
                    min={10}
                    max={80}
                    value={blur}
                    onChange={(e) => setBlur(parseInt(e.target.value, 10))}
                    className="w-full h-10 accent-blue-600"
                  />
                </div>
              )}
              <Select
                label="File format"
                value={format}
                onChange={(e) => setFormat(e.target.value as 'png' | 'jpeg')}
                options={[
                  { value: 'jpeg', label: 'JPG (smaller file)' },
                  { value: 'png', label: 'PNG (lossless)' },
                ]}
              />
            </div>

            {isLandscape && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                This image is already horizontal. You can still change its ratio or add a background.
              </p>
            )}
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Preview
              </h3>
              <Button type="button" onClick={download} leftIcon={<Download className="w-4 h-4" />}>
                Download {format === 'png' ? 'PNG' : 'JPG'}
              </Button>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-100 p-2 dark:border-slate-800 dark:bg-slate-950 overflow-hidden">
              <canvas ref={canvasRef} className="mx-auto block max-w-full h-auto rounded-lg" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Original: {img.naturalWidth} x {img.naturalHeight} px. Output: {outputSize} px.
            </p>
          </Card>
        </>
      )}
    </div>
  );
};
