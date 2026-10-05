# Architectural & Implementation Decisions

This document records the architectural decisions, external library selections, SEO strategies, and design patterns established while building **DigitalTools** (https://digitaltools.dev).

---

## 1. Framework & Routing Architecture
- **Framework Choice**: Next.js App Router (latest stable) with React 19 and TypeScript in strict mode.
- **SSR & Metadata Indexability**: The previous single-page app used hash-based routing (`/#/tool`), preventing search engines from indexing individual tools. In this complete rebuild:
  - Every tool has its own dedicated, server-rendered URL at `/tools/[slug]`.
  - Every tool page includes server-rendered breadcrumbs, H1, editorial intro, 3 how-to steps, rich technical guides (250–400 words), and 3–5 FAQs.
  - Category pages live at `/category/[slug]`.
  - Every tool card on the homepage and category pages is rendered as a native semantic Next.js `<Link>` anchor tag (never buttons with `onClick`).

## 2. Server vs. Client Component Separation
- **Page Components (`app/tools/[slug]/page.tsx`, `app/category/[slug]/page.tsx`, `app/page.tsx`)**: Maintained strictly as Server Components. This guarantees that HTML contains complete text, JSON-LD structured data, metadata tags, and semantic headers upon initial response.
- **Tool Interactive Components (`components/tools/<slug>.tsx`)**: Marked with `'use client'`. They interact with DOM/browser APIs (Canvas, MediaRecorder, Web Crypto, FileReader) only after hydration.
- **Dynamic Registry (`components/tools/registry.tsx`)**: Uses `next/dynamic` with `ssr: false` and minimal fallbacks for client-heavy utilities (jsPDF, audio visualizers, and barcode renderers) to avoid hydration mismatches and minimize initial bundle size.

## 3. External Dependencies & Rationales
Per the project rules, third-party libraries are used only where custom implementations are unsafe or unreasonable:
1. **`jspdf` (v4.x)**: Used for client-side vector PDF generation in `resume-builder`, `invoice-generator`, and `document-to-pdf-maker`. Selected because hand-writing a raw binary PDF compiler with font glyph tables and cross-reference streams in browser JavaScript is error-prone.
2. **`qrcode` (v1.x)**: Used in `qr-code-generator` for calculating standard Reed-Solomon error correction matrices and rendering scannable 2D matrices into Canvas and SVG.
3. **`jsbarcode` (v3.x)**: Used in `barcode-generator` for standard linear symbologies (Code 128, EAN-13, UPC-A, Code 39, ITF) with modulo checksum verification.
4. **`lucide-react`**: Lightweight, tree-shakeable icons for clean UI affordances and accessible buttons.
5. **No External Library for Cryptography**: Native W3C Web Cryptography API (`window.crypto.getRandomValues` and `window.crypto.subtle.digest`) is used directly for hardware-backed CSPRNG password generation and SHA-256/512 hashing. A clean RFC 1321 algorithmic function is used for legacy MD5 checksums.

## 4. Theme & Visual Constitution
- **Default Theme**: Dark theme enabled by default (`<html lang="en" className="dark">`), paired with an accessible Light Mode toggle (`components/ui/ThemeToggle.tsx`). The user's preference is persisted in `localStorage('dt_theme')`.
- **Anti-AI Slop & Zero-Pill Discipline**: Metadata is presented as quiet typography separated by middle dots (`·`) instead of colored capsule pills. Clean typography pairings (Inter and JetBrains Mono) and WCAG AA compliant contrast ratios are enforced across all components.

## 5. Universal Translator Route & Privacy Disclosure
- **Translation Route (`app/api/translate/route.ts`)**: In compliance with the prompt's instructions, translation is executed via an API route calling a configured LibreTranslate-compatible endpoint via `TRANSLATION_API_URL` and `TRANSLATION_API_KEY`.
- **Honesty Rule**: The tool page and Privacy Policy explicitly state that translation text is sent through our API route to an external translation provider, while the other 25 tools operate 100% in local browser memory with zero network uploads.

## 6. Financial Estimator Disclaimers & PKR Angle
- **Loan EMI Calculator**: Features a dedicated Pakistani Rupee (PKR) loan preset (5,000,000 PKR at 16% markup for 5 years = ~121,570 PKR/month).
- **Disclaimer**: Every calculation includes an explicit disclaimer stating that figures are mathematical estimates for planning purposes and do not represent formal bank contracts.
