export interface Category {
  slug: string;
  name: string;
  description: string;
  count: number;
}

export const CATEGORIES: Category[] = [
  {
    slug: 'career',
    name: 'Career',
    description: 'ATS-friendly resume builders and targeted cover letter generators designed for modern job seekers and graduates.',
    count: 2,
  },
  {
    slug: 'text-and-languages',
    name: 'Text and Languages',
    description: 'Transform, translate, format, and generate textual content with client-first formatting suites and markdown editors.',
    count: 5,
  },
  {
    slug: 'documents-and-images',
    name: 'Documents and Images',
    description: 'Convert file formats, compress media, strip EXIF metadata, and compile clean PDFs completely within your browser.',
    count: 6,
  },
  {
    slug: 'finance-and-productivity',
    name: 'Finance and Productivity',
    description: 'Calculate loans, generate invoices, track typing speed, record voice notes, and sign documents securely.',
    count: 7,
  },
  {
    slug: 'conversion',
    name: 'Conversion',
    description: 'Accurate unit conversion, Unix epoch time translation, and WCAG-compliant color contrast analyzers.',
    count: 5,
  },
  {
    slug: 'developer-and-security',
    name: 'Developer and Security',
    description: 'Cryptographic hashing, password generation, JSON syntax validation, and barcode & QR code generation.',
    count: 5,
  },
  {
    slug: 'everyday-tools',
    name: 'Everyday Tools',
    description: 'Date and week calculators, timers, clocks, a BMI calculator, random number generators, and a wheel spinner for quick daily decisions.',
    count: 8,
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.slug === slug);
}
