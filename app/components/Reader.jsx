'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const HEBREW_WORD = /([\u0590-\u05FF]+(?:[׳״'\-־][\u0590-\u05FF]+)*)/g;
const IS_HEBREW_WORD = /^[\u0590-\u05FF]+(?:[׳״'\-־][\u0590-\u05FF]+)*$/;
const stripNiqqud = (s) => s.normalize('NFD').replace(/[\u0591-\u05C7]/g, '').normalize('NFC');
const cacheKey = (mode, text) => `hebrew-reader:v3:${mode}:${stripNiqqud(text)}`;

async function language(mode, text, context='') {
  const key = cacheKey(mode, text);
  try {
    const cached = localStorage.getItem(key);
    if (cached) return cached;
  } catch {}
  const res = await fetch('/api/language', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ mode, text, context })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  try { localStorage.setItem(key, data.result); } catch {}
  return data.result;
}

function WordPopover({ selection, onClose }) {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState('');
  if (!selection) return null;
  const run = async (mode) => {
    setLoading(mode); setResult('');
    try { setResult(await language(mode, selection.word, selection.context)); }
    catch { setResult('Couldn’t load this right now.'); }
    finally { setLoading(''); }
  };
  const left=Math.max(12, Math.min(selection.x-145, window.innerWidth-302));
  const top=Math.min(selection.y+14, window.innerHeight-190);
  return <>
    <button className="popover-scrim" aria-label="Close" onClick={onClose}/>
    <div className="word-popover" style={{left, top}} dir="ltr">
      <div className="popover-word" dir="rtl">{selection.word}</div>
      <div className="popover-actions">
        <button onClick={()=>run('wordTransliteration')} disabled={!!loading}>{loading==='wordTransliteration'?'…':'Transliteration'}</button>
        <button onClick={()=>run('wordTranslation')} disabled={!!loading}>{loading==='wordTranslation'?'…':'Translation'}</button>
      </div>
      {result && <div className="popover-result">{result}</div>}
    </div>
  </>;
}

function Paragraph({ text, fontScale, fontFamily, onWord }) {
  const ref=useRef(null);
  const [display,setDisplay]=useState(text);
  const [assist,setAssist]=useState({mode:null,text:'',loading:false});
  useEffect(()=>{
    let dead=false; const node=ref.current; if(!node) return;
    const obs=new IntersectionObserver(async entries=>{
      if(!entries.some(e=>e.isIntersecting)) return;
      obs.disconnect();
      try { const v=await language('niqqud', text); if(!dead && v) setDisplay(v); } catch {}
    },{rootMargin:'420px 0px'});
    obs.observe(node); return ()=>{dead=true;obs.disconnect()};
  },[text]);
  const parts=useMemo(()=>display.split(HEBREW_WORD),[display]);
  const run=async mode=>{
    if(assist.mode===mode && assist.text){setAssist({mode:null,text:'',loading:false});return;}
    setAssist({mode,text:'',loading:true});
    try { setAssist({mode,text:await language(mode,text),loading:false}); }
    catch { setAssist({mode,text:'Couldn’t load this right now.',loading:false}); }
  };
  return <article className="paragraph" ref={ref} style={{'--reader-scale':fontScale,'--reader-font':fontFamily}}>
    <p className="hebrew-text">{parts.map((p,i)=>IS_HEBREW_WORD.test(p)?<button key={i} className="word" onClick={e=>onWord({word:p,context:text,x:e.clientX,y:e.clientY})}>{p}</button>:<span key={i}>{p}</span>)}</p>
    <div className="paragraph-tools" dir="ltr">
      <button onClick={()=>run('paragraphTransliteration')}>Aa&nbsp; {assist.loading&&assist.mode==='paragraphTransliteration'?'…':'Transliteration'}</button>
      <button onClick={()=>run('paragraphTranslation')}>文&nbsp; {assist.loading&&assist.mode==='paragraphTranslation'?'…':'Translation'}</button>
    </div>
    {assist.text && <div className={`assist ${assist.mode==='paragraphTranslation'?'translation':''}`} dir="ltr">{assist.text}</div>}
  </article>
}

export default function Reader({ book }) {
  const [chapterIndex,setChapterIndex]=useState(0);
  const [selection,setSelection]=useState(null);
  const [sidebar,setSidebar]=useState(false);
  const [fontScale,setFontScale]=useState(1);
  const [fontFamily,setFontFamily]=useState("var(--font-book)");
  const [dark,setDark]=useState(false);
  const chapter=book.chapters[chapterIndex];
  useEffect(()=>{
    const saved=Number(localStorage.getItem('hebrew-reader:chapter'));
    if(Number.isInteger(saved)&&saved>=0&&saved<book.chapters.length) setChapterIndex(saved);
    setDark(localStorage.getItem('hebrew-reader:dark')==='1');
    const savedScale=Number(localStorage.getItem('hebrew-reader:fontScale'));
    if(savedScale>=.8&&savedScale<=1.4) setFontScale(savedScale);
    const savedFont=localStorage.getItem('hebrew-reader:fontFamily');
    if(savedFont) setFontFamily(savedFont);
  },[book.chapters.length]);
  useEffect(()=>{ localStorage.setItem('hebrew-reader:chapter',String(chapterIndex)); window.scrollTo({top:0,behavior:'smooth'}); setSelection(null); },[chapterIndex]);
  useEffect(()=>{ document.documentElement.dataset.theme=dark?'dark':'light'; localStorage.setItem('hebrew-reader:dark',dark?'1':'0'); },[dark]);
  useEffect(()=>{ localStorage.setItem('hebrew-reader:fontScale',String(fontScale)); },[fontScale]);
  useEffect(()=>{ localStorage.setItem('hebrew-reader:fontFamily',fontFamily); },[fontFamily]);
  const progress=Math.round(((chapterIndex+1)/book.chapters.length)*100);
  return <main className="reader-shell">
    <header className="topbar" dir="ltr">
      <button className="icon-btn mobile-only" onClick={()=>setSidebar(true)} aria-label="Chapters">☰</button>
      <div className="book-id"><strong dir="rtl">{book.title}</strong><span>{book.author}</span></div>
      <div className="reader-controls">
        <span className="niqqud-badge" title="Full niqqud is on">נִקּוּד ✓</span>
        <label className="control-select">
          <span>Size</span>
          <select value={fontScale} onChange={e=>setFontScale(Number(e.target.value))} aria-label="Text size">
            <option value=".88">S</option>
            <option value="1">M</option>
            <option value="1.12">L</option>
            <option value="1.26">XL</option>
          </select>
        </label>
        <label className="control-select">
          <span>Font</span>
          <select value={fontFamily} onChange={e=>setFontFamily(e.target.value)} aria-label="Reading font">
            <option value="var(--font-book)">Book</option>
            <option value="var(--font-clean)">Clean</option>
            <option value="var(--font-classic)">Classic</option>
          </select>
        </label>
        <button onClick={()=>setDark(v=>!v)} aria-label="Theme">{dark?'☀︎':'☾'}</button>
      </div>
    </header>
    <div className="progress"><i style={{width:`${progress}%`}}/></div>
    <aside className={`sidebar ${sidebar?'open':''}`} dir="rtl">
      <div className="sidebar-head"><span>תוכן העניינים</span><button className="mobile-only" onClick={()=>setSidebar(false)}>×</button></div>
      <nav>{book.chapters.map((c,i)=><button key={c.slug} className={i===chapterIndex?'active':''} onClick={()=>{setChapterIndex(i);setSidebar(false)}}><small>{c.number?String(c.number).padStart(2,'0'):'—'}</small><span>{c.title}</span></button>)}</nav>
    </aside>
    {sidebar&&<button className="sidebar-scrim mobile-only" onClick={()=>setSidebar(false)}/>}
    <section className="reading-column" dir="rtl">
      <div className="chapter-kicker">{chapter.part || (chapter.number?`פרק ${chapter.number}`:'אחרית דבר')}</div>
      <h1>{chapter.title}</h1>
      {chapter.partSubtitle && chapter.part && chapter.number!==1 && <div className="part-subtitle">{chapter.partSubtitle}</div>}
      <div className="rule"/>
      {chapter.paragraphs.map((p,i)=><Paragraph key={`${chapter.slug}-${i}`} text={p} fontScale={fontScale} fontFamily={fontFamily} onWord={setSelection}/>)}
      <footer className="chapter-nav" dir="ltr">
        <button disabled={chapterIndex===0} onClick={()=>setChapterIndex(i=>i-1)}>← Previous</button>
        <span>{chapterIndex+1} / {book.chapters.length}</span>
        <button disabled={chapterIndex===book.chapters.length-1} onClick={()=>setChapterIndex(i=>i+1)}>Next →</button>
      </footer>
    </section>
    <WordPopover selection={selection} onClose={()=>setSelection(null)}/>
  </main>;
}
