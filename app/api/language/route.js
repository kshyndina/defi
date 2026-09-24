import { generateText } from 'ai';

export const maxDuration = 20;

async function dictaNiqqud(text) {
  const response = await fetch('https://nakdan-2-0.loadbalancer.dicta.org.il/api', {
    method: 'POST',
    headers: { 'content-type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify({
      data: text,
      task: 'nakdan',
      genre: 'modern',
      keepmetagim: false,
      keepqq: false,
      matchpartial: true,
      nodageshdefmem: false,
      patachma: false,
      addmorph: true
    }),
    cache: 'no-store'
  });
  if (!response.ok) throw new Error('Niqqud service failed');
  const data = await response.json();
  if (typeof data === 'string') return data;
  if (!Array.isArray(data)) throw new Error('Unexpected niqqud response');

  return data.map(item => {
    const option = item?.options?.[0]?.[0];
    if (option) return String(option).replaceAll('|','').replaceAll('\u05BD','');
    return item?.word ?? '';
  }).join('');
}

function transliterate(hebrew) {
  const chars = Array.from(hebrew.normalize('NFD'));
  const consonants = {
    'א':'','ב':'v','ג':'g','ד':'d','ה':'h','ו':'v','ז':'z','ח':'kh','ט':'t','י':'y',
    'כ':'kh','ך':'kh','ל':'l','מ':'m','ם':'m','נ':'n','ן':'n','ס':'s','ע':'',
    'פ':'f','ף':'f','צ':'ts','ץ':'ts','ק':'k','ר':'r','ש':'sh','ת':'t'
  };
  const vowel = {
    '\u05B0':'e','\u05B1':'e','\u05B2':'a','\u05B3':'o','\u05B4':'i',
    '\u05B5':'e','\u05B6':'e','\u05B7':'a','\u05B8':'a','\u05B9':'o',
    '\u05BA':'o','\u05BB':'u','\u05C7':'o'
  };
  let out='';
  for (let i=0;i<chars.length;i++) {
    const ch=chars[i];
    if (!consonants.hasOwnProperty(ch)) {
      if (vowel[ch]) out+=vowel[ch];
      else if (!/[\u0591-\u05C7]/.test(ch)) out+=ch;
      continue;
    }
    const marks=[];
    let j=i+1;
    while(j<chars.length && /[\u0591-\u05C7]/.test(chars[j])) { marks.push(chars[j]); j++; }
    i=j-1;
    const hasDagesh=marks.includes('\u05BC');
    const shinDot=marks.includes('\u05C1');
    const sinDot=marks.includes('\u05C2');
    const holam=marks.includes('\u05B9')||marks.includes('\u05BA');
    const shuruk=marks.includes('\u05BC') && ch==='ו' && !marks.some(m=>vowel[m]);

    if (ch==='ו' && shuruk) {
      out+='u';
    } else if (ch==='ו' && holam) {
      out+='o';
    } else {
      let c=consonants[ch];
      if (ch==='ב') c=hasDagesh?'b':'v';
      if (ch==='כ'||ch==='ך') c=hasDagesh?'k':'kh';
      if (ch==='פ'||ch==='ף') c=hasDagesh?'p':'f';
      if (ch==='ש') c=sinDot?'s':'sh';
      out+=c;
      for (const m of marks) if (vowel[m]) out+=vowel[m];
    }
  }
  return out.replace(/\s+/g,' ').trim();
}

const AI_TASKS = {
  wordTranslation: `Translate the supplied Hebrew word into concise natural English using the supplied sentence context to choose the meaning. Return ONLY the English meaning; include at most two short senses if genuinely ambiguous.`,
  paragraphTranslation: `Translate the supplied Hebrew paragraph faithfully into natural English. Preserve the meaning, tone, names, and paragraph structure. Do not summarize or explain. Return ONLY the translation.`
};

export async function POST(request) {
  try {
    const body = await request.json();
    const mode = body?.mode;
    const text = String(body?.text || '').trim();
    const context = String(body?.context || '').trim();

    if (!text || text.length > 5000 || context.length > 8000) {
      return Response.json({ error: 'Invalid text' }, { status: 400 });
    }

    if (mode === 'niqqud') {
      return Response.json({ result: await dictaNiqqud(text) });
    }

    if (mode === 'wordTransliteration' || mode === 'paragraphTransliteration') {
      const dotted = await dictaNiqqud(text);
      return Response.json({ result: transliterate(dotted) });
    }

    if (!AI_TASKS[mode]) {
      return Response.json({ error: 'Unsupported mode' }, { status: 400 });
    }

    const prompt = [
      AI_TASKS[mode],
      context && mode === 'wordTranslation' ? `\nSentence context:\n${context}` : '',
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
    const message = String(error?.message || error || '');
    if (message.includes('credit card') || message.includes('customer_verification_required')) {
      return Response.json({ error: 'Translation is not enabled on this Vercel account yet.' }, { status: 503 });
    }
    return Response.json({ error: 'Language helper is temporarily unavailable.' }, { status: 500 });
  }
}
