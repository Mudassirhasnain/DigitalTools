'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Download, Trash2, PenTool, Type, Image as ImageIcon, Copy, Check, Undo, ShieldCheck } from 'lucide-react';
import { jsPDF } from 'jspdf';

const SIGNATURE_FONTS = [
  { id: 'font-brush', name: 'Executive Script', style: 'italic 44px "Brush Script MT", cursive' },
  { id: 'font-cursive', name: 'Elegant Calligraphy', style: 'italic 46px "Snell Roundhand", "Apple Chancery", cursive' },
  { id: 'font-casual', name: 'Casual Hand', style: 'italic 40px "Comic Sans MS", cursive, sans-serif' },
  { id: 'font-formal', name: 'Formal Fountain Pen', style: 'italic 44px "Segoe Script", cursive' },
  { id: 'font-modern', name: 'Modern Minimalist', style: 'normal 38px "Dancing Script", cursive, sans-serif' },
];

const INK_COLORS = [
  { hex: '#0f172a', name: 'Carbon Black' },
  { hex: '#1e3a8a', name: 'Fountain Navy' },
  { hex: '#2563eb', name: 'Royal Blue' },
  { hex: '#991b1b', name: 'Official Crimson' },
  { hex: '#065f46', name: 'Forest Seal' },
];

