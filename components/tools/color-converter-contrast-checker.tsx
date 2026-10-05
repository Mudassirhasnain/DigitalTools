'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { CopyButton } from '@/components/ui/CopyButton';
import {
  Check,
  X,
  Palette,
  ArrowLeftRight,
  Sparkles,
  Eye,
  Sliders,
  Layers,
} from 'lucide-react';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleanHex = hex.replace(/^#/, '');
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return { r, g, b };
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return { r, g, b };
  }
  return null;
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const hex = [clamp(r), clamp(g), clamp(b)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
  return `#${hex}`;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r1 = 0, g1 = 0, b1 = 0;
  if (h < 60) { r1 = c; g1 = x; b1 = 0; }
  else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
  else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
  else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
  else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
  else { r1 = c; g1 = 0; b1 = x; }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
}

function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  if (r === 0 && g === 0 && b === 0) return { c: 0, m: 0, y: 0, k: 100 };
  const rP = r / 255, gP = g / 255, bP = b / 255;
  const k = 1 - Math.max(rP, gP, bP);
  const c = (1 - rP - k) / (1 - k);
  const m = (1 - gP - k) / (1 - k);
  const y = (1 - bP - k) / (1 - k);
  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

// Relative luminance according to WCAG 2.1 specs
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function calculateContrastRatio(fgHex: string, bgHex: string): number {
  const fgRgb = hexToRgb(fgHex);
  const bgRgb = hexToRgb(bgHex);
  if (!fgRgb || !bgRgb) return 1;

  const l1 = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const l2 = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (brighter + 0.05) / (darker + 0.05);
}

// Color vision deficiency simulation filters
function simulateCvd(rgb: { r: number; g: number; b: number }, type: string): string {
  const { r, g, b } = rgb;
  if (type === 'protanopia') {
    // Red-weak
    const nr = 0.56667 * r + 0.43333 * g;
    const ng = 0.55833 * r + 0.44167 * g;
    const nb = 0.24167 * g + 0.75833 * b;
    return rgbToHex(nr, ng, nb);
  }
  if (type === 'deuteranopia') {
    // Green-weak
    const nr = 0.625 * r + 0.375 * g;
    const ng = 0.7 * r + 0.3 * g;
    const nb = 0.3 * g + 0.7 * b;
    return rgbToHex(nr, ng, nb);
  }
  if (type === 'tritanopia') {
    // Blue-weak
    const nr = 0.95 * r + 0.05 * g;
    const ng = 0.43333 * g + 0.56667 * b;
    const nb = 0.475 * g + 0.525 * b;
    return rgbToHex(nr, ng, nb);
  }
  if (type === 'achromatopsia') {
    // Monochromacy
    const grey = 0.299 * r + 0.587 * g + 0.114 * b;
    return rgbToHex(grey, grey, grey);
  }
  return rgbToHex(r, g, b);
}

