#!/usr/bin/env python3
"""Generate a full niqqud edition of the supplied Hebrew book using Dicta Nakdan.

The source file is preserved separately. This script only adds vowel marks; it
does not silently repair OCR or rewrite the source text.
"""
from __future__ import annotations

import concurrent.futures
import json
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "data" / "book-source.txt"
OUTPUT_TEXT = ROOT / "data" / "book-with-niqqud.txt"
OUTPUT_JSON = ROOT / "data" / "book-with-niqqud.json"
OUTPUT_META = ROOT / "data" / "niqqud-metadata.json"
ENDPOINT = "https://nakdan-2-0.loadbalancer.dicta.org.il/api"
MAX_CHARS = 10_000
WORKERS = 3

CHAPTERS = [
    {"number": 1, "title": "פנדמוניום", "rawHeading": "פנז־מוניו■□", "part": "שער ראשון", "partSubtitle": "ירידה בדרך האופל", "start": '"אתה צוחק עלי," אמר הסלקטור'},
    {"number": 2, "title": "סודות ושקרים", "rawHeading": "סודות ושקרים", "start": "נסיך האופל ישב רכוב על סוסו השחור"},
    {"number": 3, "title": "צייד הצללים", "rawHeading": "צייד הצללים", "start": "כשהגיעו לגיאווה גיונס"},
    {"number": 4, "title": "טורפן", "rawHeading": "טורפן", "start": "הלילה התחמם עוד יותר"},
    {"number": 5, "title": "ברית ומסדר", "rawHeading": "ברית ומסדר", "start": '"אתה חושב שהיא אי-פעם תתעורר?'},
    {"number": 6, "title": "הדלת במימד החמישי", "rawHeading": "הדלת במימד החמישי", "start": "נראה שדירתה של מאדאם דורותיאה"},
    {"number": 7, "title": "הנשק הנבחר", "rawHeading": "הנשק הנבחר", "start": "היא היתה מופתעת מכדי לצעוק"},
    {"number": 8, "title": "החוג והאחים", "rawHeading": "החוג והאחים", "start": "קליירי פסעה קדימה כדי לגעת בזרועו של גיייס"},
    {"number": 9, "title": "עיר של עצמות", "rawHeading": "עיר של עצמות", "part": "שער שני", "partSubtitle": "קלה היא הירידה", "start": "בחדר השתררה שתיקת תדהמה"},
    {"number": 10, "title": "מגנוס ביין", "rawHeading": "מגננס גיין", "start": "גיייס רכן קדימה והלם באגרופו על המחיצה"},
    {"number": 11, "title": "מסיבה למתים", "rawHeading": "מסיבה למתים", "start": "ההוראות שעל ההזמנה הובילו אותם לאזור תעשייה בברוקלין"},
    {"number": 12, "title": "זיכרון של לובן", "rawHeading": "זיכרון של לובן", "start": '"אמא שלי עשתה לי את זה?"'},
    {"number": 13, "title": "מלון המוות", "rawHeading": "מלון המוות", "start": "בלילה נראתה הכנסייה ברחוב דיאמונד כמו מחזה רפאים"},
    {"number": 14, "title": "על הגובה", "rawHeading": "על הגובה", "start": "הזאבים כרעו אל הקרקע בנהמות איום"},
    {"number": 15, "title": "מלאכים נופלים", "rawHeading": "מלאכים נופלים", "start": "הודג' רתח מזעם"},
    {"number": 16, "title": "פרח חצות", "rawHeading": "פרח חצות", "start": "באור החלקי נראו החדרים הגדולים והריקים"},
    {"number": 17, "title": "גביע התמותה", "rawHeading": "גביע התמותה", "start": "גיייס שכב על המיטה והעמיד פני ישן"},
    {"number": 18, "title": "אבדון", "rawHeading": "אבדון", "start": "קליירי לא ידעה למה בעצם היא ציפתה"},
    {"number": 19, "title": "בסמטת העכברושים", "rawHeading": "בסמטת העכברושים", "start": "הודג' המתנשף בהה בגבו המתרחק של ולנטיין"},
    {"number": 20, "title": "מפלתו של רנוויק", "rawHeading": "מפולתו של ר־נוויק", "part": "שער שלישי", "partSubtitle": "הירידה מפתה", "start": "כשלוק סיים את דבריו"},
    {"number": 21, "title": "ולנטיין", "rawHeading": "ולנטיין", "start": '"אני רואה שהפרעתי באמצע משהו," אמר ולנטיין'},
    {"number": None, "title": "אחרית דבר", "rawHeading": "אחרית דבר", "part": "אחרית דבר", "partSubtitle": "העלייה מפתה", "start": "מסדרון בית החולים היה לבן ומסנוור"},
]

