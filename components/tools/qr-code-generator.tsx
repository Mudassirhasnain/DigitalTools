'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import {
  Download,
  QrCode as QrIcon,
  Wifi,
  Globe,
  User,
  AlignLeft,
  Mail,
  MessageSquare,
  Send,
  Coins,
  MapPin,
  Copy,
  Check,
} from 'lucide-react';

export const QrCodeGenerator: React.FC = () => {
  const [qrType, setQrType] = useState<
    'url' | 'text' | 'wifi' | 'vcard' | 'email' | 'sms' | 'whatsapp' | 'crypto' | 'geo'
  >('url');

  // Input states
  const [url, setUrl] = useState('https://digitaltools.dev');
  const [text, setText] = useState('DigitalTools: Fast, Private Web Utilities');

  // WiFi states
  const [ssid, setSsid] = useState('My-Office-WiFi');
  const [wifiPass, setWifiPass] = useState('SecurePass2026!');
  const [wifiType, setWifiType] = useState('WPA');
  const [hiddenSsid, setHiddenSsid] = useState(false);

  // vCard states
  const [vcardName, setVcardName] = useState('Alex Rivera');
  const [vcardOrg, setVcardOrg] = useState('Acme Technologies');
  const [vcardTitle, setVcardTitle] = useState('Lead Software Architect');
  const [vcardPhone, setVcardPhone] = useState('+1-555-0199');
  const [vcardEmail, setVcardEmail] = useState('alex@example.com');
  const [vcardWebsite, setVcardWebsite] = useState('https://example.com');

  // Email states
  const [emailTo, setEmailTo] = useState('support@digitaltools.dev');
  const [emailSubject, setEmailSubject] = useState('Inquiry regarding tools');
  const [emailBody, setEmailBody] = useState('Hello,\n\nI would like to inquire about...');

  // SMS states
  const [smsPhone, setSmsPhone] = useState('+15550198');
  const [smsMessage, setSmsMessage] = useState('Hey! Check out this awesome toolkit: https://digitaltools.dev');

  // WhatsApp states
  const [waPhone, setWaPhone] = useState('15551234567');
  const [waMessage, setWaMessage] = useState('Hi! I found your contact on DigitalTools.');

  // Crypto states
  const [cryptoType, setCryptoType] = useState<'bitcoin' | 'ethereum' | 'solana'>('bitcoin');
  const [cryptoAddress, setCryptoAddress] = useState('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq');
  const [cryptoAmount, setCryptoAmount] = useState('0.005');

  // Geo states
  const [geoLat, setGeoLat] = useState('37.7749');
  const [geoLng, setGeoLng] = useState('-122.4194');

  // Styling & Customization
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [qrSize, setQrSize] = useState<number>(300);
  const [marginBlocks, setMarginBlocks] = useState<number>(2);
  const [frameLabel, setFrameLabel] = useState<string>('SCAN ME');
  const [showFrame, setShowFrame] = useState<boolean>(true);
  const [centerIcon, setCenterIcon] = useState<'none' | 'link' | 'wifi' | 'user' | 'crypto' | 'custom'>('none');
  const [customIconData, setCustomIconData] = useState<string | null>(null);

  const [copiedImage, setCopiedImage] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute final payload string
  const getPayloadString = (): string => {
    switch (qrType) {
      case 'url':
        return url.trim() || 'https://digitaltools.dev';
      case 'text':
        return text.trim() || 'Hello World';
      case 'wifi':
        return `WIFI:S:${ssid};T:${wifiType};P:${wifiPass};H:${hiddenSsid ? 'true' : 'false'};;`;
      case 'vcard':
        return [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `FN:${vcardName}`,
          `N:${vcardName};;;;`,
          vcardOrg ? `ORG:${vcardOrg}` : '',
          vcardTitle ? `TITLE:${vcardTitle}` : '',
          `TEL:${vcardPhone}`,
          `EMAIL:${vcardEmail}`,
          vcardWebsite ? `URL:${vcardWebsite}` : '',
          'END:VCARD',
        ]
          .filter(Boolean)
          .join('\n');
      case 'email':
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case 'sms':
        return `smsto:${smsPhone}:${smsMessage}`;
      case 'whatsapp': {
        const cleanPhone = waPhone.replace(/[^\d]/g, '');
        return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;
      }
      case 'crypto':
        if (cryptoType === 'bitcoin') {
          return `bitcoin:${cryptoAddress}${cryptoAmount ? `?amount=${cryptoAmount}` : ''}`;
        } else if (cryptoType === 'ethereum') {
          return `ethereum:${cryptoAddress}${cryptoAmount ? `?value=${cryptoAmount}` : ''}`;
        } else {
          return `solana:${cryptoAddress}`;
        }
      case 'geo':
        return `geo:${geoLat},${geoLng}`;
      default:
        return 'https://digitaltools.dev';
    }
  };

  // Render QR Code onto Canvas with optional frame & center icon badge
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const payload = getPayloadString();

    const tempCanvas = document.createElement('canvas');

    QRCode.toCanvas(tempCanvas, payload, {
      width: qrSize,
      margin: marginBlocks,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      errorCorrectionLevel: errorCorrection,
    })
      .then(() => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const frameExtraHeight = showFrame && frameLabel.trim() ? 50 : 0;
        canvas.width = qrSize;
        canvas.height = qrSize + frameExtraHeight;

        // Background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw QR Code
        ctx.drawImage(tempCanvas, 0, 0);

        // Draw Frame banner if enabled
        if (showFrame && frameLabel.trim()) {
          ctx.fillStyle = fgColor;
          ctx.fillRect(10, qrSize, qrSize - 20, 40);

          ctx.fillStyle = bgColor;
          ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(frameLabel.toUpperCase(), qrSize / 2, qrSize + 20);
        }

        // Center Icon badge drawing (requires High error correction)
        if (centerIcon !== 'none') {
          const badgeSize = Math.round(qrSize * 0.22);
          const badgeX = (qrSize - badgeSize) / 2;
          const badgeY = (qrSize - badgeSize) / 2;

          // Draw white background backing for center icon
          ctx.fillStyle = bgColor;
          ctx.beginPath();
          ctx.arc(qrSize / 2, qrSize / 2, badgeSize / 2 + 4, 0, 2 * Math.PI);
          ctx.fill();

          ctx.fillStyle = fgColor;
          ctx.beginPath();
          ctx.arc(qrSize / 2, qrSize / 2, badgeSize / 2, 0, 2 * Math.PI);
          ctx.fill();

          // Draw inner symbol
          ctx.fillStyle = bgColor;
          ctx.font = `bold ${Math.round(badgeSize * 0.55)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          let symbol = '★';
          if (centerIcon === 'link') symbol = '🔗';
          else if (centerIcon === 'wifi') symbol = '📶';
          else if (centerIcon === 'user') symbol = '👤';
          else if (centerIcon === 'crypto') symbol = '₿';

          if (centerIcon === 'custom' && customIconData) {
            const customImg = new Image();
            customImg.onload = () => {
              ctx.drawImage(customImg, badgeX + 4, badgeY + 4, badgeSize - 8, badgeSize - 8);
            };
            customImg.src = customIconData;
          } else {
            ctx.fillText(symbol, qrSize / 2, qrSize / 2);
          }
        }
      })
      .catch(() => {
        // Ignore render exceptions during fast typing
      });
  }, [
    qrType,
    url,
    text,
    ssid,
    wifiPass,
    wifiType,
    hiddenSsid,
    vcardName,
    vcardOrg,
    vcardTitle,
    vcardPhone,
    vcardEmail,
    vcardWebsite,
    emailTo,
    emailSubject,
    emailBody,
    smsPhone,
    smsMessage,
    waPhone,
    waMessage,
    cryptoType,
    cryptoAddress,
    cryptoAmount,
    geoLat,
    geoLng,
    fgColor,
    bgColor,
    errorCorrection,
    qrSize,
    marginBlocks,
    frameLabel,
    showFrame,
    centerIcon,
    customIconData,
  ]);

  const handleDownloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `qrcode_${qrType}_${Date.now()}.png`;
    link.click();
  };

  const handleCopyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ]);
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 2000);
      });
    } catch {
      // Fallback
    }
  };

  const handleDownloadSvg = async () => {
    const payload = getPayloadString();
    try {
      const svgString = await QRCode.toString(payload, {
        type: 'svg',
        margin: marginBlocks,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: errorCorrection,
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const linkUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = linkUrl;
      link.download = `qrcode_${qrType}_${Date.now()}.svg`;
      link.click();
      URL.revokeObjectURL(linkUrl);
    } catch {
      // Ignore
    }
  };

  const handleCustomLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomIconData(event.target?.result as string);
      setCenterIcon('custom');
      setErrorCorrection('H'); // Auto switch to high error correction
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Type Switcher Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
        {[
          { id: 'url', label: 'Website URL', icon: Globe },
          { id: 'text', label: 'Plain Text', icon: AlignLeft },
          { id: 'wifi', label: 'Wi-Fi Network', icon: Wifi },
          { id: 'vcard', label: 'vCard Contact', icon: User },
          { id: 'email', label: 'Email Draft', icon: Mail },
          { id: 'sms', label: 'SMS Message', icon: MessageSquare },
          { id: 'whatsapp', label: 'WhatsApp', icon: Send },
          { id: 'crypto', label: 'Crypto Address', icon: Coins },
          { id: 'geo', label: 'Map Location', icon: MapPin },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = qrType === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setQrType(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Config Panel */}
        <div className="lg:col-span-7 space-y-5">
          <Card className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Payload Details ({qrType.toUpperCase()})
            </h2>

            {qrType === 'url' && (
              <Input
                label="Destination URL"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                helperText="Static target destination without any intermediary redirection."
              />
            )}

            {qrType === 'text' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Text Content
                </label>
                <textarea
                  rows={3}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 font-mono"
                  placeholder="Enter raw text to encode into matrix..."
                />
              </div>
            )}

            {qrType === 'wifi' && (
              <div className="space-y-3">
                <Input
                  label="Network SSID (Name)"
                  value={ssid}
                  onChange={(e) => setSsid(e.target.value)}
                  placeholder="e.g. Guest-WiFi"
                />
                <Input
                  label="Wi-Fi Password / Passphrase"
                  type="text"
                  value={wifiPass}
                  onChange={(e) => setWifiPass(e.target.value)}
                  placeholder="Security key"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Encryption Protocol"
                    value={wifiType}
                    onChange={(e) => setWifiType(e.target.value)}
                    options={[
                      { value: 'WPA', label: 'WPA / WPA2 / WPA3 (Recommended)' },
                      { value: 'WEP', label: 'WEP (Legacy)' },
                      { value: 'nopass', label: 'Open (No Password)' },
                    ]}
                  />
                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={hiddenSsid}
                        onChange={(e) => setHiddenSsid(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Hidden SSID Network</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {qrType === 'vcard' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Full Name" value={vcardName} onChange={(e) => setVcardName(e.target.value)} />
                  <Input label="Company / Org" value={vcardOrg} onChange={(e) => setVcardOrg(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Job Title" value={vcardTitle} onChange={(e) => setVcardTitle(e.target.value)} />
                  <Input label="Phone Number" value={vcardPhone} onChange={(e) => setVcardPhone(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Email Address" type="email" value={vcardEmail} onChange={(e) => setVcardEmail(e.target.value)} />
                  <Input label="Website" value={vcardWebsite} onChange={(e) => setVcardWebsite(e.target.value)} />
                </div>
              </div>
            )}

            {qrType === 'email' && (
              <div className="space-y-3">
                <Input label="Recipient Email" type="email" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} />
                <Input label="Subject Line" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Email Body
                  </label>
                  <textarea
                    rows={2}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
                  />
                </div>
              </div>
            )}

            {qrType === 'sms' && (
              <div className="space-y-3">
                <Input label="Recipient Phone Number" value={smsPhone} onChange={(e) => setSmsPhone(e.target.value)} />
                <Input label="Pre-filled SMS Text" value={smsMessage} onChange={(e) => setSmsMessage(e.target.value)} />
              </div>
            )}

            {qrType === 'whatsapp' && (
              <div className="space-y-3">
                <Input
                  label="WhatsApp Phone Number (with Country Code, no +)"
                  placeholder="e.g. 15551234567"
                  value={waPhone}
                  onChange={(e) => setWaPhone(e.target.value)}
                />
                <Input label="Initial Message" value={waMessage} onChange={(e) => setWaMessage(e.target.value)} />
              </div>
            )}

            {qrType === 'crypto' && (
              <div className="space-y-3">
                <Select
                  label="Cryptocurrency"
                  value={cryptoType}
                  onChange={(e) => setCryptoType(e.target.value as any)}
                  options={[
                    { value: 'bitcoin', label: 'Bitcoin (BTC)' },
                    { value: 'ethereum', label: 'Ethereum (ETH)' },
                    { value: 'solana', label: 'Solana (SOL)' },
                  ]}
                />
                <Input
                  label="Wallet Address"
                  value={cryptoAddress}
                  onChange={(e) => setCryptoAddress(e.target.value)}
                  placeholder="Enter crypto wallet address"
                />
                <Input
                  label="Requested Amount (Optional)"
                  value={cryptoAmount}
                  onChange={(e) => setCryptoAmount(e.target.value)}
                  placeholder="e.g. 0.05"
                />
              </div>
            )}

            {qrType === 'geo' && (
              <div className="grid grid-cols-2 gap-3">
                <Input label="Latitude" value={geoLat} onChange={(e) => setGeoLat(e.target.value)} />
                <Input label="Longitude" value={geoLng} onChange={(e) => setGeoLng(e.target.value)} />
              </div>
            )}
          </Card>

          {/* Design & Frame Settings */}
          <Card className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Visual Design & Customization
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Foreground
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-8 p-0 rounded cursor-pointer border border-slate-300 dark:border-slate-700"
                    aria-label="Foreground color"
                  />
                  <span className="font-mono text-xs">{fgColor}</span>
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

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Resolution
                </label>
                <select
                  value={qrSize}
                  onChange={(e) => setQrSize(Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value={200}>200 px (Compact)</option>
                  <option value={300}>300 px (Standard)</option>
                  <option value={500}>500 px (High-Res)</option>
                  <option value={800}>800 px (Print 300 DPI)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Error Recovery
                </label>
                <select
                  value={errorCorrection}
                  onChange={(e) => setErrorCorrection(e.target.value as any)}
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="L">L (7% Recovery)</option>
                  <option value="M">M (15% Recovery)</option>
                  <option value="Q">Q (25% Recovery)</option>
                  <option value="H">H (30% Highest)</option>
                </select>
              </div>
            </div>

            {/* Frame Callout */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={showFrame}
                    onChange={(e) => setShowFrame(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Attach Call-to-Action Bottom Banner</span>
                </label>
              </div>

              {showFrame && (
                <div className="flex gap-2">
                  <Input
                    label="Banner Text"
                    value={frameLabel}
                    onChange={(e) => setFrameLabel(e.target.value)}
                    placeholder="e.g. SCAN ME / CONNECT / PAY HERE"
                  />
                </div>
              )}
            </div>

            {/* Center Logo Badge */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Center Icon Badge (Requires H error recovery)
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {[
                  { id: 'none', label: 'None' },
                  { id: 'link', label: '🔗 Link' },
                  { id: 'wifi', label: '📶 Wi-Fi' },
                  { id: 'user', label: '👤 Contact' },
                  { id: 'crypto', label: '₿ Crypto' },
                ].map((iconOpt) => (
                  <button
                    key={iconOpt.id}
                    type="button"
                    onClick={() => {
                      setCenterIcon(iconOpt.id as any);
                      if (iconOpt.id !== 'none') setErrorCorrection('H');
                    }}
                    className={`px-3 py-1 rounded-md border ${
                      centerIcon === iconOpt.id
                        ? 'bg-blue-600 border-blue-600 text-white font-bold'
                        : 'border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {iconOpt.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Output Stage */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <Card className="flex flex-col items-center justify-center p-6 text-center space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Interactive QR Code
            </span>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white shadow-lg inline-block max-w-full overflow-hidden">
              <canvas ref={canvasRef} className="rounded max-w-full h-auto" />
            </div>

            <div className="space-y-2 w-full">
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" onClick={handleDownloadPng} leftIcon={<Download className="w-3.5 h-3.5" />}>
                  Download PNG
                </Button>
                <Button size="sm" variant="outline" onClick={handleDownloadSvg} leftIcon={<Download className="w-3.5 h-3.5" />}>
                  Download SVG
                </Button>
              </div>

              <Button
                size="sm"
                variant="secondary"
                onClick={handleCopyImage}
                leftIcon={copiedImage ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                className="w-full"
              >
                {copiedImage ? 'Copied QR Image to Clipboard!' : 'Copy Image to Clipboard'}
              </Button>
            </div>

            <div className="text-[11px] text-slate-500 space-y-1 border-t border-slate-100 dark:border-slate-800 pt-3 w-full text-left">
              <p>• <strong>100% Static:</strong> Encodes raw payload directly.</p>
              <p>• <strong>Zero Tracking:</strong> Scanners parse data directly without third-party web redirects.</p>
              <p>• <strong>Infinite Lifetime:</strong> Never expires or changes.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