export const ColorConverterContrastChecker: React.FC = () => {
  const [textColor, setTextColor] = useState<string>('#0f172a');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [cvdMode, setCvdMode] = useState<'normal' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia'>('normal');

  const ratio = calculateContrastRatio(textColor, bgColor);
  const formattedRatio = ratio.toFixed(2);

  const textRgb = useMemo(() => hexToRgb(textColor) || { r: 15, g: 23, b: 42 }, [textColor]);
  const textHsl = useMemo(() => rgbToHsl(textRgb.r, textRgb.g, textRgb.b), [textRgb]);
  const textHsv = useMemo(() => rgbToHsv(textRgb.r, textRgb.g, textRgb.b), [textRgb]);
  const textCmyk = useMemo(() => rgbToCmyk(textRgb.r, textRgb.g, textRgb.b), [textRgb]);

  const bgRgb = useMemo(() => hexToRgb(bgColor) || { r: 255, g: 255, b: 255 }, [bgColor]);

  const aaNormal = ratio >= 4.5;
  const aaLarge = ratio >= 3.0;
  const aaaNormal = ratio >= 7.0;
  const aaaLarge = ratio >= 4.5;

  const swapColors = () => {
    const temp = textColor;
    setTextColor(bgColor);
    setBgColor(temp);
  };

  // Color harmonies based on text color
  const harmonies = useMemo(() => {
    const { h, s, l } = textHsl;
    const toHexFromHsl = (hue: number, sat: number, light: number) => {
      const rgb = hslToRgb(hue, sat, light);
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    };

    return {
      complementary: toHexFromHsl(h + 180, s, l),
      analogous1: toHexFromHsl(h + 30, s, l),
      analogous2: toHexFromHsl(h - 30, s, l),
      triadic1: toHexFromHsl(h + 120, s, l),
      triadic2: toHexFromHsl(h + 240, s, l),
      split1: toHexFromHsl(h + 150, s, l),
      split2: toHexFromHsl(h + 210, s, l),
      tintLight: toHexFromHsl(h, s, Math.min(95, l + 25)),
      shadeDark: toHexFromHsl(h, s, Math.max(10, l - 25)),
    };
  }, [textHsl]);

  // Auto-adjust foreground lightness to achieve target contrast ratio
  const autoAdjustContrast = (targetRatio: number) => {
    const bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
    const { h, s } = textHsl;

    // Determine whether to darken or lighten
    const shouldDarken = bgLum > 0.5;
    let bestHex = textColor;

    for (let l = shouldDarken ? textHsl.l : textHsl.l; shouldDarken ? l >= 0 : l <= 100; shouldDarken ? l-- : l++) {
      const rgb = hslToRgb(h, s, l);
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
      const currentR = calculateContrastRatio(hex, bgColor);
      if (currentR >= targetRatio) {
        bestHex = hex;
        break;
      }
    }

    setTextColor(bestHex);
  };

  // Display simulated colors
  const simulatedText = useMemo(() => simulateCvd(textRgb, cvdMode), [textRgb, cvdMode]);
  const simulatedBg = useMemo(() => simulateCvd(bgRgb, cvdMode), [bgRgb, cvdMode]);

  return (
    <div className="space-y-6">
      {/* Interactive Color Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Foreground / Text */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Foreground / Text Color
            </span>
            <div
              className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 shadow-xs"
              style={{ backgroundColor: textColor }}
            />
          </div>

          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              className="w-12 h-10 p-0 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-700 bg-transparent"
              aria-label="Pick foreground color"
            />
            <div className="flex-1">
              <Input
                label="HEX Code"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
              />
            </div>
          </div>

          {/* Formats Grid */}
          <div className="space-y-1.5 pt-2 text-xs">
            <div className="flex justify-between items-center p-2 rounded bg-slate-50 dark:bg-slate-950 font-mono">
              <span>RGB: rgb({textRgb.r}, {textRgb.g}, {textRgb.b})</span>
              <CopyButton textToCopy={`rgb(${textRgb.r}, ${textRgb.g}, ${textRgb.b})`} size="sm" />
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-slate-50 dark:bg-slate-950 font-mono">
              <span>HSL: hsl({textHsl.h}, {textHsl.s}%, {textHsl.l}%)</span>
              <CopyButton textToCopy={`hsl(${textHsl.h}, ${textHsl.s}%, ${textHsl.l}%)`} size="sm" />
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-slate-50 dark:bg-slate-950 font-mono">
              <span>HSV: hsv({textHsv.h}°, {textHsv.s}%, {textHsv.v}%)</span>
              <CopyButton textToCopy={`hsv(${textHsv.h}, ${textHsv.s}%, ${textHsv.v}%)`} size="sm" />
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-slate-50 dark:bg-slate-950 font-mono">
              <span>CMYK: cmyk({textCmyk.c}%, {textCmyk.m}%, {textCmyk.y}%, {textCmyk.k}%)</span>
              <CopyButton textToCopy={`cmyk(${textCmyk.c}%, ${textCmyk.m}%, ${textCmyk.y}%, ${textCmyk.k}%)`} size="sm" />
            </div>
          </div>
        </Card>

        {/* Background */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Background Color
            </span>
            <div
              className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-700 shadow-xs"
              style={{ backgroundColor: bgColor }}
            />
          </div>

          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-12 h-10 p-0 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-700 bg-transparent"
              aria-label="Pick background color"
            />
            <div className="flex-1">
              <Input
                label="HEX Code"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={swapColors}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Swap Foreground and Background</span>
            </button>

            {/* Quick Auto-fix contrast buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                size="sm"
                variant="outline"
                onClick={() => autoAdjustContrast(4.5)}
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-blue-500" />}
              >
                Auto-Fix AA (4.5:1)
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => autoAdjustContrast(7.0)}
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-emerald-500" />}
              >
                Auto-Fix AAA (7:1)
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Live WCAG Compliance & Ratio Score */}
      <Card className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              WCAG 2.1 Contrast Ratio
            </span>
            <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mt-1">
              {formattedRatio}:1
            </div>
          </div>

          {/* Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div
              className={`p-3 rounded-xl border flex flex-col items-center justify-center min-w-[105px] ${
                aaNormal
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
              }`}
            >
              <div className="flex items-center gap-1 font-bold">
                {aaNormal ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                <span>AA Normal</span>
              </div>
              <span className="text-[10px] opacity-75 mt-0.5">Min 4.5:1</span>
            </div>

            <div
              className={`p-3 rounded-xl border flex flex-col items-center justify-center min-w-[105px] ${
                aaLarge
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
              }`}
            >
              <div className="flex items-center gap-1 font-bold">
                {aaLarge ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                <span>AA Large</span>
              </div>
              <span className="text-[10px] opacity-75 mt-0.5">Min 3.0:1 (18pt+)</span>
            </div>

            <div
              className={`p-3 rounded-xl border flex flex-col items-center justify-center min-w-[105px] ${
                aaaNormal
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
              }`}
            >
              <div className="flex items-center gap-1 font-bold">
                {aaaNormal ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                <span>AAA Normal</span>
              </div>
              <span className="text-[10px] opacity-75 mt-0.5">Min 7.0:1</span>
            </div>

            <div
              className={`p-3 rounded-xl border flex flex-col items-center justify-center min-w-[105px] ${
                aaaLarge
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
              }`}
            >
              <div className="flex items-center gap-1 font-bold">
                {aaaLarge ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                <span>AAA Large</span>
              </div>
              <span className="text-[10px] opacity-75 mt-0.5">Min 4.5:1</span>
            </div>
          </div>
        </div>

        {/* Live Visual Sample Simulation & Color Blindness filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Interactive Contrast Simulation
            </span>

            {/* CVD Modes */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
              <Eye className="w-3.5 h-3.5 text-slate-400 ml-1" />
              {[
                { id: 'normal', label: 'Normal' },
                { id: 'protanopia', label: 'Protanopia' },
                { id: 'deuteranopia', label: 'Deuteranopia' },
                { id: 'tritanopia', label: 'Tritanopia' },
                { id: 'achromatopsia', label: 'Monochrome' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setCvdMode(m.id as any)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    cvdMode === m.id
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div
            className="p-6 rounded-2xl border border-slate-300 dark:border-slate-700 space-y-3 transition-colors shadow-inner"
            style={{ backgroundColor: simulatedBg, color: simulatedText }}
          >
            <h3 className="text-2xl font-bold tracking-tight">
              Large Display Title (24px / 18pt Bold)
            </h3>
            <p className="text-sm leading-relaxed max-w-2xl">
              Standard body typography (16px / 12pt). Accessible color contrast guarantees that
              all users—including people with low vision, color blindness, or using mobile screens
              under bright outdoor glare—can read and interact with your design effortlessly.
            </p>
          </div>
        </div>

        {/* Color Harmonies & Palette Generator */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-blue-600" />
            <span>Harmonious Color Palettes (Derived from {textColor})</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            {[
              { label: 'Complementary', hex: harmonies.complementary },
              { label: 'Analogous 1', hex: harmonies.analogous1 },
              { label: 'Analogous 2', hex: harmonies.analogous2 },
              { label: 'Triadic 1', hex: harmonies.triadic1 },
              { label: 'Triadic 2', hex: harmonies.triadic2 },
              { label: 'Split Comp', hex: harmonies.split1 },
              { label: 'Soft Tint', hex: harmonies.tintLight },
              { label: 'Deep Shade', hex: harmonies.shadeDark },
            ].map((swatch, idx) => (
              <div
                key={idx}
                onClick={() => setTextColor(swatch.hex)}
                className="group p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer hover:shadow-md transition-all text-center space-y-1.5"
              >
                <div
                  className="w-full h-12 rounded-lg border border-black/10 shadow-xs"
                  style={{ backgroundColor: swatch.hex }}
                />
                <span className="text-[10px] text-slate-500 block truncate">{swatch.label}</span>
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  {swatch.hex}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
