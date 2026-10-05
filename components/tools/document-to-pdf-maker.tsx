'use client';

import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Download, FileText, Settings, Sparkles, Plus, Trash2, Printer } from 'lucide-react';

interface DocSection {
  id: string;
  type: 'heading' | 'paragraph' | 'bullets';
  content: string;
}

export const DocumentToPdfMaker: React.FC = () => {
  const [title, setTitle] = useState('Non-Disclosure and Confidentiality Agreement');
  const [subtitle, setSubtitle] = useState('Standard Mutual Proprietary Information Exchange');
  const [author, setAuthor] = useState('DigitalTools Legal Department');
  const [pageSize, setPageSize] = useState<'letter' | 'a4' | 'legal'>('letter');
  const [fontFamily, setFontFamily] = useState<'helvetica' | 'times' | 'courier'>('helvetica');
  const [marginSize, setMarginSize] = useState<number>(45);

  const [sections, setSections] = useState<DocSection[]>([
    {
      id: '1',
      type: 'heading',
      content: '1. Identification of Parties & Purpose',
    },
    {
      id: '2',
      type: 'paragraph',
      content:
        'This Non-Disclosure Agreement is entered into by and between the Disclosing Party and the Receiving Party for the purpose of preventing the unauthorized disclosure of Proprietary Information as defined herein. Both parties agree that maintaining confidentiality is critical to mutual collaboration.',
    },
    {
      id: '3',
      type: 'heading',
      content: '2. Scope of Confidential Information',
    },
    {
      id: '4',
      type: 'bullets',
      content:
        'Proprietary software source code, system architecture diagrams, and algorithm designs\nFinancial projections, customer lists, pricing strategies, and supplier contracts\nUnpublished research findings, prototype hardware specifications, and trade secrets',
    },
    {
      id: '5',
      type: 'heading',
      content: '3. Obligations & Non-Disclosure Covenants',
    },
    {
      id: '6',
      type: 'paragraph',
      content:
        'The Receiving Party shall hold and maintain the Confidential Information in strictest confidence for the sole and exclusive benefit of the Disclosing Party. The Receiving Party shall carefully restrict access to Confidential Information to employees and contractors as reasonably required.',
    },
  ]);

  const addSection = (type: 'heading' | 'paragraph' | 'bullets') => {
    setSections([
      ...sections,
      {
        id: Date.now().toString(),
        type,
        content: type === 'heading' ? 'New Section Heading' : 'Enter section content here...',
      },
    ]);
  };

  const updateSection = (id: string, content: string) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, content } : s)));
  };

  const removeSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const handleLoadTemplate = (t: 'nda' | 'memo' | 'sow') => {
    if (t === 'memo') {
      setTitle('EXECUTIVE MEMORANDUM');
      setSubtitle('Q4 Infrastructure Scalability and Cloud Spend Optimization');
      setAuthor('Engineering Operations Team');
      setSections([
        { id: '1', type: 'heading', content: 'EXECUTIVE SUMMARY' },
        {
          id: '2',
          type: 'paragraph',
          content:
            'This memorandum outlines our cloud infrastructure migration milestones, targeted cost reductions, and service level objectives for the upcoming fiscal quarter.',
        },
        { id: '3', type: 'heading', content: 'KEY DELIVERABLES' },
        {
          id: '4',
          type: 'bullets',
          content:
            'Migrate remaining legacy microservices to containerized autoscaling pods\nEnforce strict client-side encryption and zero-knowledge storage policies\nReduce median API latency below 50ms across all global edge nodes',
        },
      ]);
    } else if (t === 'sow') {
      setTitle('STATEMENT OF WORK (SOW)');
      setSubtitle('Full-Stack Web Application Engineering');
      setAuthor('Nexus Consultancy Group');
      setSections([
        { id: '1', type: 'heading', content: 'Project Scope' },
        {
          id: '2',
          type: 'paragraph',
          content:
            'The Contractor shall deliver a high-performance, accessible Next.js App Router application meeting WCAG AA accessibility standards with zero serverless latency spikes.',
        },
        { id: '3', type: 'heading', content: 'Milestones & Acceptance' },
        {
          id: '4',
          type: 'bullets',
          content:
            'Milestone 1: Design system architecture and responsive UI layout\nMilestone 2: Offline tool integration with Web Crypto & Canvas\nMilestone 3: Final automated QA audit and production handover',
        },
      ]);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: pageSize,
    });

    const margin = marginSize;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margin * 2;
    let y = margin + 15;
    let pageNum = 1;

    const checkPageBreak = (needed: number) => {
      if (y + needed > pageHeight - margin - 20) {
        // Footer
        doc.setFont(fontFamily, 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(140, 140, 140);
        doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - margin + 10, { align: 'center' });

        doc.addPage();
        pageNum++;
        y = margin + 15;
      }
    };

    // Document Title
    doc.setFont(fontFamily, 'bold');
    doc.setFontSize(18);
    doc.setTextColor(20, 20, 20);
    const splitTitle = doc.splitTextToSize(title, contentWidth);
    doc.text(splitTitle, margin, y);
    y += splitTitle.length * 20 + 4;

    // Subtitle
    if (subtitle.trim()) {
      doc.setFont(fontFamily, 'italic');
      doc.setFontSize(10.5);
      doc.setTextColor(80, 80, 80);
      const splitSub = doc.splitTextToSize(subtitle, contentWidth);
      doc.text(splitSub, margin, y);
      y += splitSub.length * 13 + 6;
    }

    // Author & Timestamp
    if (author.trim()) {
      doc.setFont(fontFamily, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      doc.text(`Prepared by ${author}  ·  ${today}`, margin, y);
      y += 14;
    }

    // Divider Line
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(1);
    doc.line(margin, y, margin + contentWidth, y);
    y += 20;

    // Render Sections
    sections.forEach((sec) => {
      if (!sec.content.trim()) return;

      if (sec.type === 'heading') {
        checkPageBreak(30);
        doc.setFont(fontFamily, 'bold');
        doc.setFontSize(11.5);
        doc.setTextColor(30, 30, 30);
        doc.text(sec.content, margin, y);
        y += 16;
      } else if (sec.type === 'paragraph') {
        doc.setFont(fontFamily, 'normal');
        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        const splitP = doc.splitTextToSize(sec.content, contentWidth);
        checkPageBreak(splitP.length * 13 + 8);
        doc.text(splitP, margin, y);
        y += splitP.length * 13 + 12;
      } else if (sec.type === 'bullets') {
        doc.setFont(fontFamily, 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(50, 50, 50);

        const items = sec.content.split('\n');
        items.forEach((item) => {
          if (!item.trim()) return;
          const splitBullet = doc.splitTextToSize(item.trim(), contentWidth - 14);
          checkPageBreak(splitBullet.length * 12 + 4);
          doc.text('•', margin + 2, y);
          doc.text(splitBullet, margin + 12, y);
          y += splitBullet.length * 12 + 3;
        });
        y += 8;
      }
    });

    // Final Page Number
    doc.setFont(fontFamily, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(140, 140, 140);
    doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - margin + 10, { align: 'center' });

    const cleanFilename = (title.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'document') + '.pdf';
    doc.save(cleanFilename);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Configuration Column */}
      <div className="space-y-6">
        {/* Template Presets Bar */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Presets:</span>
            <button
              type="button"
              onClick={() => handleLoadTemplate('memo')}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Executive Memo
            </button>
            <span className="text-slate-400">·</span>
            <button
              type="button"
              onClick={() => handleLoadTemplate('sow')}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Scope of Work
            </button>
          </div>
        </div>

        {/* Document Metadata Card */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Document Details</span>
          </div>

          <Input label="Document Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input label="Subtitle / Reference" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          <Input label="Author / Department" value={author} onChange={(e) => setAuthor(e.target.value)} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Page Size"
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value as any)}
              options={[
                { value: 'letter', label: 'US Letter (8.5 × 11 in)' },
                { value: 'a4', label: 'A4 Standard (210 × 297 mm)' },
                { value: 'legal', label: 'US Legal (8.5 × 14 in)' },
              ]}
            />
            <Select
              label="Font Family"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value as any)}
              options={[
                { value: 'helvetica', label: 'Helvetica (Clean)' },
                { value: 'times', label: 'Times Roman (Formal)' },
                { value: 'courier', label: 'Courier (Monospace)' },
              ]}
            />
            <Select
              label="Margins"
              value={marginSize.toString()}
              onChange={(e) => setMarginSize(Number(e.target.value))}
              options={[
                { value: '30', label: 'Narrow (30pt)' },
                { value: '45', label: 'Normal (45pt)' },
                { value: '60', label: 'Wide (60pt)' },
              ]}
            />
          </div>
        </Card>

        {/* Document Sections Builder */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Document Content Sections
            </h2>
            <div className="flex gap-1.5">
              <Button size="sm" variant="outline" onClick={() => addSection('heading')}>
                + Heading
              </Button>
              <Button size="sm" variant="outline" onClick={() => addSection('paragraph')}>
                + Paragraph
              </Button>
              <Button size="sm" variant="outline" onClick={() => addSection('bullets')}>
                + Bullets
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {sections.map((sec, idx) => (
              <div
                key={sec.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-wider">
                    #{idx + 1} {sec.type}
                  </span>
                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSection(sec.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                      aria-label="Remove section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {sec.type === 'heading' ? (
                  <Input
                    value={sec.content}
                    onChange={(e) => updateSection(sec.id, e.target.value)}
                    placeholder="Section Heading..."
                  />
                ) : (
                  <Textarea
                    rows={sec.type === 'bullets' ? 3 : 4}
                    value={sec.content}
                    onChange={(e) => updateSection(sec.id, e.target.value)}
                    placeholder={
                      sec.type === 'bullets'
                        ? 'Enter bullet items (one per line)...'
                        : 'Enter paragraph text...'
                    }
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Document Preview and Download */}
      <div className="lg:sticky lg:top-24 space-y-4">
        <div className="flex items-center justify-between pb-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Document Vector Preview
            </h2>
            <span className="text-[11px] text-slate-500">Auto-paginated vector rendering</span>
          </div>
          <Button onClick={generatePDF} leftIcon={<Download className="w-4 h-4" />}>
            Generate PDF
          </Button>
        </div>

        {/* Paper Simulation */}
        <div
          className="rounded-xl border border-slate-200 bg-white p-8 shadow-xl text-slate-900 text-left min-h-[580px] space-y-4"
          style={{ fontFamily }}
        >
          <div className="border-b border-slate-300 pb-3">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">{title || 'Untitled Document'}</h3>
            {subtitle && <p className="text-xs text-slate-600 italic mt-0.5">{subtitle}</p>}
            {author && (
              <p className="text-[11px] text-slate-500 mt-1">
                Prepared by {author} · {new Date().toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="space-y-4 text-xs leading-relaxed text-slate-800">
            {sections.map((sec) => {
              if (sec.type === 'heading') {
                return (
                  <h4 key={sec.id} className="font-bold text-sm text-slate-900 pt-1">
                    {sec.content}
                  </h4>
                );
              }
              if (sec.type === 'bullets') {
                return (
                  <ul key={sec.id} className="space-y-1 pl-4 list-disc text-slate-700">
                    {sec.content.split('\n').map(
                      (b, i) => b.trim() && <li key={i}>{b}</li>
                    )}
                  </ul>
                );
              }
              return (
                <p key={sec.id} className="text-slate-700 leading-relaxed">
                  {sec.content}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
