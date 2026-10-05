'use client';

import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { CopyButton } from '@/components/ui/CopyButton';
import { Download, RefreshCw, FileText, Sparkles, Building, User } from 'lucide-react';

export const CoverLetterGenerator: React.FC = () => {
  const [applicantName, setApplicantName] = useState('Sarah Jenkins');
  const [applicantEmail, setApplicantEmail] = useState('sarah.jenkins@example.com');
  const [applicantPhone, setApplicantPhone] = useState('+1 (555) 456-7890');
  const [applicantAddress, setApplicantAddress] = useState('San Francisco, CA');

  const [targetRole, setTargetRole] = useState('Lead Frontend Engineer');
  const [companyName, setCompanyName] = useState('Vanguard Technologies');
  const [companyAddress, setCompanyAddress] = useState('Austin, TX');
  const [hiringManager, setHiringManager] = useState('Hiring Manager');

  const [archetype, setArchetype] = useState<'graduate' | 'professional' | 'transition'>('professional');
  const [tone, setTone] = useState<'confident' | 'formal' | 'concise' | 'enthusiastic'>('confident');

  const [coreSkills, setCoreSkills] = useState('React 19, Next.js App Router, TypeScript, Performance Optimization');
  const [topMetric, setTopMetric] = useState('reduced page bundle size by 45% and boosted Core Web Vitals to 99');
  const [companyInterest, setCompanyInterest] = useState(
    'dedication to open web performance benchmarks and developer-first cloud primitives'
  );

  const generateLetterText = (): string => {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const skillsArray = coreSkills.split(',').map((s) => s.trim()).filter(Boolean);

    let salutation = `Dear ${hiringManager},`;
    if (tone === 'formal' && !hiringManager.toLowerCase().includes('team') && !hiringManager.toLowerCase().includes('manager')) {
      salutation = `Dear Mr./Ms. ${hiringManager},`;
    }

    // Opening Paragraph based on archetype & tone
    let opening = '';
    if (archetype === 'graduate') {
      if (tone === 'enthusiastic') {
        opening = `I was delighted to discover the ${targetRole} opportunity at ${companyName}. As a recent university graduate with a rigorous foundation in software engineering and hands-on capstone project execution, I have spent the past several years mastering modern development workflows. I have long admired ${companyName}’s ${companyInterest}, and I am eager to channel my energy and technical training into your engineering team.`;
      } else if (tone === 'concise') {
        opening = `I am applying for the ${targetRole} position at ${companyName}. Having recently completed my degree with intensive coursework in ${skillsArray.slice(0, 3).join(', ')}, I offer a strong foundation in modern development practices and a commitment to high-quality code delivery.`;
      } else {
        opening = `I am writing to express my strong interest in the ${targetRole} position at ${companyName}. As an ambitious graduate with comprehensive training in ${skillsArray.slice(0, 3).join(', ')}, I am excited to apply my practical project experience and disciplined work ethic to support your strategic goals. ${companyName}’s ${companyInterest} represents the ideal environment to launch my professional contributions.`;
      }
    } else if (archetype === 'transition') {
      opening = `I am writing to apply for the ${targetRole} role with ${companyName}. Bringing a unique multidisciplinary background paired with demonstrated technical expertise in ${skillsArray.join(', ')}, I offer a holistic perspective that bridges business requirements with technical execution. Having recently ${topMetric}, I am ready to accelerate your engineering initiatives.`;
    } else {
      // Experienced Professional
      if (tone === 'concise') {
        opening = `I am submitting my candidacy for the ${targetRole} opening at ${companyName}. With extensive experience building resilient software systems and mastering ${skillsArray.join(', ')}, I have consistently delivered measurable outcomes, including having recently ${topMetric}.`;
      } else if (tone === 'formal') {
        opening = `Please accept this letter and the enclosed resume as my formal application for the ${targetRole} role with ${companyName}. Over my career, I have dedicated myself to engineering excellence, strategic technical leadership, and collaborative delivery across ${skillsArray.join(', ')}.`;
      } else {
        opening = `I am writing to express my enthusiastic interest in the ${targetRole} position at ${companyName}. With a proven track record of scaling high-traffic web applications and deep expertise in ${skillsArray.join(', ')}, I am energized by ${companyName}’s ${companyInterest} and confident in my ability to make an immediate impact on your upcoming milestones.`;
      }
    }

    // Body Paragraph 1: Qualifications & Key Metric
    let body1 = '';
    if (archetype === 'graduate') {
      body1 = `During my academic capstones and independent projects, I emphasized writing clean, modular code with automated test coverage. I built scalable web interfaces using ${skillsArray.join(', ')}, translating ambiguous requirements into reliable digital architectures. My project work reinforced the importance of git version control hygiene, collaborative code reviews, and maintaining accessibility standards across production deployments.`;
    } else {
      body1 = `Throughout my engineering career, I have prioritized architectural resilience and performance optimization. For example, in my previous role, I ${topMetric}. By establishing automated CI/CD testing pipelines and refining microservice data flows with ${skillsArray.slice(0, 3).join(', ')}, I have empowered cross-functional teams to ship features faster while minimizing regression overhead.`;
    }

    // Body Paragraph 2: Alignment & Cultural Contribution
    const body2 = `What distinguishes ${companyName} for me is your ${companyInterest}. I thrive in collaborative environments where engineers are encouraged to ask deep questions, mentor peers, and take end-to-end ownership of customer-facing products. I look forward to contributing my technical rigor and continuous learning mindset to your engineering organization.`;

    // Closing Paragraph
    let closing = '';
    let signOff = 'Sincerely,';
    if (tone === 'concise') {
      closing = `I would welcome the opportunity to discuss how my technical skills can directly support ${companyName}’s product roadmap. Thank you for your time and consideration.`;
    } else if (tone === 'formal') {
      closing = `Thank you for your review of my credentials. I welcome the opportunity to discuss in an interview how my technical competencies and background satisfy the requirements of the ${targetRole} position.`;
      signOff = 'Respectfully yours,';
    } else {
      closing = `I would appreciate the opportunity to speak with you regarding how my technical qualifications and passion for craftsmanship can advance ${companyName}’s engineering mission. Thank you for your time and consideration.`;
      signOff = 'Warm regards,';
    }

    return `${applicantName}\n${applicantEmail}  |  ${applicantPhone}  |  ${applicantAddress}\n\n${today}\n\n${hiringManager}\n${companyName}\n${companyAddress}\n\n${salutation}\n\n${opening}\n\n${body1}\n\n${body2}\n\n${closing}\n\n${signOff}\n${applicantName}`;
  };

  const [letterText, setLetterText] = useState<string>(generateLetterText());

  const handleRegenerate = () => {
    setLetterText(generateLetterText());
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([letterText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${applicantName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_cover_letter.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter',
    });

    const margin = 50;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;
    let y = 60;

    // Header Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(20, 20, 20);
    doc.text(applicantName, margin, y);
    y += 16;

    // Contact line
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    const contact = [applicantEmail, applicantPhone, applicantAddress].filter(Boolean).join('   |   ');
    doc.text(contact, margin, y);
    y += 16;

    // Rule
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(1);
    doc.line(margin, y, margin + contentWidth, y);
    y += 24;

    // Letter Body
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);

    const paragraphs = letterText.split('\n\n');
    paragraphs.forEach((p, idx) => {
      // Skip top contact lines since rendered in header
      if (idx === 0) return;

      const split = doc.splitTextToSize(p.trim(), contentWidth);
      doc.text(split, margin, y);
      y += split.length * 13 + 10;
    });

    const cleanPdfName = `${applicantName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_cover_letter.pdf`;
    doc.save(cleanPdfName);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Configuration Column */}
      <div className="space-y-6">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Candidate & Recipient Details</span>
            </h2>
            <Button size="sm" variant="ghost" onClick={handleRegenerate} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              Refresh Letter
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Your Name" value={applicantName} onChange={(e) => setApplicantName(e.target.value)} />
            <Input label="Your Email" value={applicantEmail} onChange={(e) => setApplicantEmail(e.target.value)} />
            <Input label="Your Phone" value={applicantPhone} onChange={(e) => setApplicantPhone(e.target.value)} />
            <Input label="Your Location" value={applicantAddress} onChange={(e) => setApplicantAddress(e.target.value)} />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Target Position Title" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
            <Input label="Company / Employer" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            <Input label="Company Location" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
            <Input label="Hiring Contact" value={hiringManager} onChange={(e) => setHiringManager(e.target.value)} />
          </div>
        </Card>

        {/* Customization & Narrative Tuning */}
        <Card className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Tone & Profile Positioning</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Applicant Experience Archetype"
              value={archetype}
              onChange={(e) => setArchetype(e.target.value as any)}
              options={[
                { value: 'professional', label: 'Experienced Mid/Senior Professional' },
                { value: 'graduate', label: 'Fresh Graduate / Entry-Level Projects' },
                { value: 'transition', label: 'Career Transition / Industry Pivot' },
              ]}
            />

            <Select
              label="Letter Narrative Tone"
              value={tone}
              onChange={(e) => setTone(e.target.value as any)}
              options={[
                { value: 'confident', label: 'Confident & Impactful' },
                { value: 'concise', label: 'Direct & Concise (Brief)' },
                { value: 'formal', label: 'Formal & Traditional' },
                { value: 'enthusiastic', label: 'Enthusiastic & Collaborative' },
              ]}
            />
          </div>

          <Input
            label="Key Skills (Matched to Job Description)"
            value={coreSkills}
            onChange={(e) => setCoreSkills(e.target.value)}
            placeholder="e.g. Next.js, TypeScript, SQL, Docker"
          />

          <Input
            label="Headline Metric / Major Career Accomplishment"
            value={topMetric}
            onChange={(e) => setTopMetric(e.target.value)}
            placeholder="e.g. increased checkout conversion rate by 22%"
          />

          <Input
            label="Why This Company? (Mission / Values)"
            value={companyInterest}
            onChange={(e) => setCompanyInterest(e.target.value)}
            placeholder="e.g. dedication to open developer tools and reliability"
          />

          <Button onClick={handleRegenerate} leftIcon={<RefreshCw className="w-4 h-4" />} className="w-full">
            Generate Tailored Cover Letter
          </Button>
        </Card>
      </div>

      {/* Live Editable Document Column */}
      <div className="lg:sticky lg:top-24 space-y-4">
        <div className="flex items-center justify-between pb-2 flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Interactive Letter Draft
            </h2>
            <span className="text-[11px] text-slate-500">Edit text directly before exporting</span>
          </div>

          <div className="flex items-center gap-2">
            <CopyButton textToCopy={letterText} />
            <Button size="sm" variant="outline" onClick={handleDownloadTxt} leftIcon={<Download className="w-3.5 h-3.5" />}>
              .TXT
            </Button>
            <Button size="sm" onClick={handleDownloadPdf} leftIcon={<Download className="w-3.5 h-3.5" />}>
              Download PDF
            </Button>
          </div>
        </div>

        {/* Paper Simulation */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 text-left min-h-[580px]">
          <Textarea
            rows={22}
            value={letterText}
            onChange={(e) => setLetterText(e.target.value)}
            aria-label="Editable generated cover letter draft"
            className="font-serif text-sm leading-relaxed border-none p-0 focus:ring-0 resize-none dark:bg-transparent text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>
    </div>
  );
};
