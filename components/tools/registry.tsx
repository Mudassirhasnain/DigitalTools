'use client';

import React from 'react';
import { ResumeBuilder } from './resume-builder';
import { CoverLetterGenerator } from './cover-letter-generator';
import { UniversalTranslator } from './universal-translator';
import { TextManipulationSuite } from './text-manipulation-suite';
import { LoremIpsumGenerator } from './lorem-ipsum-generator';
import { MarkdownPreviewer } from './markdown-previewer';
import { DocumentToPdfMaker } from './document-to-pdf-maker';
import { ImageFormatConverter } from './image-format-converter';
import { ImageResizerCompressor } from './image-resizer-compressor';
import { PhotoExifRemover } from './photo-exif-remover';
import { Base64ImageConverter } from './base64-image-converter';
import { LoanEmiCalculator } from './loan-emi-calculator';
import { InvoiceGenerator } from './invoice-generator';
import { PercentageDiscountCalculator } from './percentage-discount-calculator';
import { ExactAgeCalculator } from './exact-age-calculator';
import { TypingSpeedTest } from './typing-speed-test';
import { VoiceAudioRecorder } from './voice-audio-recorder';
import { DigitalSignatureGenerator } from './digital-signature-generator';
import { UnitConverter } from './unit-converter';
import { UnixTimestampConverter } from './unix-timestamp-converter';
import { ColorConverterContrastChecker } from './color-converter-contrast-checker';
import { JsonFormatterValidator } from './json-formatter-validator';
import { QrCodeGenerator } from './qr-code-generator';
import { BarcodeGenerator } from './barcode-generator';
import { SecurePasswordGenerator } from './secure-password-generator';
import { CryptographicHashGenerator } from './cryptographic-hash-generator';

export const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
  'resume-builder': ResumeBuilder,
  'cover-letter-generator': CoverLetterGenerator,
  'universal-translator': UniversalTranslator,
  'text-manipulation-suite': TextManipulationSuite,
  'lorem-ipsum-generator': LoremIpsumGenerator,
  'markdown-previewer': MarkdownPreviewer,
  'document-to-pdf-maker': DocumentToPdfMaker,
  'image-format-converter': ImageFormatConverter,
  'image-resizer-compressor': ImageResizerCompressor,
  'photo-exif-remover': PhotoExifRemover,
  'base64-image-converter': Base64ImageConverter,
  'loan-emi-calculator': LoanEmiCalculator,
  'invoice-generator': InvoiceGenerator,
  'percentage-discount-calculator': PercentageDiscountCalculator,
  'exact-age-calculator': ExactAgeCalculator,
  'typing-speed-test': TypingSpeedTest,
  'voice-audio-recorder': VoiceAudioRecorder,
  'digital-signature-generator': DigitalSignatureGenerator,
  'unit-converter': UnitConverter,
  'unix-timestamp-converter': UnixTimestampConverter,
  'color-converter-contrast-checker': ColorConverterContrastChecker,
  'json-formatter-validator': JsonFormatterValidator,
  'qr-code-generator': QrCodeGenerator,
  'barcode-generator': BarcodeGenerator,
  'secure-password-generator': SecurePasswordGenerator,
  'cryptographic-hash-generator': CryptographicHashGenerator,
};

export function ToolRenderer({ slug }: { slug: string }) {
  const Comp = TOOL_COMPONENTS[slug];
  if (!Comp) {
    return (
      <div className="p-8 text-center text-slate-400">
        Tool component not found for slug &quot;{slug}&quot;.
      </div>
    );
  }
  return <Comp />;
}