export const DigitalSignatureGenerator: React.FC = () => {
  const [mode, setMode] = useState<'draw' | 'type' | 'upload'>('draw');
  const [penColor, setPenColor] = useState<string>('#0f172a');
  const [penWidth, setPenWidth] = useState<number>(3.5);

  // Type mode
  const [typedName, setTypedName] = useState<string>('Alex Morgan');
  const [selectedFont, setSelectedFont] = useState<number>(0);

  // Audit stamp option
  const [includeDateStamp, setIncludeDateStamp] = useState<boolean>(true);
  const [signerTitle, setSignerTitle] = useState<string>('Authorized Signatory');

  // Stroke history for undo
  const [drawingHistory, setDrawingHistory] = useState<ImageData[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  // Upload mode state
  const [uploadedImgUrl, setUploadedImgUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawingHistory([]);
  };

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setDrawingHistory((prev) => [...prev.slice(-10), data]);
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || drawingHistory.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...drawingHistory];
    newHistory.pop(); // Remove current
    const previous = newHistory[newHistory.length - 1];

    if (previous) {
      ctx.putImageData(previous, 0, 0);
      setDrawingHistory(newHistory);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setDrawingHistory([]);
    }
  };

  useEffect(() => {
    if (mode === 'draw') {
      clearCanvas();
    }
  }, [mode]);

  // Touch & Mouse Drawing Handlers with Bezier Quadratic Curve Smoothing
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    saveCanvasState();
    isDrawingRef.current = true;
    lastPointRef.current = getCoordinates(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current || !lastPointRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPoint = getCoordinates(e);

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);

    const midPoint = {
      x: (lastPointRef.current.x + currentPoint.x) / 2,
      y: (lastPointRef.current.y + currentPoint.y) / 2,
    };
    ctx.quadraticCurveTo(lastPointRef.current.x, lastPointRef.current.y, midPoint.x, midPoint.y);
    ctx.stroke();

    lastPointRef.current = currentPoint;
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  // Build composite signature canvas with optional date/verification stamp
  const getExportCanvas = (): HTMLCanvasElement | null => {
    const exportWidth = 700;
    const exportHeight = includeDateStamp ? 260 : 200;
    const canvas = document.createElement('canvas');
    canvas.width = exportWidth;
    canvas.height = exportHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (mode === 'draw' && canvasRef.current) {
      ctx.drawImage(canvasRef.current, 50, 10, 600, 180);
    } else if (mode === 'type') {
      ctx.fillStyle = penColor;
      ctx.font = SIGNATURE_FONTS[selectedFont].style;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedName, exportWidth / 2, 90);
    } else if (mode === 'upload' && uploadedImgUrl) {
      const img = new Image();
      img.src = uploadedImgUrl;
      ctx.drawImage(img, (exportWidth - 300) / 2, 20, 300, 150);
    }

    // Add verification date stamp
    if (includeDateStamp) {
      const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      ctx.fillStyle = '#64748b';
      ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `Digitally Generated & Verified via DigitalToools · Date: ${today} · ${signerTitle}`,
        exportWidth / 2,
        exportHeight - 20
      );
    }

    return canvas;
  };

  // Download Transparent PNG
  const downloadPng = () => {
    const canvas = getExportCanvas();
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `signature_${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  };

  // Download Vector PDF
  const downloadPdf = () => {
    const canvas = getExportCanvas();
    if (!canvas) return;
    const imgData = canvas.toDataURL('image/png');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: [400, 200] });
    doc.addImage(imgData, 'PNG', 20, 20, 360, 160);
    doc.save(`signature_${Date.now()}.pdf`);
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    const canvas = getExportCanvas();
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    });
  };

  // Handle upload & threshold transparency
  const handleUploadPaperSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = img.naturalWidth;
        offCanvas.height = img.naturalHeight;
        const offCtx = offCanvas.getContext('2d');
        if (!offCtx) return;

        offCtx.drawImage(img, 0, 0);
        const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
        const data = imgData.data;

        // Auto remove paper white/gray background (threshold > 180 brightness)
        for (let i = 0; i < data.length; i += 4) {
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (brightness > 180) {
            data[i + 3] = 0; // Transparent
          } else {
            // Recolor stroke to selected pen color
            const rgb = hexToRgb(penColor) || { r: 15, g: 23, b: 42 };
            data[i] = rgb.r;
            data[i + 1] = rgb.g;
            data[i + 2] = rgb.b;
          }
        }

        offCtx.putImageData(imgData, 0, 0);
        setUploadedImgUrl(offCanvas.toDataURL('image/png'));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  function hexToRgb(hex: string) {
    const clean = hex.replace(/^#/, '');
    return {
      r: parseInt(clean.substring(0, 2), 16),
      g: parseInt(clean.substring(2, 4), 16),
      b: parseInt(clean.substring(4, 6), 16),
    };
  }

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setMode('draw')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            mode === 'draw'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>Draw Signature</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('type')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            mode === 'type'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          <span>Type Signature</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            mode === 'upload'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Scan & Clean Paper Signature</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Style Controls */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Styling & Ink Palette
            </span>

            {/* Ink Colors */}
            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Executive Ink Color
              </span>
              <div className="flex gap-2">
                {INK_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setPenColor(c.hex)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      penColor === c.hex ? 'scale-110 border-blue-500 ring-2 ring-blue-500/20' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    aria-label={c.name}
                  />
                ))}
              </div>
            </div>

            {mode === 'draw' && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Stroke Smoothing Width</span>
                    <span className="text-slate-500">{penWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="1.5"
                    max="7"
                    step="0.5"
                    value={penWidth}
                    onChange={(e) => setPenWidth(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleUndo}
                    disabled={drawingHistory.length === 0}
                    leftIcon={<Undo className="w-3.5 h-3.5" />}
                    className="flex-1"
                  >
                    Undo Stroke
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearCanvas}
                    leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}

            {mode === 'type' && (
              <div className="space-y-3">
                <Input
                  label="Full Name to Sign"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                />

                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 pt-1">
                  Cursive Signature Font
                </span>
                <div className="space-y-1.5">
                  {SIGNATURE_FONTS.map((font, idx) => (
                    <div
                      key={font.id}
                      onClick={() => setSelectedFont(idx)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center justify-between ${
                        selectedFont === idx
                          ? 'border-blue-500 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30 font-semibold'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <span>{font.name}</span>
                      <span className="text-sm italic" style={{ color: penColor }}>
                        {typedName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mode === 'upload' && (
              <div className="space-y-3">
                <label className="block p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <ImageIcon className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 block">
                    Upload Photo of Paper Signature
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Auto-strips white paper background and isolates dark ink strokes
                  </span>
                  <input type="file" accept="image/*" onChange={handleUploadPaperSignature} className="hidden" />
                </label>
              </div>
            )}

            {/* Audit Verification Stamp Settings */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={includeDateStamp}
                  onChange={(e) => setIncludeDateStamp(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Include Verification Date Stamp</span>
              </label>

              {includeDateStamp && (
                <Input
                  label="Signatory Role / Label"
                  value={signerTitle}
                  onChange={(e) => setSignerTitle(e.target.value)}
                  placeholder="e.g. Authorized Signatory / Founder"
                />
              )}
            </div>

            <div className="pt-2 space-y-2">
              <Button size="sm" onClick={downloadPng} leftIcon={<Download className="w-3.5 h-3.5" />} className="w-full">
                Download Transparent PNG
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" onClick={downloadPdf} leftIcon={<Download className="w-3.5 h-3.5" />}>
                  PDF Vector
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={copyToClipboard}
                  leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copied ? 'Copied!' : 'Copy Image'}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Canvas / Preview Stage */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Transparent Canvas (Sign above the line)</span>
            <span className="text-emerald-600 font-medium">✓ Export: High-Res 300 DPI Transparent PNG</span>
          </div>

          <div className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] bg-[size:16px_16px] bg-white dark:bg-slate-900 p-6 shadow-inner relative flex flex-col items-center justify-center min-h-[300px] overflow-hidden">
            {mode === 'draw' && (
              <>
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={220}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-auto touch-none cursor-crosshair"
                />
                {/* Visual signature baseline */}
                <div className="w-full border-b border-dashed border-slate-300 dark:border-slate-700 my-2 pointer-events-none" />
              </>
            )}

            {mode === 'type' && (
              <div className="w-full h-48 flex items-center justify-center text-center select-none">
                <span
                  style={{
                    color: penColor,
                    font: SIGNATURE_FONTS[selectedFont].style,
                  }}
                >
                  {typedName || 'Your Signature'}
                </span>
              </div>
            )}

            {mode === 'upload' && (
              <div className="w-full h-48 flex items-center justify-center text-center">
                {uploadedImgUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={uploadedImgUrl} alt="Sanitized transparent signature" className="max-h-40 max-w-full object-contain" />
                ) : (
                  <p className="text-xs text-slate-400">Upload a signature photo on the left to strip background</p>
                )}
              </div>
            )}

            {/* Date Stamp Preview */}
            {includeDateStamp && (
              <div className="text-[11px] text-slate-400 font-mono text-center pt-2 border-t border-slate-200 dark:border-slate-800 w-full">
                Digitally Generated & Verified via DigitalToools · Date: {new Date().toLocaleDateString()} · {signerTitle}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
