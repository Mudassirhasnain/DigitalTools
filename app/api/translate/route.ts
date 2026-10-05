import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, source = 'auto', target = 'es' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
    }

    const apiUrl = process.env.TRANSLATION_API_URL;
    const apiKey = process.env.TRANSLATION_API_KEY || '';

    // If LibreTranslate endpoint is configured and not default unauthenticated, attempt it
    if (apiUrl && !apiUrl.includes('terraprint.co')) {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: text,
            source: source === 'auto' ? 'auto' : source,
            target,
            format: 'text',
            api_key: apiKey,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.translatedText || data.translation) {
            return NextResponse.json({
              translatedText: data.translatedText || data.translation,
              detectedLanguage: data.detectedLanguage,
              provider: 'LibreTranslate',
            });
          }
        }
      } catch (err) {
        console.warn('LibreTranslate endpoint failed, trying Gemini API fallback', err);
      }
    }

    // Server-side fallback using Gemini API if key is present
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `You are a professional universal translator.
Translate the following input text accurately into target language "${target}".
Input language code: "${source}".
Rules:
- Provide ONLY the direct translated text.
- Do NOT add quotes, greetings, explanations, notes, or prefixes.
- Preserve original punctuation, formatting, and line breaks.

Text to translate:
${text}`;

        const aiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        const translatedText = aiResponse.text?.trim();
        if (translatedText) {
          return NextResponse.json({
            translatedText,
            provider: 'Google AI Translation Engine',
          });
        }
      } catch (aiError: any) {
        console.warn('Gemini translation error:', aiError);
      }
    }

    // If both failed or unavailable, return informative status
    return NextResponse.json(
      {
        error: 'No active translation endpoint responded.',
        details: 'Configure TRANSLATION_API_URL or provide GEMINI_API_KEY in server environment.',
      },
      { status: 503 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Translation request failed',
        message: error?.message || 'Server network error',
      },
      { status: 500 }
    );
  }
}
