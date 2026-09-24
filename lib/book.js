import fs from 'node:fs';
import path from 'node:path';

let cached;

const chapterMap = [
  { number: 1, title: 'פנדמוניום', rawHeading: 'פנז־מוניו■□', part: 'שער ראשון', partSubtitle: 'ירידה בדרך האופל', start: '"אתה צוחק עלי," אמר הסלקטור' },
  { number: 2, title: 'סודות ושקרים', rawHeading: 'סודות ושקרים', start: 'נסיך האופל ישב רכוב על סוסו השחור' },
  { number: 3, title: 'צייד הצללים', rawHeading: 'צייד הצללים', start: 'כשהגיעו לגיאווה גיונס' },
  { number: 4, title: 'טורפן', rawHeading: 'טורפן', start: 'הלילה התחמם עוד יותר' },
  { number: 5, title: 'ברית ומסדר', rawHeading: 'ברית ומסדר', start: '"אתה חושב שהיא אי-פעם תתעורר?' },
  { number: 6, title: 'הדלת במימד החמישי', rawHeading: 'הדלת במימד החמישי', start: 'נראה שדירתה של מאדאם דורותיאה' },
  { number: 7, title: 'הנשק הנבחר', rawHeading: 'הנשק הנבחר', start: 'היא היתה מופתעת מכדי לצעוק' },
  { number: 8, title: 'החוג והאחים', rawHeading: 'החוג והאחים', start: 'קליירי פסעה קדימה כדי לגעת בזרועו של גיייס' },
  { number: 9, title: 'עיר של עצמות', rawHeading: 'עיר של עצמות', part: 'שער שני', partSubtitle: 'קלה היא הירידה', start: 'בחדר השתררה שתיקת תדהמה' },
  { number: 10, title: 'מגנוס ביין', rawHeading: 'מגננס גיין', start: 'גיייס רכן קדימה והלם באגרופו על המחיצה' },
  { number: 11, title: 'מסיבה למתים', rawHeading: 'מסיבה למתים', start: 'ההוראות שעל ההזמנה הובילו אותם לאזור תעשייה בברוקלין' },
  { number: 12, title: 'זיכרון של לובן', rawHeading: 'זיכרון של לובן', start: '"אמא שלי עשתה לי את זה?"' },
  { number: 13, title: 'מלון המוות', rawHeading: 'מלון המוות', start: 'בלילה נראתה הכנסייה ברחוב דיאמונד כמו מחזה רפאים' },
  { number: 14, title: 'על הגובה', rawHeading: 'על הגובה', start: 'הזאבים כרעו אל הקרקע בנהמות איום' },
  { number: 15, title: 'מלאכים נופלים', rawHeading: 'מלאכים נופלים', start: "הודג' רתח מזעם" },
  { number: 16, title: 'פרח חצות', rawHeading: 'פרח חצות', start: 'באור החלקי נראו החדרים הגדולים והריקים' },
  { number: 17, title: 'גביע התמותה', rawHeading: 'גביע התמותה', start: 'גיייס שכב על המיטה והעמיד פני ישן' },
  { number: 18, title: 'אבדון', rawHeading: 'אבדון', start: 'קליירי לא ידעה למה בעצם היא ציפתה' },
  { number: 19, title: 'בסמטת העכברושים', rawHeading: 'בסמטת העכברושים', start: "הודג' המתנשף בהה בגבו המתרחק של ולנטיין" },
  { number: 20, title: 'מפלתו של רנוויק', rawHeading: 'מפולתו של ר־נוויק', part: 'שער שלישי', partSubtitle: 'הירידה מפתה', start: 'כשלוק סיים את דבריו' },
  { number: 21, title: 'ולנטיין', rawHeading: 'ולנטיין', start: '"אני רואה שהפרעתי באמצע משהו," אמר ולנטיין' },
  { number: null, title: 'אחרית דבר', rawHeading: 'אחרית דבר', part: 'אחרית דבר', partSubtitle: 'העלייה מפתה', start: 'מסדרון בית החולים היה לבן ומסנוור' }
];

function findStart(lines, prefix) {
  const index = lines.findIndex(line => line.trim().startsWith(prefix));
  if (index < 0) throw new Error(`Could not locate chapter start: ${prefix}`);
  return index;
}

function findHeadingBefore(lines, startIndex, rawHeading) {
  for (let i = startIndex - 1; i >= Math.max(0, startIndex - 16); i--) {
    if (lines[i].trim() === rawHeading) return i;
  }
  return startIndex;
}

export function getBook() {
  if (cached) return cached;

  const source = fs.readFileSync(path.join(process.cwd(), 'data', 'book-source.txt'), 'utf8');
  const lines = source.replace(/\r/g, '').split('\n');

  const located = chapterMap.map(meta => {
    const startIndex = findStart(lines, meta.start);
    return { ...meta, startIndex, headingIndex: findHeadingBefore(lines, startIndex, meta.rawHeading) };
  });

  const chapters = located.map((meta, index) => {
    const endIndex = index + 1 < located.length ? located[index + 1].headingIndex : lines.length;
    const paragraphs = lines
      .slice(meta.startIndex, endIndex)
      .map(line => line.trim())
      .filter(Boolean);

    return {
      number: meta.number,
      title: meta.title,
      slug: meta.number ? `chapter-${meta.number}` : 'epilogue',
      part: meta.part || null,
      partSubtitle: meta.partSubtitle || null,
      paragraphs
    };
  });

  cached = {
    title: 'עיר של עצמות',
    author: 'קסנדרה קלייר',
    chapters
  };

  return cached;
}