HEBREW_RE = re.compile(r"[\u05D0-\u05EA]")
NIQQUD_RE = re.compile(r"[\u05B0-\u05C7]")


def request_nakdan(text: str) -> str:
    if not HEBREW_RE.search(text):
        return text

    payload = {
        "data": text,
        "task": "nakdan",
        "genre": "modern",
        "keepmetagim": False,
        "keepqq": False,
        "matchpartial": True,
        "nodageshdefmem": False,
        "patachma": False,
        "addmorph": True,
    }
    last_error = None
    for attempt in range(6):
        try:
            response = requests.post(
                ENDPOINT,
                data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
                headers={"content-type": "text/plain;charset=UTF-8"},
                timeout=(20, 150),
            )
            if response.status_code in (429, 500, 502, 503, 504):
                raise requests.HTTPError(f"Retryable status {response.status_code}")
            response.raise_for_status()
            tokens = response.json()
            if not isinstance(tokens, list):
                raise ValueError("Unexpected Dicta response: expected a token list")

            output = []
            for token in tokens:
                options = token.get("options") or []
                chosen = None
                if options:
                    first = options[0]
                    if isinstance(first, list) and first:
                        chosen = first[0]
                    elif isinstance(first, dict):
                        chosen = first.get("w") or first.get("word")
                    elif isinstance(first, str):
                        chosen = first
                if chosen is None:
                    chosen = token.get("word", "")
                output.append(str(chosen).replace("|", "").replace("\u05BD", ""))
            return "".join(output)
        except Exception as exc:
            last_error = exc
            if attempt == 5:
                break
            time.sleep(min(4 * (attempt + 1), 20))
    raise RuntimeError(f"Dicta request failed after retries: {last_error}")


def chunk_text(text: str, limit: int = MAX_CHARS) -> list[str]:
    lines = text.splitlines(keepends=True)
    chunks, current, size = [], [], 0
    for line in lines:
        if current and size + len(line) > limit:
            chunks.append("".join(current))
            current, size = [], 0
        current.append(line)
        size += len(line)
    if current:
        chunks.append("".join(current))
    return chunks


