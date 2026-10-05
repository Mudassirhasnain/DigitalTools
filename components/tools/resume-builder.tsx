'use client';

import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Card } from '@/components/ui/Card';
import { Plus, Trash2, Download, FileText, Sparkles, RefreshCw, Palette, Layers } from 'lucide-react';

interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

interface Education {
  id: string;
  school: string;
  degree: string;
  location: string;
  year: string;
  gpa?: string;
}

interface Project {
  id: string;
  title: string;
  technologies: string;
  link?: string;
  description: string;
}

export const ResumeBuilder: React.FC = () => {
  // Personal Details
  const [fullName, setFullName] = useState('Alex Morgan');
  const [title, setTitle] = useState('Senior Full Stack Software Engineer');
  const [email, setEmail] = useState('alex.morgan@example.com');
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [location, setLocation] = useState('San Francisco, CA');
  const [linkedin, setLinkedin] = useState('linkedin.com/in/alexmorgan');
  const [github, setGithub] = useState('github.com/alexmorgan');

  // Professional Summary
  const [summary, setSummary] = useState(
    'Impact-focused Software Engineer with 6+ years of experience architecting distributed cloud applications, accelerating microservice throughput by 40%, and mentoring high-performing engineering teams. Expert in TypeScript, Next.js, Go, PostgreSQL, and scalable AWS architectures.'
  );

  // Styling & Template Options
  const [template, setTemplate] = useState<'classic' | 'modern' | 'minimal'>('modern');
  const [accentColor, setAccentColor] = useState<string>('#1e3a8a'); // Navy

  // Work Experiences
  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: '1',
      company: 'Apex Cloud Solutions',
      role: 'Staff Software Engineer',
      location: 'San Francisco, CA',
      startDate: '2022',
      endDate: 'Present',
      bullets: [
        'Architected real-time stream processing pipeline using Kafka and Go, reducing query latency by 42% for 3M+ daily active enterprise users.',
        'Spearheaded transition from legacy monolith to Next.js App Router and serverless container microservices, slashing AWS compute costs by $180,000 annually.',
        'Mentored 6 junior and mid-level software engineers across clean code principles, automated unit testing, and continuous integration workflows.',
      ],
    },
    {
      id: '2',
      company: 'ByteWave Systems',
      role: 'Full Stack Engineer',
      location: 'Seattle, WA',
      startDate: '2019',
      endDate: '2022',
      bullets: [
        'Engineered responsive React/TypeScript client portal achieving 99.8% crash-free sessions across mobile and desktop environments.',
        'Optimized PostgreSQL query indexes and Redis cache invalidation strategies, improving API endpoint response times from 450ms to 75ms.',
        'Established end-to-end automated testing with Playwright and Jest, increasing code test coverage from 58% to 92%.',
      ],
    },
  ]);

  // Education
  const [educations, setEducations] = useState<Education[]>([
    {
      id: '1',
      school: 'University of Washington',
      degree: 'B.S. in Computer Science & Engineering',
      location: 'Seattle, WA',
      year: '2019',
      gpa: '3.85 / 4.0',
    },
  ]);

  // Projects
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      title: 'Distributed Vector Cache',
      technologies: 'Rust, WebAssembly, Redis',
      link: 'github.com/alexmorgan/vector-cache',
      description:
        'Engineered an open-source in-memory vector index supporting sub-millisecond approximate nearest neighbor searches for generative AI applications.',
    },
  ]);

  // Skills
  const [skillsLanguages, setSkillsLanguages] = useState('TypeScript, JavaScript, Go, Python, SQL, HTML5/CSS3');
  const [skillsFrameworks, setSkillsFrameworks] = useState('React, Next.js, Node.js, Express, Tailwind CSS, GraphQL');
  const [skillsTools, setSkillsTools] = useState('Docker, Kubernetes, AWS (S3, ECS, Lambda), Git, PostgreSQL, Redis, Kafka');

  // Experience handlers
  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        id: Date.now().toString(),
        company: '',
        role: '',
        location: '',
        startDate: '',
        endDate: '',
        bullets: ['Led development of core features improving performance by 20%.'],
      },
    ]);
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    setExperiences(experiences.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)));
  };

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter((exp) => exp.id !== id));
  };

  const updateBullet = (expId: string, bIndex: number, text: string) => {
    setExperiences(
      experiences.map((exp) => {
        if (exp.id !== expId) return exp;
        const newBullets = [...exp.bullets];
        newBullets[bIndex] = text;
        return { ...exp, bullets: newBullets };
      })
    );
  };

  const addBullet = (expId: string) => {
    setExperiences(
      experiences.map((exp) => {
        if (exp.id !== expId) return exp;
        return { ...exp, bullets: [...exp.bullets, ''] };
      })
    );
  };

  const removeBullet = (expId: string, bIndex: number) => {
    setExperiences(
      experiences.map((exp) => {
        if (exp.id !== expId) return exp;
        return { ...exp, bullets: exp.bullets.filter((_, i) => i !== bIndex) };
      })
    );
  };

  // Education handlers
  const addEducation = () => {
    setEducations([
      ...educations,
      {
        id: Date.now().toString(),
        school: '',
        degree: '',
        location: '',
        year: '',
      },
    ]);
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    setEducations(educations.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)));
  };

  const removeEducation = (id: string) => {
    setEducations(educations.filter((edu) => edu.id !== id));
  };

  // Project handlers
  const addProject = () => {
    setProjects([
      ...projects,
      {
        id: Date.now().toString(),
        title: '',
        technologies: '',
        link: '',
        description: '',
      },
    ]);
  };

  const updateProject = (id: string, field: keyof Project, value: any) => {
    setProjects(projects.map((proj) => (proj.id === id ? { ...proj, [field]: value } : proj)));
  };

  const removeProject = (id: string) => {
    setProjects(projects.filter((proj) => proj.id !== id));
  };

  // Pre-fill Sample Data
  const handleLoadSample = () => {
    setFullName('Sarah Jenkins');
    setTitle('Lead Frontend Engineer & UI Architect');
    setEmail('sarah.j@example.com');
    setPhone('+1 (555) 789-0123');
    setLocation('Austin, TX');
    setLinkedin('linkedin.com/in/sarahjenkins');
    setGithub('github.com/sarahjenkins');
    setSummary(
      'Senior UI Architect with 7+ years developing accessible web platforms and design systems. Track record of improving Core Web Vitals to 98+ across multi-tenant SaaS applications.'
    );
  };

  // PDF Compilation
  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter',
    });

    const margin = 42;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margin * 2;
    let y = 46;

    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > pageHeight - 40) {
        doc.addPage();
        y = 46;
      }
    };

    // Header Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(20, 20, 20);
    doc.text(fullName || 'Your Name', margin, y);
    y += 16;

    if (title.trim()) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(70, 70, 70);
      doc.text(title, margin, y);
      y += 14;
    }

    // Contact info line
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    const contactParts = [email, phone, location, linkedin, github].filter(Boolean);
    doc.text(contactParts.join('   |   '), margin, y);
    y += 14;

    // Horizontal Accent Line
    const [r, g, b] = accentColor === '#1e3a8a' ? [30, 58, 138] : [15, 23, 42];
    doc.setDrawColor(r, g, b);
    doc.setLineWidth(1.5);
    doc.line(margin, y, margin + contentWidth, y);
    y += 18;

    // Helper to render section headings
    const renderSectionHeader = (headingText: string) => {
      checkPageBreak(30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(r, g, b);
      doc.text(headingText.toUpperCase(), margin, y);
      y += 4;
      doc.setDrawColor(210, 210, 210);
      doc.setLineWidth(0.75);
      doc.line(margin, y, margin + contentWidth, y);
      y += 14;
    };

    // Summary
    if (summary.trim()) {
      renderSectionHeader('Professional Summary');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(50, 50, 50);
      const splitSummary = doc.splitTextToSize(summary, contentWidth);
      checkPageBreak(splitSummary.length * 12 + 6);
      doc.text(splitSummary, margin, y);
      y += splitSummary.length * 12 + 10;
    }

    // Experience
    if (experiences.some((e) => e.company || e.role)) {
      renderSectionHeader('Work Experience');

      experiences.forEach((exp) => {
        if (!exp.company && !exp.role) return;
        checkPageBreak(40);

        // Role & Tenure
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 30, 30);
        doc.text(exp.role || 'Role', margin, y);

        const tenure = [exp.startDate, exp.endDate].filter(Boolean).join(' – ');
        if (tenure) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(90, 90, 90);
          doc.text(tenure, margin + contentWidth, y, { align: 'right' });
        }
        y += 12;

        // Company & Location
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9.5);
        doc.setTextColor(60, 60, 60);
        const compLine = [exp.company, exp.location].filter(Boolean).join(', ');
        doc.text(compLine, margin, y);
        y += 12;

        // Bullets
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(50, 50, 50);

        exp.bullets.forEach((bullet) => {
          if (!bullet.trim()) return;
          const splitBullet = doc.splitTextToSize(bullet, contentWidth - 14);
          checkPageBreak(splitBullet.length * 11 + 4);
          doc.text('•', margin + 2, y);
          doc.text(splitBullet, margin + 12, y);
          y += splitBullet.length * 11 + 3;
        });
        y += 6;
      });
    }

    // Projects
    if (projects.some((p) => p.title)) {
      renderSectionHeader('Technical Projects');
      projects.forEach((proj) => {
        if (!proj.title) return;
        checkPageBreak(30);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 30, 30);
        doc.text(proj.title, margin, y);

        if (proj.technologies) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8.5);
          doc.setTextColor(90, 90, 90);
          doc.text(` (${proj.technologies})`, margin + doc.getTextWidth(proj.title) + 4, y);
        }
        y += 11;

        if (proj.description) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(50, 50, 50);
          const splitProjDesc = doc.splitTextToSize(proj.description, contentWidth);
          checkPageBreak(splitProjDesc.length * 11);
          doc.text(splitProjDesc, margin, y);
          y += splitProjDesc.length * 11 + 6;
        }
      });
    }

    // Education
    if (educations.some((e) => e.school || e.degree)) {
      renderSectionHeader('Education');
      educations.forEach((edu) => {
        if (!edu.school && !edu.degree) return;
        checkPageBreak(25);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 30, 30);
        doc.text(edu.degree || 'Degree', margin, y);

        if (edu.year) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(90, 90, 90);
          doc.text(edu.year, margin + contentWidth, y, { align: 'right' });
        }
        y += 12;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(70, 70, 70);
        const schoolLine = [edu.school, edu.location, edu.gpa ? `GPA: ${edu.gpa}` : ''].filter(Boolean).join('  ·  ');
        doc.text(schoolLine, margin, y);
        y += 14;
      });
    }

    // Technical Skills
    if (skillsLanguages || skillsFrameworks || skillsTools) {
      renderSectionHeader('Technical Competencies');
      doc.setFontSize(9);

      if (skillsLanguages.trim()) {
        checkPageBreak(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 40);
        doc.text('Languages:', margin, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        doc.text(skillsLanguages, margin + 70, y);
        y += 13;
      }

      if (skillsFrameworks.trim()) {
        checkPageBreak(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 40);
        doc.text('Frameworks:', margin, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        doc.text(skillsFrameworks, margin + 70, y);
        y += 13;
      }

      if (skillsTools.trim()) {
        checkPageBreak(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 40);
        doc.text('Tools & Cloud:', margin, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        doc.text(skillsTools, margin + 70, y);
        y += 13;
      }
    }

    const cleanName = (fullName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'ats_resume') + '.pdf';
    doc.save(cleanName);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Editor Column */}
      <div className="space-y-6">
        {/* Quick Toolbar */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Quick Actions:</span>
            <button
              type="button"
              onClick={handleLoadSample}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Load UI Architect Sample
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Accent:</span>
            {[
              { color: '#1e3a8a', label: 'Navy' },
              { color: '#0f172a', label: 'Black' },
              { color: '#065f46', label: 'Emerald' },
            ].map((acc) => (
              <button
                key={acc.color}
                type="button"
                onClick={() => setAccentColor(acc.color)}
                className={`w-5 h-5 rounded-full border ${
                  accentColor === acc.color ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{ backgroundColor: acc.color }}
                aria-label={acc.label}
              />
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <Card className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Candidate Information</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <Input label="Professional Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
            <Input label="LinkedIn" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
            <Input label="GitHub / Portfolio" value={github} onChange={(e) => setGithub(e.target.value)} />
          </div>
          <Textarea
            label="Executive Summary"
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </Card>

        {/* Work Experience */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Work Experience (Chronological)
            </h2>
            <Button size="sm" variant="outline" onClick={addExperience} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Position
            </Button>
          </div>

          <div className="space-y-4">
            {experiences.map((exp, idx) => (
              <div
                key={exp.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Position #{idx + 1}</span>
                  {experiences.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExperience(exp.id)}
                      className="p-1 text-rose-500 hover:text-rose-700"
                      aria-label="Remove experience"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Input
                    label="Role / Title"
                    value={exp.role}
                    onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                    placeholder="e.g. Lead Software Engineer"
                  />
                  <Input
                    label="Company / Employer"
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                    placeholder="e.g. Stripe"
                  />
                  <Input
                    label="Start Date"
                    value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                    placeholder="e.g. 2021"
                  />
                  <Input
                    label="End Date"
                    value={exp.endDate}
                    onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                    placeholder="e.g. Present"
                  />
                </div>

                {/* Bullets */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-semibold">Accomplishment Bullets (Quantified Metrics)</span>
                    <button
                      type="button"
                      onClick={() => addBullet(exp.id)}
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      + Add Bullet
                    </button>
                  </div>
                  {exp.bullets.map((bText, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2">
                      <span className="text-slate-400 mt-2 text-xs">•</span>
                      <textarea
                        rows={2}
                        value={bText}
                        onChange={(e) => updateBullet(exp.id, bIdx, e.target.value)}
                        className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Action verb + Context + Measurable outcome (% or $)..."
                      />
                      {exp.bullets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBullet(exp.id, bIdx)}
                          className="text-slate-400 hover:text-rose-500 p-1 mt-1"
                          aria-label="Remove bullet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Technical Projects */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Technical Projects
            </h2>
            <Button size="sm" variant="outline" onClick={addProject} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Project
            </Button>
          </div>

          <div className="space-y-3">
            {projects.map((proj, idx) => (
              <div
                key={proj.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Project #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeProject(proj.id)}
                    className="p-1 text-rose-500 hover:text-rose-700"
                    aria-label="Remove project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    label="Project Title"
                    value={proj.title}
                    onChange={(e) => updateProject(proj.id, 'title', e.target.value)}
                    placeholder="e.g. Distributed Cache"
                  />
                  <Input
                    label="Technologies Used"
                    value={proj.technologies}
                    onChange={(e) => updateProject(proj.id, 'technologies', e.target.value)}
                    placeholder="e.g. Rust, WebAssembly"
                  />
                </div>
                <Textarea
                  label="Project Description & Impact"
                  rows={2}
                  value={proj.description}
                  onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Education & Skills */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Education
            </h2>
            <Button size="sm" variant="outline" onClick={addEducation} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Degree
            </Button>
          </div>

          {educations.map((edu, idx) => (
            <div
              key={edu.id}
              className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500">Education #{idx + 1}</span>
                {educations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEducation(edu.id)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                    aria-label="Remove education"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input
                  label="Degree / Major"
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                />
                <Input
                  label="School / University"
                  value={edu.school}
                  onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                />
                <Input
                  label="Graduation Year"
                  value={edu.year}
                  onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                />
              </div>
            </div>
          ))}

          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Categorized Technical Competencies
            </h3>
            <Input
              label="Programming Languages"
              value={skillsLanguages}
              onChange={(e) => setSkillsLanguages(e.target.value)}
            />
            <Input
              label="Frameworks & Libraries"
              value={skillsFrameworks}
              onChange={(e) => setSkillsFrameworks(e.target.value)}
            />
            <Input
              label="Developer Tools, Cloud & Databases"
              value={skillsTools}
              onChange={(e) => setSkillsTools(e.target.value)}
            />
          </div>
        </Card>
      </div>

      {/* Live Preview Column */}
      <div className="lg:sticky lg:top-24 space-y-4">
        <div className="flex items-center justify-between pb-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              ATS Single-Column Preview
            </h2>
            <span className="text-[11px] text-slate-500">Standard single-column hierarchy</span>
          </div>
          <Button onClick={generatePDF} leftIcon={<Download className="w-4 h-4" />}>
            Download PDF
          </Button>
        </div>

        {/* Paper Document */}
        <div className="bg-white text-slate-900 p-8 rounded-xl shadow-xl border border-slate-200 text-left font-sans text-xs leading-relaxed space-y-4 min-h-[640px]">
          {/* Header */}
          <div className="border-b-2 pb-3" style={{ borderColor: accentColor }}>
            <h3 className="text-2xl font-black tracking-tight text-slate-900">{fullName || 'Your Name'}</h3>
            {title && <p className="text-xs font-medium text-slate-600 mt-0.5">{title}</p>}
            <p className="text-[11px] text-slate-500 mt-1.5 space-x-2">
              {[email, phone, location, linkedin, github].filter(Boolean).map((item, idx) => (
                <span key={idx}>
                  {idx > 0 && <span className="mx-1 text-slate-400">|</span>}
                  {item}
                </span>
              ))}
            </p>
          </div>

          {/* Summary */}
          {summary && (
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 pb-1 mb-1.5" style={{ color: accentColor }}>
                Professional Summary
              </h4>
              <p className="text-slate-700 text-[10.5px] leading-relaxed">{summary}</p>
            </div>
          )}

          {/* Experience */}
          {experiences.some((e) => e.company || e.role) && (
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 pb-1 mb-2" style={{ color: accentColor }}>
                Work Experience
              </h4>
              <div className="space-y-3">
                {experiences.map(
                  (exp) =>
                    (exp.company || exp.role) && (
                      <div key={exp.id} className="space-y-1">
                        <div className="flex justify-between items-baseline font-bold text-slate-900 text-[11px]">
                          <span>{exp.role || 'Role'}</span>
                          <span className="font-normal text-slate-500 text-[10px]">
                            {[exp.startDate, exp.endDate].filter(Boolean).join(' – ')}
                          </span>
                        </div>
                        <div className="text-[10px] italic text-slate-600">{exp.company}</div>
                        <ul className="space-y-0.5 mt-1">
                          {exp.bullets.map(
                            (b, i) =>
                              b.trim() && (
                                <li key={i} className="text-slate-700 text-[10px] flex items-start gap-1.5 leading-normal">
                                  <span className="text-slate-400">•</span>
                                  <span>{b}</span>
                                </li>
                              )
                          )}
                        </ul>
                      </div>
                    )
                )}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects.some((p) => p.title) && (
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 pb-1 mb-2" style={{ color: accentColor }}>
                Technical Projects
              </h4>
              <div className="space-y-2">
                {projects.map(
                  (proj) =>
                    proj.title && (
                      <div key={proj.id} className="text-[10.5px]">
                        <span className="font-bold text-slate-900">{proj.title}</span>
                        {proj.technologies && <span className="text-slate-500 italic text-[10px]"> ({proj.technologies})</span>}
                        {proj.description && <p className="text-slate-700 text-[10px] mt-0.5">{proj.description}</p>}
                      </div>
                    )
                )}
              </div>
            </div>
          )}

          {/* Education */}
          {educations.some((e) => e.school || e.degree) && (
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 pb-1 mb-2" style={{ color: accentColor }}>
                Education
              </h4>
              <div className="space-y-1.5">
                {educations.map(
                  (edu) =>
                    (edu.school || edu.degree) && (
                      <div key={edu.id} className="flex justify-between items-baseline text-[10.5px]">
                        <div>
                          <span className="font-bold text-slate-900">{edu.degree}</span>
                          <span className="text-slate-600 block text-[10px]">
                            {[edu.school, edu.location, edu.gpa ? `GPA: ${edu.gpa}` : ''].filter(Boolean).join(' · ')}
                          </span>
                        </div>
                        <span className="text-slate-500 text-[10px]">{edu.year}</span>
                      </div>
                    )
                )}
              </div>
            </div>
          )}

          {/* Skills */}
          {(skillsLanguages || skillsFrameworks || skillsTools) && (
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 pb-1 mb-1.5" style={{ color: accentColor }}>
                Technical Skills
              </h4>
              <div className="text-[10px] space-y-1">
                {skillsLanguages && (
                  <p>
                    <strong className="text-slate-900">Languages:</strong> {skillsLanguages}
                  </p>
                )}
                {skillsFrameworks && (
                  <p>
                    <strong className="text-slate-900">Frameworks:</strong> {skillsFrameworks}
                  </p>
                )}
                {skillsTools && (
                  <p>
                    <strong className="text-slate-900">Tools & Cloud:</strong> {skillsTools}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
