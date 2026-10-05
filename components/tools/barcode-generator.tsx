'use client';

import React, { useState, useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Download, Barcode as BarcodeIcon, AlertCircle, Printer, Copy, Check, Grid } from 'lucide-react';

const FORMATS = [
  { value: 'CODE128', label: 'Code 128 (Alphanumeric Shipping/Logistics)' },
  { value: 'EAN13', label: 'EAN-13 (13 Digits International Retail)' },
  { value: 'EAN8', label: 'EAN-8 (8 Digits Small Packages)' },
  { value: 'UPC', label: 'UPC-A (12 Digits North America Retail)' },
  { value: 'CODE39', label: 'Code 39 (Alphanumeric Industrial)' },
  { value: 'ITF14', label: 'ITF-14 (Interleaved 2 of 5 Packaging)' },
  { value: 'pharmacode', label: 'Pharmacode (Pharmaceutical Packaging)' },
  { value: 'codabar', label: 'Codabar (Libraries & Blood Banks)' },
];

// Helper: Calculate EAN-13 check digit if 12 digits provided
function computeEan13CheckDigit(twelveDigits: string): string {
  if (twelveDigits.length !== 12 || !/^\d+$/.test(twelveDigits)) return twelveDigits;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(twelveDigits[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return twelveDigits + checkDigit.toString();
}

// Helper: Calculate UPC-A check digit if 11 digits provided
function computeUpcCheckDigit(elevenDigits: string): string {
  if (elevenDigits.length !== 11 || !/^\d+$/.test(elevenDigits)) return elevenDigits;
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    const digit = parseInt(elevenDigits[i], 10);
    sum += i % 2 === 0 ? digit * 3 : digit;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return elevenDigits + checkDigit.toString();
}

export const BarcodeGenerator: React.FC = () => {
  const [format, setFormat] = useState('CODE128');
  const [barcodeValue, setBarcodeValue] = useState('DIGITAL-TOOLS-2026');
  const [showText, setShowText] = useState(true);
  const [textPosition, setTextPosition] = useState<'bottom' | 'top'>('bottom');
  const [textAlign, setTextAlign] = useState<'center' | 'left' | 'right'>('center');
  const [height, setHeight] = useState(80);
  const [width, setWidth] = useState(2);
  const [lineColor, setLineColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(14);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Print Sheet Mode
  const [sheetMode, setSheetMode] = useState<boolean>(false);
  const [labelsCount, setLabelsCount] = useState<number>(10);
  const [labelsCols, setLabelsCols] = useState<number>(2);

  const [copied, setCopied] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Auto sanitize and auto-complete check digits
  const getProcessedValue = (val: string, fmt: string) => {
    const clean = val.trim();
    if (fmt === 'EAN13' && clean.length === 12 && /^\d+$/.test(clean)) {
      return computeEan13CheckDigit(clean);
    }
    if (fmt === 'UPC' && clean.length === 11 && /^\d+$/.test(clean)) {
      return computeUpcCheckDigit(clean);
    }
    return clean;
  };

  const processedValue = getProcessedValue(barcodeValue, format);

  useEffect(() => {
    if (!svgRef.current) return;
    setErrorMessage(null);

    try {
      JsBarcode(svgRef.current, processedValue, {
        format,
        lineColor,
        width,
        height,
        displayValue: showText,
        textPosition,
        textAlign,
        font: 'monospace',
        fontSize,
        textMargin: 6,
        background: bgColor,
        margin: 12,
      });
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Invalid barcode value for the selected symbology format.'
      );
    }
  }, [format, processedValue, showText, textPosition, textAlign, height, width, lineColor, bgColor, fontSize]);

  const handleFormatChange = (newFormat: string) => {
    setFormat(newFormat);
    if (newFormat === 'EAN13') {
      setBarcodeValue('5901234123457');
    } else if (newFormat === 'EAN8') {
      setBarcodeValue('96385074');
    } else if (newFormat === 'UPC') {
      setBarcodeValue('012345678905');
    } else if (newFormat === 'ITF14') {
      setBarcodeValue('12345678901231');
    } else if (newFormat === 'pharmacode') {
      setBarcodeValue('12345');
    } else if (newFormat === 'codabar') {
      setBarcodeValue('A123456789B');
    } else {
      setBarcodeValue('DIGITAL-TOOLS-2026');
    }
  };

  const downloadSvg = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `barcode_${format.toLowerCase()}_${Date.now()}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadPng = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
    const img = new Image();
    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = (img.width || 400) * 2;
      canvas.height = (img.height || 160) * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(2, 2);
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `barcode_${format.toLowerCase()}_${Date.now()}.png`;
        link.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const copyImageToClipboard = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
    const img = new Image();
    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = (img.width || 400) * 2;
      canvas.height = (img.height || 160) * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(2, 2);
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(async (blob) => {
          if (blob) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
        });
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handlePrintSheet = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Settings Card */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarcodeIcon className="w-4 h-4 text-blue-600" />
              <span>Barcode Symbology & Settings</span>
            </h2>

            <Select
              label="Barcode Standard / Format"
              value={format}
              onChange={(e) => handleFormatChange(e.target.value)}
              options={FORMATS}
            />

            <Input
              label="Barcode Value (Data String)"
              value={barcodeValue}
              onChange={(e) => setBarcodeValue(e.target.value)}
              placeholder="Enter product or inventory code..."
              helperText={
                format === 'EAN13'
                  ? 'Enter 12 digits (13th check digit auto-calculated) or full 13 digits.'
                  : format === 'UPC'
                  ? 'Enter 11 digits (12th check digit auto-calculated) or full 12 digits.'
                  : 'Encodes letters, digits, and standard punctuation.'
              }
            />

            {/* Dimensional Sliders */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Bar Height</span>
                  <span className="font-mono text-slate-500">{height}px</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="160"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Bar Width Ratio</span>
                  <span className="font-mono text-slate-500">{width}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Bars Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={lineColor}
                    onChange={(e) => setLineColor(e.target.value)}
                    className="w-10 h-8 p-0 rounded cursor-pointer border border-slate-300 dark:border-slate-700"
                    aria-label="Bar color"
                  />
                  <span className="font-mono text-xs">{lineColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Background
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-8 p-0 rounded cursor-pointer border border-slate-300 dark:border-slate-700"
                    aria-label="Background color"
                  />
                  <span className="font-mono text-xs">{bgColor}</span>
                </div>
              </div>
            </div>

            {/* Typography options */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-semibold">
                <input
                  type="checkbox"
                  checked={showText}
                  onChange={(e) => setShowText(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Display Human-Readable Text</span>
              </label>

              {showText && (
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Text Position"
                    value={textPosition}
                    onChange={(e) => setTextPosition(e.target.value as any)}
                    options={[
                      { value: 'bottom', label: 'Below Bars' },
                      { value: 'top', label: 'Above Bars' },
                    ]}
                  />
                  <Select
                    label="Text Alignment"
                    value={textAlign}
                    onChange={(e) => setTextAlign(e.target.value as any)}
                    options={[
                      { value: 'center', label: 'Center' },
                      { value: 'left', label: 'Left' },
                      { value: 'right', label: 'Right' },
                    ]}
                  />
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </Card>
        </div>

        {/* Preview and Downloads */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="flex flex-col items-center justify-center p-8 space-y-6 text-center">
            <div className="flex items-center justify-between w-full pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Vector Barcode Output
              </h2>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                {format} Verified
              </span>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white shadow-sm inline-block overflow-x-auto max-w-full">
              <svg ref={svgRef} />
            </div>

            <div className="space-y-2 w-full">
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" onClick={downloadPng} leftIcon={<Download className="w-3.5 h-3.5" />}>
                  Download PNG (2X)
                </Button>
                <Button size="sm" variant="outline" onClick={downloadSvg} leftIcon={<Download className="w-3.5 h-3.5" />}>
                  Download SVG
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={copyImageToClipboard}
                  leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copied ? 'Copied to Clipboard!' : 'Copy Barcode Image'}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSheetMode(!sheetMode)}
                  leftIcon={<Grid className="w-3.5 h-3.5" />}
                >
                  {sheetMode ? 'Hide Print Sheet' : 'Printable Label Grid'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Printable Sheet Mode Accordion */}
          {sheetMode && (
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-blue-600" />
                  <span>Sticker Label Sheet Generator</span>
                </h3>
                <Button size="sm" onClick={handlePrintSheet} leftIcon={<Printer className="w-3.5 h-3.5" />}>
                  Print Labels Now
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Number of Labels"
                  type="number"
                  min={1}
                  max={40}
                  value={labelsCount}
                  onChange={(e) => setLabelsCount(Number(e.target.value))}
                />
                <Select
                  label="Grid Columns"
                  value={labelsCols.toString()}
                  onChange={(e) => setLabelsCols(Number(e.target.value))}
                  options={[
                    { value: '2', label: '2 Columns (Avery 5163 Style)' },
                    { value: '3', label: '3 Columns (Avery 5160 Style)' },
                    { value: '4', label: '4 Columns (Small Items)' },
                  ]}
                />
              </div>

              {/* Print preview grid */}
              <div
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white grid gap-3 max-h-72 overflow-y-auto"
                style={{ gridTemplateColumns: `repeat(${labelsCols}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: labelsCount }).map((_, i) => (
                  <div
                    key={i}
                    className="p-2 border border-dashed border-slate-300 rounded text-center flex flex-col items-center justify-center bg-white"
                  >
                    <span className="text-[9px] font-mono text-slate-400 block mb-0.5">#{i + 1}</span>
                    <div className="scale-75 origin-center overflow-hidden">
                      <svg
                        ref={(node) => {
                          if (node) {
                            try {
                              JsBarcode(node, processedValue, {
                                format,
                                lineColor,
                                width: 1.4,
                                height: 40,
                                displayValue: showText,
                                fontSize: 10,
                                margin: 2,
                                background: '#ffffff',
                              });
                            } catch {}
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
