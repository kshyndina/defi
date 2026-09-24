import { generateText } from 'ai';

export const maxDuration = 20;

const TASKS = {
  niqqud: `Add full standard Modern Hebrew niqqud to the supplied Hebrew text. Preserve every original word, name, punctuation mark, sentence boundary, and word order exactly. Do NOT silently correct OCR errors or spelling. If an item is too corrupted to vowelize confidently, leave that item unchanged. Return ONLY the vowelized source text, with no commentary.`,
  wordTransliteration: `Transliterate the supplied Hebrew word into clear Latin letters for a Hebrew learner. Use modern Israeli pronunciation and mark the stressed syllable with an acute accent where helpful. Return ONLY the transliteration.`,
  wordTranslation: `Translate the supplied Hebrew word into concise natural English using the supplied sentence context to choose the meaning. Return ONLY the English meaning; include at most two short senses if genuinely ambiguous.`,
  paragraphTransliteration: `Transliterate the supplied Hebrew paragraph into readable Latin letters for a Hebrew learner. Follow modern Israeli pronunciation, preserve sentence punctuation, and mark lexical stress with acute accents where useful. Return ONLY the transliteration.`,
  paragraphTranslation: `Translate the supplied Hebrew paragraph faithfully into natural English. Preserve the meaning, tone, names, and paragraph structure. Do not summarize or explain. Return ONLY the translation.`
};

export async function POST(request) {
  try {
    const body = await request.json();
    const mode = body?.mode;
    const text = String(body?.text || '').trim();
    const context = String(body?.context || '').trim();

    if (!TASKS[mode]) {
      return Response.json({ error: 'Unsupported mode' }, { status: 400 });
    }
    if (!text || text.length > 5000 || context.length > 8000) {
      return Response.json({ error: 'Invalid text' }, { status: 400 });
    }

    const prompt = [
      TASKS[mode],
      context && mode.startsWith('word') ? `\nSentence context:\n${context}` : '',
      `\nSource:\n${text}`
    ].join('');

    const { text: result } = await generateText({
      model: 'google/gemini-3.6-flash',
      prompt,
      maxOutputTokens: 6000,
      providerOptions: {
        gateway: {
          disallowPromptTraining: true,
          tags: ['feature:hebrew-reader']
        }
      }
    });

    return Response.json({ result: result.trim() });
  } catch (error) {
    console.error('language route failed', error);
    return Response.json({ error: 'Language helper is temporarily unavailable.' }, { status: 500 });
  }
}