def vocalize_all(text: str) -> tuple[str, int]:
    chunks = chunk_text(text)
    results: list[str | None] = [None] * len(chunks)
    print(f"Vocalizing {len(chunks)} chunks ({len(text):,} characters) with {WORKERS} workers.", flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futures = {pool.submit(request_nakdan, chunk): i for i, chunk in enumerate(chunks)}
        done = 0
        for future in concurrent.futures.as_completed(futures):
            i = futures[future]
            results[i] = future.result()
            done += 1
            print(f"Completed {done}/{len(chunks)} chunks", flush=True)
    output = "".join(part or "" for part in results)
    if output.count("\n") != text.count("\n"):
        raise RuntimeError(
            "Dicta changed line breaks; refusing to build a chapter mapping with shifted paragraphs "
            f"(source={text.count(chr(10))}, output={output.count(chr(10))})."
        )
    return output, len(chunks)


def locate_chapters(original_lines: list[str]) -> list[dict]:
    located = []
    for meta in CHAPTERS:
        start_index = next(
            (i for i, line in enumerate(original_lines) if line.strip().startswith(meta["start"])),
            -1,
        )
        if start_index < 0:
            raise RuntimeError(f"Could not locate chapter start: {meta['start']}")
        heading_index = start_index
        for i in range(start_index - 1, max(-1, start_index - 16), -1):
            if original_lines[i].strip() == meta["rawHeading"]:
                heading_index = i
                break
        located.append({**meta, "startIndex": start_index, "headingIndex": heading_index})
    return located


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Missing source file: {SOURCE}")

    original = SOURCE.read_text(encoding="utf-8").replace("\r", "")
    original_lines = original.split("\n")
    vowelized, chunk_count = vocalize_all(original)

    vowelized_lines = vowelized.split("\n")
    if len(vowelized_lines) != len(original_lines):
        raise RuntimeError("Line count mismatch after vocalization.")

    letters_before = len(HEBREW_RE.findall(original))
    letters_after = len(HEBREW_RE.findall(vowelized))
    marks_after = len(NIQQUD_RE.findall(vowelized))
    if marks_after < 25_000:
        raise RuntimeError(f"Too few niqqud marks detected ({marks_after}); refusing to publish a partial result.")
    if letters_after < letters_before * 0.80:
        raise RuntimeError(f"Too much source text appears to be missing ({letters_before} -> {letters_after} Hebrew letters).")

    located = locate_chapters(original_lines)
    meta_values = ["עיר של עצמות", "קסנדרה קלייר"]
    for chapter in CHAPTERS:
        meta_values.append(chapter["title"])
        if chapter.get("part"):
            meta_values.append(chapter["part"])
        if chapter.get("partSubtitle"):
            meta_values.append(chapter["partSubtitle"])
    meta_vowelized, _ = vocalize_all("\n".join(meta_values))
    meta_lines = meta_vowelized.split("\n")
    if len(meta_lines) != len(meta_values):
        meta_lines = [request_nakdan(value) for value in meta_values]
    meta_iter = iter(meta_lines)
    book_title = next(meta_iter)
    author = next(meta_iter)
    dotted_meta = []
    for chapter in CHAPTERS:
        item = {
            "number": chapter["number"],
            "title": next(meta_iter),
            "slug": f"chapter-{chapter['number']}" if chapter["number"] else "epilogue",
            "part": None,
            "partSubtitle": None,
        }
        if chapter.get("part"):
            item["part"] = next(meta_iter)
        if chapter.get("partSubtitle"):
            item["partSubtitle"] = next(meta_iter)
        dotted_meta.append(item)

    chapters = []
    for index, meta in enumerate(located):
        end_index = located[index + 1]["headingIndex"] if index + 1 < len(located) else len(vowelized_lines)
        paragraphs = [line.strip() for line in vowelized_lines[meta["startIndex"]:end_index] if line.strip()]
        chapters.append({**dotted_meta[index], "paragraphs": paragraphs})

    front_matter = [line.strip() for line in vowelized_lines[:located[0]["headingIndex"]] if line.strip()]
    book = {
        "title": book_title,
        "author": author,
        "frontMatter": front_matter,
        "chapters": chapters,
        "metadata": {
            "sourceFile": "עיר של עצמות.txt",
            "vocalizer": "Dicta Nakdan API",
            "genre": "modern",
            "chapterCount": len(chapters),
            "paragraphCount": sum(len(c["paragraphs"]) for c in chapters),
            "sourceCharacters": len(original),
            "vowelizedCharacters": len(vowelized),
            "niqqudMarkCount": marks_after,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "note": "Automatic vocalization. Original OCR spelling and wording were not editorially corrected."
        }
    }

    OUTPUT_TEXT.write_text(vowelized, encoding="utf-8")
    OUTPUT_JSON.write_text(json.dumps(book, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUTPUT_META.write_text(json.dumps(book["metadata"], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(json.dumps(book["metadata"], ensure_ascii=False, indent=2), flush=True)


if __name__ == "__main__":
    main()
