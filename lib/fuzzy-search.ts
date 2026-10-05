import { Tool } from './tools';

export interface SearchMatch {
  tool: Tool;
  score: number;
}

// Synonyms, aliases, and acronyms for developer tools
const ALIAS_MAP: Record<string, string[]> = {
  'resume-builder': ['ats', 'cv', 'job', 'curriculum', 'career', 'work', 'pdf'],
  'cover-letter-generator': ['job application', 'letter', 'career', 'graduate', 'hiring'],
  'universal-translator': ['translate', 'translation', 'language', 'spanish', 'french', 'german', 'multilingual', 'dictionary'],
  'text-manipulation-suite': ['case', 'uppercase', 'lowercase', 'slug', 'casing', 'string', 'regex', 'dedupe', 'sort', 'encode', 'ciphers'],
  'lorem-ipsum-generator': ['placeholder', 'dummy text', 'filler', 'mock', 'latin', 'sentences', 'paragraphs'],
  'markdown-previewer': ['md', 'gfm', 'github', 'table', 'editor', 'preview', 'readme'],
  'document-to-pdf-maker': ['pdf', 'doc', 'contract', 'print', 'agreement', 'document'],
  'image-format-converter': ['png', 'jpg', 'jpeg', 'webp', 'avif', 'convert', 'picture', 'photo'],
  'image-resizer-compressor': ['resize', 'compress', 'scale', 'dimensions', 'crop', 'instagram', 'youtube', 'social', 'pixels'],
  'photo-exif-remover': ['exif', 'metadata', 'gps', 'privacy', 'strip', 'camera', 'location', 'sanitize'],
  'base64-image-converter': ['base64', 'data uri', 'encode', 'decode', 'image to text', 'raw'],
  'loan-emi-calculator': ['emi', 'loan', 'mortgage', 'interest', 'pkr', 'payment', 'finance', 'amortization'],
  'invoice-generator': ['invoice', 'bill', 'receipt', 'freelancer', 'billing', 'pdf', 'crypto'],
  'percentage-discount-calculator': ['percent', 'discount', 'sale', 'tax', 'vat', 'margin', 'tip', 'markup'],
  'exact-age-calculator': ['age', 'birthday', 'chronological', 'zodiac', 'days', 'years', 'lunar'],
  'typing-speed-test': ['wpm', 'typing', 'speed', 'keystrokes', 'words per minute', 'keyboard', 'accuracy'],
  'voice-audio-recorder': ['voice', 'audio', 'mic', 'microphone', 'record', 'sound', 'wav', 'webm'],
  'digital-signature-generator': ['signature', 'sign', 'draw', 'transparent', 'png', 'autograph'],
  'unit-converter': ['unit', 'metric', 'imperial', 'length', 'weight', 'temperature', 'distance', 'storage', 'converter'],
  'unix-timestamp-converter': ['unix', 'timestamp', 'epoch', 'time', 'date', 'utc', 'seconds'],
  'color-converter-contrast-checker': ['color', 'contrast', 'hex', 'rgb', 'hsl', 'wcag', 'palette', 'accessibility'],
  'json-formatter-validator': ['json', 'format', 'validator', 'lint', 'minify', 'prettify', 'tree', 'yaml', 'xml'],
  'qr-code-generator': ['qr', 'qrcode', 'barcode', 'scan', 'wifi', 'vcard', 'matrix'],
  'barcode-generator': ['barcode', 'code128', 'ean13', 'upc', 'isbn', 'scanner'],
  'secure-password-generator': ['password', 'passcode', 'pin', 'random', 'security', 'crypto', 'generator', 'passphrase'],
  'cryptographic-hash-generator': ['hash', 'sha256', 'md5', 'sha512', 'hmac', 'checksum', 'digest', 'crypto'],
};

/**
 * Fuzzy subsequence score calculation:
 * Returns score > 0 if pattern is a subsequence of target, higher score for closer/consecutive matches
 */
function fuzzySubsequenceScore(pattern: string, target: string): number {
  const p = pattern.toLowerCase();
  const t = target.toLowerCase();

  let pIdx = 0;
  let tIdx = 0;
  let score = 0;
  let consecutiveMatches = 0;

  while (pIdx < p.length && tIdx < t.length) {
    if (p[pIdx] === t[tIdx]) {
      score += 5 + consecutiveMatches * 3;
      consecutiveMatches++;
      pIdx++;
    } else {
      consecutiveMatches = 0;
    }
    tIdx++;
  }

  // Did we match the full pattern?
  if (pIdx === p.length) {
    return score;
  }
  return 0;
}

/**
 * Real-time fuzzy search function across tools
 */
export function searchTools(tools: Tool[], query: string, categoryFilter: string = 'all'): Tool[] {
  const cleanQuery = query.trim().toLowerCase();

  // Filter by category first if specified
  const baseTools =
    categoryFilter === 'all'
      ? tools
      : tools.filter((t) => t.categorySlug.toLowerCase() === categoryFilter.toLowerCase());

  if (!cleanQuery) {
    return baseTools;
  }

  const tokens = cleanQuery.split(/\s+/).filter(Boolean);

  const scoredMatches: SearchMatch[] = [];

  for (const tool of baseTools) {
    let toolScore = 0;
    const nameLower = tool.name.toLowerCase();
    const slugLower = tool.slug.toLowerCase();
    const catLower = tool.category.toLowerCase();
    const phraseLower = tool.primaryPhrase.toLowerCase();
    const introLower = tool.intro.toLowerCase();
    const aliases = ALIAS_MAP[tool.slug] || [];

    // Check exact matches
    if (nameLower === cleanQuery || slugLower === cleanQuery) {
      toolScore += 200;
    } else if (nameLower.startsWith(cleanQuery)) {
      toolScore += 120;
    } else if (nameLower.includes(cleanQuery)) {
      toolScore += 80;
    }

    // Check aliases/acronyms
    for (const alias of aliases) {
      if (alias === cleanQuery) {
        toolScore += 90;
      } else if (alias.includes(cleanQuery)) {
        toolScore += 50;
      }
    }

    // Check tokens
    let allTokensMatched = true;
    for (const token of tokens) {
      let tokenScore = 0;

      if (nameLower.includes(token)) {
        tokenScore += 30;
      } else if (slugLower.includes(token)) {
        tokenScore += 25;
      } else if (phraseLower.includes(token)) {
        tokenScore += 20;
      } else if (catLower.includes(token)) {
        tokenScore += 15;
      } else if (introLower.includes(token)) {
        tokenScore += 10;
      } else if (aliases.some((a) => a.includes(token))) {
        tokenScore += 25;
      } else {
        // Try fuzzy subsequence on name
        const subScore = fuzzySubsequenceScore(token, nameLower);
        if (subScore > 0) {
          tokenScore += subScore;
        } else {
          allTokensMatched = false;
        }
      }

      toolScore += tokenScore;
    }

    // If query is longer than 2 characters and token didn't match cleanly,
    // also check fuzzy distance on the whole phrase
    if (!allTokensMatched && cleanQuery.length >= 3) {
      const wholeFuzzy = fuzzySubsequenceScore(cleanQuery, nameLower);
      if (wholeFuzzy > 15) {
        toolScore += wholeFuzzy;
        allTokensMatched = true;
      }
    }

    if (allTokensMatched && toolScore > 0) {
      scoredMatches.push({ tool, score: toolScore });
    }
  }

  // Sort descending by score
  return scoredMatches.sort((a, b) => b.score - a.score).map((m) => m.tool);
}
