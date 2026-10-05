'use client';

import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Plus, Trash2, Download, Receipt, Printer, Image as ImageIcon, CreditCard, CheckCircle2 } from 'lucide-react';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export const InvoiceGenerator: React.FC = () => {
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-001');
  const [currency, setCurrency] = useState('$');
  const [status, setStatus] = useState<'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE'>('PENDING');

  // Seller info
  const [sellerName, setSellerName] = useState('Jordan Lee (Freelance Engineer)');
  const [sellerEmail, setSellerEmail] = useState('jordan@freelance-dev.com');
  const [sellerAddress, setSellerAddress] = useState('Austin, TX, United States');
  const [sellerTaxId, setSellerTaxId] = useState('TAX-ID: US-99201488');

  // Client info
  const [clientName, setClientName] = useState('Nexus Ventures LLC');
  const [clientEmail, setClientEmail] = useState('billing@nexusventures.com');
  const [clientAddress, setClientAddress] = useState('100 Silicon Way, San Francisco, CA');

  // Dates
  const [issueDate, setIssueDate] = useState('2026-10-05');
  const [dueDate, setDueDate] = useState('2026-10-19');

  // Logo
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Line items
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: '1',
      description: 'Full-stack Next.js web application architecture (Sprint 1)',
      quantity: 40,
      rate: 85,
    },
    {
      id: '2',
      description: 'RESTful & GraphQL API integration with automated unit tests',
      quantity: 15,
      rate: 90,
    },
    {
      id: '3',
      description: 'Lighthouse Core Web Vitals optimization (Performance & SEO)',
      quantity: 8,
      rate: 85,
    },
  ]);

  const [taxPercent, setTaxPercent] = useState<number>(5);
  const [discountAmount, setDiscountAmount] = useState<number>(100);
  const [notes, setNotes] = useState('Payment due within 14 calendar days. Please reference the invoice number in your wire memo.');

  // Payment details
  const [paymentMethod, setPaymentMethod] = useState<'wire' | 'paypal' | 'crypto'>('wire');
  const [wireDetails, setWireDetails] = useState('Bank: Chase Bank N.A. | Account: 8820-1949-01 | Routing: 111000614 | SWIFT: CHASUS33');
  const [paypalEmail, setPaypalEmail] = useState('payments@freelance-dev.com');
  const [cryptoWallet, setCryptoWallet] = useState('0x71C...49A (USDC on Polygon / Ethereum)');

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: '',
        quantity: 1,
        rate: 50,
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.rate, 0);
  const taxAmount = (subtotal * taxPercent) / 100;
  const total = Math.max(0, subtotal + taxAmount - discountAmount);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter',
    });

    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;
    let y = 45;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(20, 20, 20);
    doc.text('INVOICE', margin, y);

    // Status Stamp
    doc.setFontSize(10);
    doc.setTextColor(status === 'PAID' ? 16 : 80, status === 'PAID' ? 185 : 80, status === 'PAID' ? 129 : 80);
    doc.text(`[ STATUS: ${status} ]`, margin + 115, y - 2);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`# ${invoiceNumber}`, margin + contentWidth, y, { align: 'right' });
    y += 24;

    // Dates
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`Issue Date: ${issueDate}    |    Payment Due Date: ${dueDate}`, margin, y);
    y += 20;

    // Divider
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, margin + contentWidth, y);
    y += 20;

    // Billed From and To
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(40, 40, 40);
    doc.text('BILLED FROM (VENDOR):', margin, y);
    doc.text('BILLED TO (CLIENT):', margin + contentWidth / 2, y);
    y += 14;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(70, 70, 70);
    doc.text(sellerName, margin, y);
    doc.text(clientName, margin + contentWidth / 2, y);
    y += 12;

    doc.text(sellerEmail, margin, y);
    doc.text(clientEmail, margin + contentWidth / 2, y);
    y += 12;

    doc.text(sellerAddress, margin, y);
    doc.text(clientAddress, margin + contentWidth / 2, y);
    y += 12;

    if (sellerTaxId) {
      doc.text(sellerTaxId, margin, y);
      y += 14;
    }
    y += 12;

    // Table Header
    doc.setFillColor(245, 247, 250);
    doc.rect(margin, y - 10, contentWidth, 20, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text('DESCRIPTION', margin + 8, y + 4);
    doc.text('QTY / HRS', margin + 300, y + 4);
    doc.text('RATE', margin + 370, y + 4);
    doc.text('AMOUNT', margin + contentWidth - 8, y + 4, { align: 'right' });
    y += 20;

    // Table Items
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);

    items.forEach((item) => {
      const lineTotal = item.quantity * item.rate;
      doc.text(item.description || 'Deliverable Item', margin + 8, y);
      doc.text(item.quantity.toString(), margin + 300, y);
      doc.text(`${currency}${item.rate.toFixed(2)}`, margin + 370, y);
      doc.text(`${currency}${lineTotal.toFixed(2)}`, margin + contentWidth - 8, y, {
        align: 'right',
      });
      y += 18;
    });

    y += 10;
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, y, margin + contentWidth, y);
    y += 16;

    // Summary Totals
    const summaryX = margin + contentWidth - 170;
    doc.setFontSize(9.5);
    doc.setTextColor(80, 80, 80);

    doc.text('Subtotal:', summaryX, y);
    doc.text(`${currency}${subtotal.toFixed(2)}`, margin + contentWidth - 8, y, {
      align: 'right',
    });
    y += 14;

    if (taxPercent > 0) {
      doc.text(`Tax / VAT (${taxPercent}%):`, summaryX, y);
      doc.text(`${currency}${taxAmount.toFixed(2)}`, margin + contentWidth - 8, y, {
        align: 'right',
      });
      y += 14;
    }

    if (discountAmount > 0) {
      doc.text('Promotional Discount:', summaryX, y);
      doc.text(`-${currency}${discountAmount.toFixed(2)}`, margin + contentWidth - 8, y, {
        align: 'right',
      });
      y += 14;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 20);
    doc.text('TOTAL DUE:', summaryX, y + 4);
    doc.text(`${currency}${total.toFixed(2)}`, margin + contentWidth - 8, y + 4, {
      align: 'right',
    });
    y += 30;

    // Payment details in PDF
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text('PAYMENT INSTRUCTIONS:', margin, y);
    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(90, 90, 90);
    const payStr =
      paymentMethod === 'wire'
        ? wireDetails
        : paymentMethod === 'paypal'
        ? `PayPal: ${paypalEmail}`
        : `Crypto Address: ${cryptoWallet}`;
    doc.text(payStr, margin, y);
    y += 20;

    // Notes
    if (notes.trim()) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text('TERMS & CONDITIONS:', margin, y);
      y += 12;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 100);
      const splitNotes = doc.splitTextToSize(notes, contentWidth);
      doc.text(splitNotes, margin, y);
    }

    doc.save(`${invoiceNumber.toLowerCase()}_invoice.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Editor Form */}
      <div className="lg:col-span-6 space-y-6">
        <Card className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-600" />
              <span>Invoice Information</span>
            </h2>

            <div className="flex items-center gap-2">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="px-2 py-1 text-xs rounded border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900 font-semibold"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="PENDING">PENDING</option>
                <option value="PAID">PAID</option>
                <option value="OVERDUE">OVERDUE</option>
              </select>

              <div className="w-24">
                <Select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  options={[
                    { value: '$', label: 'USD ($)' },
                    { value: '€', label: 'EUR (€)' },
                    { value: '£', label: 'GBP (£)' },
                    { value: 'Rs', label: 'PKR (Rs)' },
                    { value: 'CAD $', label: 'CAD ($)' },
                    { value: 'AED', label: 'AED (د.إ)' },
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Invoice Number"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
            <Input
              label="Issue Date"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
            <Input
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Logo upload */}
          <div className="pt-1">
            <label className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{logoUrl ? 'Change Company Logo' : 'Attach Business Logo'}</span>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>
        </Card>

        {/* Sender and Client Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Billed From (You)</h3>
            <Input
              label="Business / Freelancer Name"
              value={sellerName}
              onChange={(e) => setSellerName(e.target.value)}
            />
            <Input
              label="Your Email"
              value={sellerEmail}
              onChange={(e) => setSellerEmail(e.target.value)}
            />
            <Input
              label="Address / Location"
              value={sellerAddress}
              onChange={(e) => setSellerAddress(e.target.value)}
            />
            <Input
              label="Tax ID / Registration (Optional)"
              value={sellerTaxId}
              onChange={(e) => setSellerTaxId(e.target.value)}
            />
          </Card>

          <Card className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Billed To (Client)</h3>
            <Input
              label="Client / Company Name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
            <Input
              label="Client Email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
            <Input
              label="Client Address"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
            />
          </Card>
        </div>

        {/* Billable Line Items */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Billable Line Items
            </h2>
            <Button size="sm" variant="outline" onClick={addItem} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row gap-3 items-end"
              >
                <div className="flex-1 w-full">
                  <Input
                    label={`Item #${idx + 1} Description`}
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Deliverable, feature, or hours"
                  />
                </div>
                <div className="w-24">
                  <Input
                    label="Qty / Hrs"
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                  />
                </div>
                <div className="w-28">
                  <Input
                    label="Rate"
                    type="number"
                    min={0}
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value))}
                    rightAddon={currency}
                  />
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-rose-500 hover:text-rose-700 pb-2.5"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Input
              label="Tax Rate (%)"
              type="number"
              min={0}
              max={100}
              value={taxPercent}
              onChange={(e) => setTaxPercent(Number(e.target.value))}
              rightAddon="%"
            />
            <Input
              label="Discount Amount"
              type="number"
              min={0}
              value={discountAmount}
              onChange={(e) => setDiscountAmount(Number(e.target.value))}
              rightAddon={currency}
            />
          </div>

          {/* Payment Method Details */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                <span>Payment Remittance Method</span>
              </span>
              <div className="flex gap-1 text-xs">
                {(['wire', 'paypal', 'crypto'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`px-2.5 py-1 rounded font-semibold capitalize ${
                      paymentMethod === m ? 'bg-blue-600 text-white' : 'border border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === 'wire' && (
              <Input
                label="Bank Wire Transfer / ACH Details"
                value={wireDetails}
                onChange={(e) => setWireDetails(e.target.value)}
              />
            )}
            {paymentMethod === 'paypal' && (
              <Input
                label="PayPal Remittance Address"
                value={paypalEmail}
                onChange={(e) => setPaypalEmail(e.target.value)}
              />
            )}
            {paymentMethod === 'crypto' && (
              <Input
                label="Cryptocurrency Wallet Address (USDC / BTC)"
                value={cryptoWallet}
                onChange={(e) => setCryptoWallet(e.target.value)}
              />
            )}
          </div>

          <Textarea
            label="Terms & Conditions / Memo"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Card>
      </div>

      {/* Invoice Live Preview & Actions */}
      <div className="lg:col-span-6 lg:sticky lg:top-24 space-y-4">
        <div className="flex items-center justify-between pb-2 flex-wrap gap-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Document Vector Preview
          </h2>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint} leftIcon={<Printer className="w-3.5 h-3.5" />}>
              Print
            </Button>
            <Button size="sm" onClick={generatePDF} leftIcon={<Download className="w-3.5 h-3.5" />}>
              Download PDF Invoice
            </Button>
          </div>
        </div>

        {/* Paper Document Preview */}
        <div className="bg-white text-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 text-left text-xs leading-relaxed space-y-6">
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div className="space-y-1">
              {logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="Business logo" className="max-h-12 max-w-36 object-contain mb-2" />
              )}
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">INVOICE</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    status === 'PAID'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : status === 'OVERDUE'
                      ? 'bg-rose-50 text-rose-700 border-rose-300'
                      : 'bg-blue-50 text-blue-700 border-blue-300'
                  }`}
                >
                  {status}
                </span>
              </div>
              <p className="text-slate-500 font-mono">{invoiceNumber}</p>
            </div>
            <div className="text-right text-[11px] text-slate-500 space-y-0.5">
              <p>Issue Date: <strong className="text-slate-800">{issueDate}</strong></p>
              <p>Payment Due: <strong className="text-slate-800">{dueDate}</strong></p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-[11px]">
            <div>
              <span className="font-bold text-slate-400 block uppercase tracking-wider text-[10px]">
                Billed From:
              </span>
              <p className="font-bold text-slate-900 mt-0.5">{sellerName}</p>
              <p className="text-slate-600">{sellerEmail}</p>
              <p className="text-slate-600">{sellerAddress}</p>
              {sellerTaxId && <p className="text-slate-500 font-mono text-[10px]">{sellerTaxId}</p>}
            </div>
            <div>
              <span className="font-bold text-slate-400 block uppercase tracking-wider text-[10px]">
                Billed To:
              </span>
              <p className="font-bold text-slate-900 mt-0.5">{clientName}</p>
              <p className="text-slate-600">{clientEmail}</p>
              <p className="text-slate-600">{clientAddress}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-50 text-slate-700">
                  <th className="py-2 px-2.5">Description</th>
                  <th className="py-2 px-2.5">Qty</th>
                  <th className="py-2 px-2.5">Rate</th>
                  <th className="py-2 px-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 px-2.5 font-medium">{item.description || 'Deliverable'}</td>
                    <td className="py-2.5 px-2.5">{item.quantity}</td>
                    <td className="py-2.5 px-2.5">{currency}{item.rate.toFixed(2)}</td>
                    <td className="py-2.5 px-2.5 text-right font-semibold">
                      {currency}{(item.quantity * item.rate).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 pt-3 flex flex-col items-end text-xs space-y-1">
            <div className="flex justify-between w-52 text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold font-mono">{currency}{subtotal.toFixed(2)}</span>
            </div>
            {taxPercent > 0 && (
              <div className="flex justify-between w-52 text-slate-600">
                <span>Tax ({taxPercent}%):</span>
                <span className="font-mono">{currency}{taxAmount.toFixed(2)}</span>
              </div>
            )}
            {discountAmount > 0 && (
              <div className="flex justify-between w-52 text-emerald-600 font-semibold">
                <span>Discount:</span>
                <span className="font-mono">-{currency}{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between w-52 text-base font-extrabold text-slate-900 border-t border-slate-300 pt-2">
              <span>Total Due:</span>
              <span className="font-mono text-blue-600">{currency}{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-600 space-y-1">
            <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
              Payment Instructions:
            </span>
            <p className="font-mono text-[10px]">
              {paymentMethod === 'wire'
                ? wireDetails
                : paymentMethod === 'paypal'
                ? `PayPal: ${paypalEmail}`
                : `Crypto: ${cryptoWallet}`}
            </p>
          </div>

          {notes && (
            <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700 block text-[10px] uppercase">Terms & Notes:</span>
              <p className="mt-0.5">{notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
