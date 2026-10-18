(() => {
const $ = s => document.querySelector(s);
const KEY = 'pomodoro-settings-v1', STATS = 'pomodoro-stats-v1', HIST = 'pomodoro-hist-v1', TASK = 'pomodoro-task-v1', RUN = 'pomodoro-run-v1';
const MIN = 60000, DAY = 86400000;
const LABEL = { focus:'Focus', short:'Pause courte', long:'Pause longue' };

const DEFAULTS = {
  focus:25, short:5, long:15, cycles:4, goal:8, dayStart:4,
  autoBreak:true, autoFocus:false, autoDelay:0,
  bell:'mecanique', volume:70, bellRepeat:1, startSound:true, warn:0, tick:false, tickVol:30,
  ambient:'aucune', ambVol:50, ambBreaks:false,
  theme:'auto', customAccent:false, accent:'#ff5a3c', font:'grotesque', dialScale:'classique', size:100,
  showSeconds:true, showLabels:true, gloss:true, halo:true, grain:true,
  name:'', quotes:true, zen:true, showTask:true, showDots:true, showStats:true, streak:true,
  motion:'complete', digitAnim:true, particles:true, particleCount:90, shake:true, breathe:true,
  blackout:true, fadeDur:30, wakeFor:5, waves:true, relight:true,
  notify:false, vibrate:true, wakeLock:false, tabTitle:true
};

const PRESETS = [
  { id:'classique', name:'Classique', d:'Le pomodoro d’origine', focus:25, short:5, long:15, cycles:4 },
  { id:'sprint', name:'Sprint', d:'Pour démarrer en douceur', focus:15, short:3, long:10, cycles:4 },
  { id:'deep', name:'Deep work', d:'Longues plongées', focus:50, short:10, long:30, cycles:3 },
  { id:'5217', name:'52 / 17', d:'Le rythme des plus productifs', focus:52, short:17, long:30, cycles:3 },
  { id:'ultradien', name:'Ultradien', d:'Calé sur ton horloge interne', focus:90, short:20, long:30, cycles:2 }
];

const THEMES = {
  tomate:{
    focus:{bg:'#D5382B', onBg:'#FFF1EC', face:'#FFF1EC', ink:'#4A120C', accent:'#D5382B', stem:'#2F7A36'},
    short:{bg:'#3D8B4E', onBg:'#F0FAEF', face:'#F0FAEF', ink:'#123D1C', accent:'#3D8B4E', stem:'#1E5C2A'},
    long: {bg:'#4E3A78', onBg:'#F2EEFB', face:'#F2EEFB', ink:'#261A42', accent:'#4E3A78', stem:'#2F7A36'}
  },
  minuit:{ dark:true,
    focus:{bg:'#12162A', onBg:'#E8EBFF', face:'#1D2340', ink:'#E8EBFF', accent:'#FF6A55', stem:'#4CC47A'},
    short:{bg:'#0F201C', onBg:'#E3F7EE', face:'#17302A', ink:'#E3F7EE', accent:'#4CD69A', stem:'#4CC47A'},
    long: {bg:'#1B1330', onBg:'#EFE7FF', face:'#271C45', ink:'#EFE7FF', accent:'#B690FF', stem:'#4CC47A'}
  },
  papier:{
    focus:{bg:'#E3E6EA', onBg:'#1C2230', face:'#FFFFFF', ink:'#1C2230', accent:'#E0452F', stem:'#2E8A55'},
    short:{bg:'#DDE8E2', onBg:'#16261E', face:'#FFFFFF', ink:'#16261E', accent:'#2E9E6A', stem:'#2E8A55'},
    long: {bg:'#E2E0EE', onBg:'#1E1B33', face:'#FFFFFF', ink:'#1E1B33', accent:'#5B55C9', stem:'#2E8A55'}
  },
  agrume:{
    focus:{bg:'#F08A24', onBg:'#2B1604', face:'#FFF6E3', ink:'#3A1F05', accent:'#E4572E', stem:'#4F8A1B'},
    short:{bg:'#8CC63F', onBg:'#1C2A07', face:'#FBFFEE', ink:'#233508', accent:'#4F8A1B', stem:'#3A6B12'},
    long: {bg:'#23B5AE', onBg:'#062623', face:'#EEFFFD', ink:'#07302C', accent:'#0F7C77', stem:'#4F8A1B'}
  },
  sakura:{
    focus:{bg:'#E46F86', onBg:'#FFF3F5', face:'#FFF3F5', ink:'#5A1626', accent:'#D94464', stem:'#3E8A4E'},
    short:{bg:'#5FAE96', onBg:'#F1FBF7', face:'#F1FBF7', ink:'#123A2E', accent:'#3E9A7E', stem:'#2F7A56'},
    long: {bg:'#8D7BC9', onBg:'#F5F2FF', face:'#F5F2FF', ink:'#2A2050', accent:'#6E5BB8', stem:'#3E8A4E'}
  },
  espresso:{ dark:true,
    focus:{bg:'#1E1612', onBg:'#F3E6D8', face:'#2B201A', ink:'#F3E6D8', accent:'#E08A4F', stem:'#7FB069'},
    short:{bg:'#14201A', onBg:'#E4F2E6', face:'#1F2E26', ink:'#E4F2E6', accent:'#7FCB8F', stem:'#7FB069'},
    long: {bg:'#1B1824', onBg:'#ECE6F7', face:'#282335', ink:'#ECE6F7', accent:'#B79CEB', stem:'#7FB069'}
  }
};
const FONTS = {
  grotesque:'"Bricolage Grotesque", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  serif:'"Fraunces", Georgia, "Times New Roman", serif',
  machine:'"Space Mono", ui-monospace, Menlo, Consolas, monospace'
};

// ---------- textes ----------
const QUOTES = [
  'Une session à la fois.', 'Le plus dur, c’est de lancer le minuteur.', 'Pas besoin de motivation, juste de commencer.',
  'Ferme les onglets inutiles, et c’est parti.', 'Petit pas après petit pas, grande journée.', 'Téléphone retourné, esprit tranquille.',
  'Fais-le mal, mais fais-le. Tu peaufineras après.', 'Ton futur toi te remercie déjà.', 'Un seul truc à la fois, c’est tout le secret.',
  'Respire, choisis une tâche, tourne le cadran.', 'Commence par le plus petit morceau.', 'Tu n’as pas à tout finir, juste cette session.'
];
const BREAK_TIPS = [
  'Lève-toi et étire-toi un peu.', 'Bois un grand verre d’eau.', 'Regarde au loin, tes yeux vont adorer.', 'Ouvre la fenêtre, prends l’air.',
  'Pas d’écran pendant la pause, promis ?', 'Roule des épaules, détends ta nuque.', 'Marche un peu, même jusqu’à la cuisine.'
];
const LONG_TIPS = ['Grande pause méritée, va faire un tour.', 'Mange un morceau, tu l’as bien gagné.', 'Sors prendre l’air, ton cerveau recharge.', 'Déconnecte vraiment, tout sera encore là après.'];
const FOCUS_DONE = ['Bien joué{n} !', 'Et une session de plus !', 'Magnifique{n} !', 'Session bouclée !', 'Tu gères{n} !', 'Dans la boîte{n} !'];
const BREAK_DONE = ['C’est reparti{n} !', 'En piste{n} !', 'On y retourne ?', 'Pause finie, à toi de jouer !'];
const pick = a => a[Math.floor(Math.random() * a.length)];
const withName = s => s.replace('{n}', S.name.trim() ? ' ' + S.name.trim() : '');

// ---------- stockage ----------
function store(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
function read(k){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; }catch(e){ return null; } }
const saved = read(KEY);
let S = Object.assign({}, DEFAULTS, saved || {});
if(!saved && window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) S.motion = 'reduite';
const save = () => store(KEY, S);

// La journée commence à S.dayStart heures : une session à 1 h du matin compte pour la veille.
const pad = n => String(n).padStart(2, '0');
const keyOf = d => d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate());
const dayKey = ts => keyOf(new Date(ts - S.dayStart * 3600000));
const today = () => dayKey(Date.now());
const dateOf = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d, 12); }; // midi : pas de piège au changement d'heure
const prevKey = k => { const d = dateOf(k); d.setDate(d.getDate() - 1); return keyOf(d); };

// Historique : un compteur par jour, plus le journal des sessions (avec la tâche).
let hist = read(HIST);
if(!hist || typeof hist !== 'object' || !hist.days || !Array.isArray(hist.log)) hist = { days:{}, log:[] };
const oldStats = read(STATS); // stats de l'ancienne version, juste le jour en cours
if(oldStats && oldStats.date && oldStats.sessions && !hist.days[oldStats.date]) hist.days[oldStats.date] = { s:oldStats.sessions, m:oldStats.minutes || 0 };
try{ localStorage.removeItem(STATS); }catch(e){}
const saveHist = () => store(HIST, hist);
saveHist();
const dayOf = k => hist.days[k] || { s:0, m:0 };
function record(minutes, task){
  const k = today(), d = hist.days[k] || (hist.days[k] = { s:0, m:0 });
  d.s++; d.m += minutes;
  hist.log.push({ t:Date.now(), m:minutes, task:task || '' });
  if(hist.log.length > 300) hist.log = hist.log.slice(-300);
  saveHist();
}
function streak(){
  let k = today(), n = 0;
  if(!dayOf(k).s) k = prevKey(k); // aujourd'hui pas encore commencé : la série tient toujours
  while(dayOf(k).s > 0){ n++; k = prevKey(k); }
  return n;
}
const totalSessions = () => Object.values(hist.days).reduce((a, d) => a + (d.s || 0), 0);
const savedRun = read(RUN); // lu avant le premier affichage, qui réécrit RUN

// ---------- état ----------
const durOf = m => S[m] * MIN;
const spanFor = totalMin => S.dialScale === 'adaptee' ? Math.max(1, Math.round(totalMin)) : (totalMin <= 60 ? 60 : 120);
const st = { mode:'focus', running:false, total:durOf('focus'), remaining:durOf('focus'), endAt:0, cycle:0,
  span:spanFor(S.focus), dispRot:0, dragging:false, lastSec:-1, lastStr:'', completing:false, autoAt:0, quote:pick(QUOTES) };

const dial = $('#dial'), wrap = $('#dialWrap'), scaleG = $('#scale'), arc = $('#arc');
const digitsEl = $('#digits'), subEl = $('#sub'), readout = $('#readout'), taskEl = $('#task');
const CIRC = 2 * Math.PI * 128;
const NS = 'http://www.w3.org/2000/svg', C = 200;

function el(tag, attrs){ const e = document.createElementNS(NS, tag); for(const k in attrs) e.setAttribute(k, attrs[k]); return e; }
function polar(r, a){ const rad = (a - 90) * Math.PI / 180; return [+(C + r*Math.cos(rad)).toFixed(2), +(C + r*Math.sin(rad)).toFixed(2)]; }
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);

// sépales de la tomate = aiguille
(function(){
  let d = ''; const cx = 200, cy = -2;
  for(let i = 0; i < 10; i++){
    const a = Math.PI/2 + i*Math.PI/5, r = i % 2 ? 7 : 22;
    d += (i ? 'L' : 'M') + (cx + r*Math.cos(a)).toFixed(1) + ' ' + (cy + r*Math.sin(a)).toFixed(1);
  }
  $('#sepals').setAttribute('d', d + 'Z');
  const rg = $('#ridges');
  for(let i = 0; i < 40; i++){
    const a = i * 9; const [x1,y1] = polar(92, a), [x2,y2] = polar(100, a);
    rg.appendChild(el('line', {x1, y1, x2, y2, class:'ridge'}));
  }
  const [gx, gy] = polar(78, 0);
  rg.appendChild(el('circle', {cx:gx, cy:gy, r:5, class:'grip'}));
})();

function buildScale(){
  const span = st.span, g = $('#ticks'); g.innerHTML = '';
  const labelStep = span === 60 ? 5 : span === 120 ? 10 : ([1,2,5,10,15,20,30].find(x => x >= span/12) || 30);
  const minor = span <= 12 ? 0.5 : span <= 60 ? 1 : 2;
  const n = Math.round(span / minor);
  for(let i = 0; i < n; i++){
    const m = i * minor, a = m * 360 / span;
    const major = Math.abs(m/labelStep - Math.round(m/labelStep)) < 1e-6;
    const [x1,y1] = polar(182, a), [x2,y2] = polar(major ? 160 : 171, a);
    g.appendChild(el('line', {x1, y1, x2, y2, class: major ? 'tick major' : 'tick'}));
    if(major && S.showLabels && (m === 0 || span - m > labelStep * 0.5)){
      const [x,y] = polar(146, a);
      const t = el('text', {x, y, class:'lbl', transform:`rotate(${a} ${x} ${y})`});
      t.textContent = m; g.appendChild(t);
    }
  }
}

// ---------- apparence ----------
function themeKey(){
  return S.theme === 'auto' ? ((window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) ? 'minuit' : 'tomate') : (THEMES[S.theme] ? S.theme : 'tomate');
}
function applyColors(){
  const T = THEMES[themeKey()];
  const p = Object.assign({}, T[st.mode]);
  if(S.customAccent) p.accent = S.accent;
  const r = document.documentElement;
  r.style.setProperty('--bg', p.bg); r.style.setProperty('--on-bg', p.onBg); r.style.setProperty('--face', p.face);
  r.style.setProperty('--ink', p.ink); r.style.setProperty('--accent', p.accent); r.style.setProperty('--stem', p.stem);
  // halo : lumière douce derrière la tomate (couleur d'accent la nuit, reflet clair le jour)
  r.style.setProperty('--glow', T.dark ? p.accent : p.onBg);
  r.dataset.theme = T.dark ? 'dark' : 'light';
  const meta = document.querySelector('meta[name="theme-color"]'); if(meta) meta.setAttribute('content', p.bg);
}
function applyFont(){ document.documentElement.style.setProperty('--font', FONTS[S.font] || FONTS.grotesque); }
function applySize(){ document.documentElement.style.setProperty('--size', S.size / 100); }
function applyLook(){
  const r = document.documentElement.classList;
  r.toggle('motion-none', S.motion === 'aucune');
  r.toggle('no-gloss', !S.gloss); r.toggle('no-halo', !S.halo); r.toggle('no-grain', !S.grain);
  taskEl.hidden = !S.showTask; $('#dots').hidden = !S.showDots; $('#todayBtn').hidden = !S.showStats;
}
if(window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { if(S.theme === 'auto') applyColors(); });

// ---------- son ----------
let ac = null;
function ensureAudio(){
  try{ if(!ac) ac = new (window.AudioContext || window.webkitAudioContext)(); if(ac.state !== 'running') ac.resume(); } // sur iPhone il peut aussi être « interrupted »
  catch(e){ ac = null; }
  return ac;
}
function tone(f, t, dur, gain, type, att){
  if(!ac || gain <= 0) return;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0002), t + (att || 0.004));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur + 0.05);
}
// durée de chaque sonnerie, pour enchaîner les répétitions
const BELL_LEN = { mecanique:2.5, cloche:3.6, marimba:1.9, doux:3.6, carillon:3.4 };
function playBell(times){
  if(!ensureAudio() || S.bell === 'aucun') return;
  const v = S.volume / 100;
  for(let r = 0; r < (times || 1); r++){
    const t = ac.currentTime + 0.03 + r * (BELL_LEN[S.bell] || 2.5);
    switch(S.bell){
      case 'mecanique':
        for(let b = 0; b < 2; b++) for(let i = 0; i < 14; i++){
          const tt = t + b*1.25 + i*0.065;
          tone(i % 2 ? 2350 : 2150, tt, 0.22, 0.2*v, 'triangle'); tone(5200, tt, 0.08, 0.04*v);
        }
        break;
      case 'cloche':
        [0, 0.9, 1.8].forEach(k => [[1,.45,2.6],[2.76,.22,1.6],[5.4,.1,.9],[8.93,.05,.5]].forEach(([q,g,d]) => tone(620*q, t+k, d, g*v)));
        break;
      case 'marimba':
        [523.25,659.25,783.99,1046.5,783.99,1046.5].forEach((f,i) => { const tt = t + i*0.13 + (i > 3 ? 0.25 : 0); tone(f, tt, 0.8, 0.38*v); tone(f*4, tt, 0.12, 0.06*v); });
        break;
      case 'doux':
        [[392,493.88,587.33],[440,554.37,659.25]].forEach((ch,k) => ch.forEach(f => tone(f, t + k*1.1, 2.4, 0.13*v, 'sine', 0.35)));
        break;
      case 'carillon': // les quatre notes de Westminster, en petites cloches
        [659.25, 523.25, 587.33, 392].forEach((f,i) => { const tt = t + i*0.55; tone(f, tt, 1.8, 0.3*v); tone(f*2.01, tt, 0.9, 0.08*v); tone(f*3, tt, 0.4, 0.04*v); });
        break;
    }
  }
}
function playTick(sec){ if(!ac) return; tone(sec % 2 ? 1800 : 1350, ac.currentTime, 0.035, 0.22 * (S.volume/100) * (S.tickVol/100), 'square'); }
function playClick(){ if(!ac) return; tone(2800, ac.currentTime, 0.025, 0.12 * S.volume/100, 'triangle'); }
// petit cliquetis de remontage, comme un vrai minuteur qu'on lance
function playWind(){
  if(!S.startSound || !ensureAudio()) return;
  const t = ac.currentTime + 0.01, v = S.volume / 100;
  for(let i = 0; i < 5; i++) tone(2400 + i*180, t + i*0.045 - i*i*0.002, 0.03, 0.1*v, 'triangle');
}
function playWarn(){ if(!ensureAudio()) return; const t = ac.currentTime + 0.02, v = S.volume / 100; tone(880, t, 0.5, 0.18*v); tone(1174.66, t + 0.18, 0.7, 0.16*v); }
function vib(p){ if(!S.vibrate) return; try{ navigator.vibrate && navigator.vibrate(p); }catch(e){} }

// ---------- ambiances (bruits fabriqués à la volée, rien à télécharger) ----------
const noiseCache = {};
function noise(kind){
  if(noiseCache[kind]) return noiseCache[kind];
  const sr = ac.sampleRate, len = sr * 6, X = 4096, b = ac.createBuffer(1, len, sr), d = b.getChannelData(0);
  let last = 0, b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for(let i = 0; i < len; i++){
    const w = Math.random() * 2 - 1;
    if(kind === 'white') d[i] = w * 0.5;
    else if(kind === 'pink'){
      b0 = 0.99886*b0 + w*0.0555179; b1 = 0.99332*b1 + w*0.0750759; b2 = 0.969*b2 + w*0.153852;
      b3 = 0.8665*b3 + w*0.3104856; b4 = 0.55*b4 + w*0.5329522; b5 = -0.7616*b5 - w*0.016898;
      d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w*0.5362) * 0.11; b6 = w * 0.115926;
    } else { last = (last + 0.02*w) / 1.02; d[i] = last * 3.5; }
  }
  // fondu enchaîné entre la fin et le début : la boucle ne fait pas de clic
  for(let i = 0; i < X; i++){ const k = i / X; d[i] = d[i]*k + d[len - X + i]*(1 - k); }
  return noiseCache[kind] = { buf:b, end:(len - X) / sr };
}
let amb = null, ambPrevT = 0;
function startAmbient(kind){
  stopAmbient(true);
  if(!ensureAudio()) return;
  const out = ac.createGain(); out.gain.value = 0.0001; out.connect(ac.destination);
  const nodes = [];
  const src = type => { const n = noise(type), s = ac.createBufferSource(); s.buffer = n.buf; s.loop = true; s.loopEnd = n.end; s.start(); nodes.push(s); return s; };
  const filt = (type, f, q) => { const n = ac.createBiquadFilter(); n.type = type; n.frequency.value = f; if(q) n.Q.value = q; return n; };
  const gain = v => { const g = ac.createGain(); g.gain.value = v; return g; };
  let timer = 0;
  switch(kind){
    case 'pluie':
      src('pink').connect(filt('highpass', 450)).connect(filt('lowpass', 7500)).connect(gain(1.1)).connect(out);
      timer = setInterval(() => { // quelques gouttes qui tapent
        if(Math.random() < 0.55){ const t = ac.currentTime + Math.random()*0.08; tone(1800 + Math.random()*3200, t, 0.03, 0.012 * S.ambVol/100); }
      }, 70);
      break;
    case 'vagues': {
      const g = gain(0.55), lfo = ac.createOscillator(), depth = gain(0.45);
      lfo.frequency.value = 0.085; lfo.connect(depth).connect(g.gain); lfo.start(); nodes.push(lfo);
      src('brown').connect(filt('lowpass', 1100)).connect(g).connect(out);
      break;
    }
    case 'cheminee': {
      src('brown').connect(filt('lowpass', 420)).connect(gain(0.9)).connect(out);
      const hp = filt('highpass', 1800); hp.connect(out);
      timer = setInterval(() => { // le bois qui craque
        if(Math.random() > 0.22) return;
        const n = noise('white'), s = ac.createBufferSource(), g = ac.createGain(), t = ac.currentTime, len = 0.008 + Math.random()*0.03;
        s.buffer = n.buf; g.gain.setValueAtTime(0.25 + Math.random()*0.6, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
        s.connect(g).connect(hp); s.start(t, Math.random()*5, len + 0.02);
      }, 60);
      break;
    }
    case 'brun': src('brown').connect(gain(0.9)).connect(out); break;
    case 'blanc': src('white').connect(filt('lowpass', 9000)).connect(gain(0.35)).connect(out); break;
    default: out.disconnect(); return;
  }
  out.gain.setValueAtTime(0.0001, ac.currentTime); out.gain.exponentialRampToValueAtTime(ambLevel(), ac.currentTime + 2);
  amb = { kind, out, nodes, timer, preview:false };
}
const ambLevel = () => Math.max(0.0001, S.ambVol / 100 * 0.5);
function stopAmbient(fast){
  if(!amb) return;
  const a = amb; amb = null; clearInterval(a.timer);
  const t = ac.currentTime, fade = fast ? 0.15 : 1.5;
  a.out.gain.cancelScheduledValues(t); a.out.gain.setValueAtTime(a.out.gain.value, t); a.out.gain.linearRampToValueAtTime(0, t + fade);
  setTimeout(() => { a.nodes.forEach(n => { try{ n.stop(); }catch(e){} }); a.out.disconnect(); }, fade * 1000 + 100);
}
function syncAmbient(){
  const want = S.ambient !== 'aucune' && st.running && (st.mode === 'focus' || S.ambBreaks) ? S.ambient : null;
  if(!want){ if(amb && !amb.preview) stopAmbient(); return; }
  if(!amb || amb.kind !== want || amb.preview){ startAmbient(want); }
}
// aperçu de quelques secondes quand on choisit une ambiance dans les réglages
function previewAmbient(){
  clearTimeout(ambPrevT);
  syncAmbient();
  if(amb && !amb.preview) return; // elle tourne déjà pour de vrai
  if(S.ambient === 'aucune'){ stopAmbient(); return; }
  startAmbient(S.ambient); if(amb) amb.preview = true;
  ambPrevT = setTimeout(() => { if(amb && amb.preview) stopAmbient(); }, 4500);
}

// ---------- écran allumé ----------
// Les appels sont mis en file : deux demandes simultanées créaient deux verrous, dont un jamais relâché.
let wl = null, wlQueue = Promise.resolve();
function lockScreen(on){ wlQueue = wlQueue.then(() => syncLock(on)); return wlQueue; }
async function syncLock(on){
  try{
    if(on && (S.wakeLock || (S.blackout && st.mode === 'focus')) && 'wakeLock' in navigator && !document.hidden){
      if(!wl){ const w = await navigator.wakeLock.request('screen'); wl = w; w.addEventListener('release', () => { if(wl === w) wl = null; }); }
    } else if(wl){ const w = wl; wl = null; await w.release(); }
  }catch(e){}
}
document.addEventListener('visibilitychange', () => { if(!document.hidden){ lockScreen(st.running); renderStats(); wake(); } });

// ---------- affichage ----------
function currentRem(){ return st.running ? Math.max(0, st.endAt - Date.now()) : st.remaining; }
function fmt(rem){
  const s = Math.ceil(rem / 1000 - 1e-6);
  if(S.showSeconds) return String(Math.floor(s/60)).padStart(2,'0') + ':' + String(s % 60).padStart(2,'0');
  return String(Math.ceil(s / 60));
}
function renderDigits(rem, force){
  const str = fmt(rem);
  if(str === st.lastStr && !force) return;
  const prev = st.lastStr;
  const anim = S.digitAnim && S.motion !== 'aucune' && !force && prev.length === str.length;
  digitsEl.innerHTML = [...str].map((c,i) => `<span class="${c === ':' ? 'colon' : 'd'}${anim && prev[i] !== c ? ' roll' : ''}">${c}</span>`).join('')
    + (S.showSeconds ? '' : '<span class="unit">min</span>');
  st.lastStr = str;
  dial.setAttribute('aria-valuenow', Math.max(1, Math.ceil(rem / MIN)));
  dial.setAttribute('aria-valuetext', S.showSeconds ? str.replace(':', ' minutes ') + ' secondes' : str + ' minutes');
}
function updateTitle(rem){
  document.title = S.tabTitle ? `${fmt(rem)}${S.showSeconds ? '' : ' min'} – ${LABEL[st.mode]}${st.running ? '' : ' (en pause)'}` : 'Pomodoro';
}
let subText = '';
function setSub(t){ if(t !== subText){ subText = t; subEl.textContent = t; } }
function baseSub(){
  const task = taskEl.value.trim();
  return st.mode === 'focus' && task && S.showTask ? task : LABEL[st.mode];
}
// la phrase sous le cadran : le mode d'emploi au tout début, puis des encouragements
let hintText = '';
function updateHint(){
  let t = '';
  if(!totalSessions() && st.mode === 'focus') t = 'Tourne le cadran pour régler le temps, touche-le pour lancer.';
  else if(S.quotes) t = st.quote;
  if(t !== hintText){ hintText = t; $('#hint').textContent = t; }
}
function newQuote(){ st.quote = pick(st.mode === 'focus' ? QUOTES : st.mode === 'long' ? LONG_TIPS : BREAK_TIPS); }

function draw(){
  scaleG.setAttribute('transform', `rotate(${st.dispRot.toFixed(3)} 200 200)`);
  let a = Math.min(360, Math.max(0, -st.dispRot));
  arc.setAttribute('stroke-dasharray', `${(a/360*CIRC).toFixed(2)} ${CIRC.toFixed(2)}`);
  arc.setAttribute('transform', `rotate(${(-90 - a).toFixed(3)} 200 200)`);

  if(st.autoAt){
    readout.style.transform = 'translate(-50%,-50%)';
    setSub(`Ça repart dans ${Math.max(1, Math.ceil((st.autoAt - Date.now()) / 1000))} s`);
  } else if(st.running && st.mode !== 'focus' && S.breathe && S.motion !== 'aucune'){
    const p = (Date.now() % 8000) / 8000;
    const sc = 1 + 0.07 * (0.5 - 0.5 * Math.cos(2 * Math.PI * p));
    readout.style.transform = `translate(-50%,-50%) scale(${sc.toFixed(4)})`;
    setSub(p < 0.5 ? 'Inspire' : 'Expire');
  } else {
    readout.style.transform = 'translate(-50%,-50%)';
    setSub(baseSub());
  }
}

function tick(rem){
  const sec = Math.ceil(rem / 1000 - 1e-6);
  if(sec !== st.lastSec){
    if(st.running && sec < st.lastSec){
      if(S.tick && st.mode === 'focus' && sec > 0) playTick(sec);
      // prévenir un peu avant la fin (seulement si on vient de passer le cap, pas au retour d'arrière-plan)
      const w = S.warn * 60;
      if(w && st.lastSec > w && sec <= w && sec > w - 3 && st.total > w * 1000 + 5000){
        playWarn(); vib([30, 60, 30]);
        toast(S.warn === 1 ? 'Plus qu’une minute' : `Plus que ${S.warn} minutes`, st.mode === 'focus' ? 'Termine ta phrase, tranquille.' : 'Prépare-toi doucement à reprendre.');
      }
    }
    st.lastSec = sec; renderDigits(rem); updateTitle(rem);
  }
  if(st.running && rem <= 0) complete(true);
}

// ---------- écran noir ----------
// Pendant le focus, l'écran s'éteint doucement (noir complet : sur un écran OLED, les pixels noirs sont éteints).
// Toucher le rallume quelques secondes. La dernière minute, des ondes discrètes ; les 15 dernières secondes,
// il se rallume pour être pile allumé quand ça sonne. Pendant les pauses, il reste allumé.
const veil = $('#veil'), VEIL_BLEED = 120; // le voile dépasse de l'écran en haut et en bas
let veilLvl = 0, veilOp = -1, wakeUntil = 0, lastFrame = performance.now();
function wake(){ wakeUntil = Date.now() + S.wakeFor * 1000; }
function placeWaves(){
  const r = dial.getBoundingClientRect();
  veil.style.setProperty('--cx', (r.left + r.width/2) + 'px'); veil.style.setProperty('--cy', (r.top + r.height*0.5283 + VEIL_BLEED) + 'px');
  veil.style.setProperty('--r', r.width + 'px');
}
function updateVeil(rem, dt){
  const active = S.blackout && st.running && st.mode === 'focus' && !drawerOpen && !bilanOpen && document.activeElement !== taskEl;
  if(!active) veilLvl = Math.max(0, veilLvl - dt / 600);
  else if(S.relight && rem <= 15000) veilLvl = Math.min(veilLvl, rem / 15000);
  else if(Date.now() < wakeUntil) veilLvl = Math.max(0, veilLvl - dt / 900);
  else veilLvl = Math.min(1, veilLvl + dt / (S.fadeDur * 1000));
  const o = +(veilLvl * veilLvl * (3 - 2 * veilLvl)).toFixed(3); // départ et arrivée en douceur
  if(o !== veilOp){
    veilOp = o; veil.style.opacity = o;
    // Le fond de la page s'assombrit aussi : sur iPhone, les zones sûres (barre d'accueil en bas) montrent ce fond, pas le voile
    const r = document.documentElement; r.style.setProperty('--dim', (o * 100).toFixed(1) + '%'); r.classList.toggle('dimming', o > 0);
    if(o === 0) applyColors(); else if(o >= 0.5){ const meta = document.querySelector('meta[name="theme-color"]'); if(meta) meta.setAttribute('content', '#000000'); }
    veil.classList.toggle('catch', o > 0.3);
    document.body.classList.toggle('veiled', o >= 1);
  }
  const waves = active && S.waves && rem <= 60000 && rem > 0 && o > 0.4;
  if(waves !== veil.classList.contains('waves')){ if(waves) placeWaves(); veil.classList.toggle('waves', waves); }
}
// le premier toucher sur l'écran noir ne fait que le rallumer
veil.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); wake(); });
veil.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); });
document.addEventListener('pointerdown', wake, true);
document.addEventListener('keydown', wake, true);

function frame(now){
  const dt = Math.min(1000, Math.max(0, (now || performance.now()) - lastFrame)); lastFrame = now || performance.now();
  const rem = currentRem();
  const target = -(rem / MIN) * (360 / st.span);
  const k = S.motion === 'aucune' ? 1 : (st.dragging ? 0.45 : (S.motion === 'reduite' ? 0.3 : 0.12));
  st.dispRot += (target - st.dispRot) * k;
  if(Math.abs(target - st.dispRot) < 0.01) st.dispRot = target;
  updateVeil(rem, dt);
  if(veilOp < 1) draw(); // écran noir : rien à dessiner dessous
  tick(rem);
  requestAnimationFrame(frame);
}
setInterval(() => tick(currentRem()), 500);

// ---------- effets ----------
function flash(cls, ms){ wrap.classList.remove(cls); void wrap.offsetWidth; wrap.classList.add(cls); setTimeout(() => wrap.classList.remove(cls), ms); }
const cv = $('#fx'), ctx = cv.getContext('2d'); let parts = [], fxOn = false;
function resize(){ const d = window.devicePixelRatio || 1; cv.width = innerWidth*d; cv.height = innerHeight*d; cv.style.width = innerWidth+'px'; cv.style.height = innerHeight+'px'; ctx.setTransform(d,0,0,d,0,0); }
addEventListener('resize', resize); resize();
function burst(n, power){
  if(!S.particles || S.motion === 'aucune') return;
  if(S.motion === 'reduite') n = Math.round(n * 0.3);
  const r = dial.getBoundingClientRect(), ox = r.left + r.width/2, oy = r.top + r.height*0.5283;
  const cs = getComputedStyle(document.documentElement);
  const cols = ['--accent','--stem','--face','--on-bg'].map(v => cs.getPropertyValue(v).trim());
  for(let i = 0; i < n; i++){
    const a = Math.random() * Math.PI * 2, sp = (3 + Math.random()*9) * power, rr = r.width * (0.2 + Math.random()*0.25);
    parts.push({ x:ox + Math.cos(a)*rr, y:oy + Math.sin(a)*rr, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp - 3*power, rot:Math.random()*6,
      vr:(Math.random()-.5)*0.3, w:2.5 + Math.random()*3.5, h:5 + Math.random()*5, life:0, max:70 + Math.random()*70, c:cols[i % cols.length] });
  }
  if(!fxOn){ fxOn = true; requestAnimationFrame(fx); }
}
function fx(){
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  parts = parts.filter(p => p.life < p.max);
  for(const p of parts){
    p.life++; p.vy += 0.22; p.vx *= 0.985; p.vy *= 0.985; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
    ctx.save(); ctx.globalAlpha = Math.min(1, (1 - p.life/p.max) * 1.6);
    ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c;
    ctx.beginPath(); ctx.ellipse(0, 0, p.w, p.h, 0, 0, Math.PI*2); ctx.fill(); ctx.restore();
  }
  if(parts.length) requestAnimationFrame(fx); else { fxOn = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
}
let toastT;
function toast(title, body){
  const t = $('#toast');
  t.innerHTML = `<b>${esc(title)}</b>${body ? `<span>${esc(body)}</span>` : ''}`;
  t.classList.add('show'); clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), body ? 4200 : 2600);
}
$('#toast').addEventListener('click', () => $('#toast').classList.remove('show'));
function announce(msg){ $('#live').textContent = msg; }

// ---------- logique ----------
function updateUI(){
  document.querySelectorAll('.modes button').forEach(b => b.setAttribute('aria-selected', b.dataset.mode === st.mode));
  const rem = currentRem();
  $('#startBtn').textContent = st.running ? 'Pause' : (rem > 0 && rem < st.total ? 'Reprendre' : 'Démarrer');
  document.body.classList.toggle('running', st.running);
  document.body.classList.toggle('zen', S.zen && st.running && st.mode === 'focus');
  renderDots(); renderStats(); updateTitle(rem); renderDigits(rem); updateHint();
  lockScreen(st.running); syncAmbient(); saveRun();
}
// Sur iPhone, une appli en arrière-plan peut être fermée sans prévenir : on garde le minuteur en cours pour le reprendre au retour.
function saveRun(){ store(RUN, { mode:st.mode, running:st.running, endAt:st.endAt, remaining:st.remaining, total:st.total, cycle:st.cycle }); }
function restoreRun(){
  const r = savedRun;
  if(!r || !LABEL[r.mode] || st.completing) return;
  st.cycle = Math.max(0, Math.min(r.cycle | 0, S.cycles));
  prevCycle = st.cycle;
  st.mode = r.mode;
  const ended = r.running && r.endAt <= Date.now();
  if(ended && dayKey(r.endAt) !== today()){
    st.total = st.remaining = durOf(r.mode);
  } else if(r.remaining > 0 || r.running){
    st.total = r.total; st.remaining = r.remaining; st.running = !!r.running; st.endAt = r.endAt;
  } else st.total = st.remaining = durOf(r.mode);
  st.span = spanFor(st.total / MIN); newQuote(); buildScale(); applyColors(); updateUI();
}
let autoT = 0;
function cancelAuto(){ clearTimeout(autoT); st.autoAt = 0; }
function start(){
  ensureAudio(); cancelAuto();
  if(st.running || st.completing) return;
  if(st.remaining <= 0) st.remaining = st.total;
  const fresh = st.remaining === st.total;
  st.running = true; st.endAt = Date.now() + st.remaining;
  if(S.motion !== 'aucune') flash('pulse', 800);
  burst(14, 0.55); vib(15); if(fresh) playWind();
  updateUI();
}
function pause(){ if(!st.running) return; st.remaining = Math.max(0, st.endAt - Date.now()); st.running = false; updateUI(); }
function toggle(){ st.running ? pause() : start(); }
function reset(){
  if(st.completing) return;
  cancelAuto();
  st.running = false; st.total = st.remaining = durOf(st.mode);
  st.span = spanFor(S[st.mode]); buildScale(); updateUI();
}
let nextT = 0;
function setMode(m, auto){
  clearTimeout(nextT); cancelAuto(); st.completing = false;
  if(m !== st.mode) { st.mode = m; newQuote(); }
  st.running = false;
  st.total = st.remaining = durOf(m); st.span = spanFor(S[m]);
  buildScale(); applyColors(); updateUI();
  if(auto){
    if(S.autoDelay > 0){ st.autoAt = Date.now() + S.autoDelay * 1000; autoT = setTimeout(start, S.autoDelay * 1000); }
    else start();
  }
}
function complete(natural){
  if(st.completing) return;
  const was = st.mode;
  st.running = false; st.remaining = 0; st.completing = true;
  let next, auto = false, goalHit = false;
  if(was === 'focus'){
    if(natural){
      const before = dayOf(today()).s;
      record(Math.round(st.total / MIN), S.showTask ? taskEl.value.trim() : '');
      st.cycle++;
      goalHit = before < S.goal && before + 1 >= S.goal;
    }
    next = st.cycle >= S.cycles ? 'long' : 'short';
    auto = natural && S.autoBreak;
  } else {
    if(was === 'long') st.cycle = 0;
    next = 'focus'; auto = natural && S.autoFocus;
  }
  if(natural){
    playBell(S.bellRepeat); burst(goalHit ? S.particleCount * 2 : S.particleCount, goalHit ? 1.3 : 1); vib([140, 70, 140, 70, 220]);
    if(S.shake && S.motion === 'complete') flash('ringing', 1400);
    notifyEnd(was);
    announce(was === 'focus' ? 'Focus terminé, place à la pause.' : 'Pause terminée, on y retourne.');
    if(goalHit) toast(withName('Objectif du jour atteint{n} 🎉'), `${S.goal} sessions, chapeau. Tout ce qui vient maintenant, c’est du bonus.`);
    else if(was === 'focus'){
      const n = dayOf(today()).s;
      toast(withName(pick(FOCUS_DONE)), `Session n°${n} aujourd’hui. ${next === 'long' ? pick(LONG_TIPS) : pick(BREAK_TIPS)}`);
    } else toast(withName(pick(BREAK_DONE)), pick(QUOTES));
  }
  updateUI();
  nextT = setTimeout(() => setMode(next, auto), natural ? 1100 : 0);
}
function skip(){ cancelAuto(); complete(false); }

async function notifyEnd(m){
  if(!S.notify || !('Notification' in window) || Notification.permission !== 'granted') return;
  const task = taskEl.value.trim();
  const title = m === 'focus' ? 'Focus terminé' : 'Pause terminée';
  const body = m === 'focus' ? (task && S.showTask ? `« ${task} » : une session de plus. Lève-toi, souffle un peu.` : 'Lève-toi, souffle un peu.') : 'Allez, on y retourne.';
  const opts = { body, icon:'icons/icon-192.png', tag:'pomodoro' };
  // Sur iPhone, une appli de l'écran d'accueil ne peut notifier que par son service worker.
  try{
    const reg = 'serviceWorker' in navigator && await navigator.serviceWorker.getRegistration();
    if(reg){ await reg.showNotification(title, opts); return; }
  }catch(e){}
  try{ new Notification(title, opts); }catch(e){}
}
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
async function askNotify(){
  try{
    if(!('Notification' in window)) throw 0;
    const p = await Notification.requestPermission();
    if(p !== 'granted') throw 0;
    toast('Notifications activées');
  }catch(e){
    S.notify = false; save(); rerenderSettings();
    toast(isIOS && !standalone ? 'Ajoute d’abord l’appli à l’écran d’accueil pour les notifications' : 'Ton navigateur bloque les notifications sur cette page');
  }
}

let prevCycle = 0;
function renderDots(){
  const d = $('#dots'); d.innerHTML = '';
  for(let i = 0; i < S.cycles; i++){
    const s = document.createElement('span');
    s.className = 'dot' + (i < st.cycle ? ' on' : '') + (i < st.cycle && i >= prevCycle ? ' pop' : '');
    d.appendChild(s);
  }
  d.setAttribute('aria-label', `${Math.min(st.cycle, S.cycles)} focus sur ${S.cycles} avant la pause longue`);
  prevCycle = st.cycle;
}
const fmtMin = m => m >= 60 ? `${Math.floor(m/60)} h ${pad(m % 60)}` : `${m} min`;
function renderStats(){
  const { s, m } = dayOf(today()), g = S.goal;
  $('#statsText').textContent = s >= g
    ? `Objectif atteint : ${s} sessions, ${fmtMin(m)}`
    : `${s} sur ${g} sessions aujourd’hui${m ? ` · ${fmtMin(m)}` : ''}`;
  $('#goalBar').style.width = Math.min(100, s / g * 100) + '%';
  const n = streak();
  $('#streak').textContent = S.streak && n >= 2 ? `🔥 ${n} jours` : '';
  if(bilanOpen) renderBilan();
}

// ---------- bilan ----------
const DAYS = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
function renderBilan(){
  const k0 = today(), week = [];
  for(let i = 0, k = k0; i < 7; i++, k = prevKey(k)) week.unshift({ k, ...dayOf(k) });
  const wMin = week.reduce((a, d) => a + d.m, 0), wS = week.reduce((a, d) => a + d.s, 0);
  const best = Object.values(hist.days).reduce((a, d) => Math.max(a, d.s || 0), 0);
  const max = Math.max(S.goal, ...week.map(d => d.s));
  const td = dayOf(k0), n = streak(), total = totalSessions();
  const log = hist.log.filter(e => dayKey(e.t) === k0).reverse();
  const msg = !total ? 'Ta première session t’attend. Allez, juste une.'
    : td.s >= S.goal ? 'Journée remplie. Chapeau bas, vraiment.'
    : td.s ? `Encore ${S.goal - td.s} pour atteindre ton objectif.`
    : n ? `Ta série de ${n} jour${n > 1 ? 's' : ''} t’attend. Une session et elle continue.` : 'Nouvelle journée, nouvelle session.';
  $('#bilanBody').innerHTML = `
    <p class="bilan-msg">${esc(msg)}</p>
    <div class="tiles">
      <div class="tile big"><b>${td.s}<small>/${S.goal}</small></b><span>sessions aujourd’hui</span></div>
      <div class="tile big"><b>${fmtMin(td.m)}</b><span>de focus aujourd’hui</span></div>
      <div class="tile"><b>${n}</b><span>jour${n > 1 ? 's' : ''} d’affilée</span></div>
      <div class="tile"><b>${fmtMin(wMin)}</b><span>sur 7 jours (${wS})</span></div>
      <div class="tile"><b>${best}</b><span>record sur un jour</span></div>
      <div class="tile"><b>${total}</b><span>sessions en tout</span></div>
    </div>
    <h3>Ta semaine</h3>
    <div class="plot" style="--goal:${(S.goal / max * 100).toFixed(1)}%" role="img" aria-label="${week.map(d => `${DAYS[dateOf(d.k).getDay()]} ${d.s}`).join(', ')}">
      ${week.map((d, i) => { const h = (d.s / max * 100).toFixed(1);
        return `<div class="bar${d.k === k0 ? ' now' : ''}${d.s >= S.goal ? ' hit' : ''}"><em style="bottom:${h}%">${d.s || ''}</em><i style="height:${h}%; animation-delay:${i * 40}ms"></i></div>`; }).join('')}
    </div>
    <div class="days">${week.map(d => `<span${d.k === k0 ? ' class="now"' : ''}>${d.k === k0 ? 'Auj.' : DAYS[dateOf(d.k).getDay()]}</span>`).join('')}</div>
    <h3>Le journal du jour</h3>
    ${log.length ? `<ol class="journal">${log.map(e => { const d = new Date(e.t);
      return `<li><time>${pad(d.getHours())}:${pad(d.getMinutes())}</time><span>${e.task ? esc(e.task) : '<i>Sans titre</i>'}</span><small>${e.m} min</small></li>`; }).join('')}</ol>`
      : '<p class="empty">Rien pour l’instant. Chaque session terminée viendra s’inscrire ici, avec ta tâche.</p>'}`;
}

// ---------- cadran tournant ----------
function angleOf(e){
  const r = dial.getBoundingClientRect();
  const cx = r.left + r.width/2, cy = r.top + r.height * 0.5283;
  return Math.atan2(e.clientX - cx, -(e.clientY - cy)) * 180 / Math.PI;
}
function setMinutes(v){ st.total = st.remaining = v * MIN; }
let drag = null;
dial.addEventListener('pointerdown', e => {
  if(e.button > 0 || st.completing || drag) return;
  ensureAudio(); cancelAuto();
  const rem = currentRem();
  drag = { last:angleOf(e), acc:0, start:rem / MIN, was:st.running, moved:false, val:Math.ceil(rem / MIN - 1e-9), id:e.pointerId };
  if(st.running){ st.remaining = rem; st.running = false; }
  st.dragging = true;
  try{ dial.setPointerCapture(e.pointerId); }catch(err){}
});
dial.addEventListener('pointermove', e => {
  if(!drag) return;
  const a = angleOf(e); let d = a - drag.last;
  if(d > 180) d -= 360; if(d < -180) d += 360;
  drag.last = a; drag.acc += d;
  if(Math.abs(drag.acc) > 5) drag.moved = true;
  if(!drag.moved) return;
  const v = Math.max(1, Math.min(120, Math.round(drag.start - drag.acc * st.span / 360)));
  if(v !== drag.val){ drag.val = v; setMinutes(v); playClick(); vib(4); renderDigits(currentRem()); updateTitle(currentRem()); }
});
function endDrag(e, cancelled){
  if(!drag) return;
  try{ dial.releasePointerCapture(drag.id); }catch(err){}
  st.dragging = false;
  const d = drag; drag = null;
  if(!d.moved){
    if(cancelled){ if(d.was) start(); }
    else if(!d.was) start();
    updateUI(); return;
  }
  st.span = spanFor(st.total / MIN); buildScale();
  if(d.was) start(); else updateUI();
}
dial.addEventListener('pointerup', e => endDrag(e, false));
dial.addEventListener('pointercancel', e => endDrag(e, true));
dial.addEventListener('keydown', e => {
  const k = e.key;
  if(['ArrowUp','ArrowRight','ArrowDown','ArrowLeft'].includes(k)){
    e.preventDefault(); ensureAudio(); cancelAuto();
    const was = st.running; if(was){ st.remaining = currentRem(); st.running = false; }
    const cur = Math.ceil(st.remaining / MIN - 1e-9);
    const v = Math.max(1, Math.min(120, cur + (k === 'ArrowUp' || k === 'ArrowRight' ? 1 : -1)));
    setMinutes(v); playClick();
    st.span = spanFor(v); buildScale();
    if(was) start(); else updateUI();
  } else if(k === 'Enter'){ e.preventDefault(); toggle(); }
});

// ---------- réglages ----------
const swatch = t => { const p = THEMES[t].focus; return `linear-gradient(135deg, ${p.bg} 50%, ${p.face} 50%)`; };
const SCHEMA = [
  { id:'rythme', t:'Rythme', d:'Choisis un profil tout prêt ou règle chaque durée à ta main.', items:[
    {type:'presets'},
    {k:'focus', l:'Focus', type:'range', min:1, max:120, u:'min'},
    {k:'short', l:'Pause courte', type:'range', min:1, max:30, u:'min'},
    {k:'long', l:'Pause longue', type:'range', min:5, max:60, u:'min'},
    {k:'cycles', l:'Focus avant la pause longue', type:'range', min:2, max:8}
  ]},
  { id:'enchainement', t:'Enchaînement', items:[
    {k:'autoBreak', l:'Lancer la pause toute seule', type:'toggle', d:'Dès que le focus sonne, la pause démarre sans que tu touches à rien.'},
    {k:'autoFocus', l:'Relancer le focus après la pause', type:'toggle', d:'Pratique pour enchaîner, mais pense à vraiment décrocher pendant la pause.'},
    {k:'autoDelay', l:'Petit délai avant de repartir', type:'chips', o:[[0,'Aucun'],[3,'3 s'],[5,'5 s'],[10,'10 s']], show:s => s.autoBreak || s.autoFocus, d:'Le temps de souffler. Démarrer pour partir tout de suite, Recommencer pour annuler.'}
  ]},
  { id:'objectifs', t:'Objectifs', items:[
    {k:'goal', l:'Objectif du jour', type:'range', min:1, max:16, u:'sessions', d:'Huit sessions de 25 min, c’est déjà plus de 3 h de vraie concentration.'},
    {k:'dayStart', l:'La journée commence à', type:'range', min:0, max:8, u:'h', d:'Pour les couche-tard : une session à 1 h du matin compte pour la veille.'},
    {k:'streak', l:'Afficher ta série de jours', type:'toggle', d:'Une flamme s’affiche dès 2 jours d’affilée avec au moins une session.'}
  ]},
  { id:'son', t:'Son', items:[
    {k:'bell', l:'Sonnerie', type:'chips', o:[['mecanique','Mécanique'],['cloche','Cloche'],['carillon','Carillon'],['marimba','Marimba'],['doux','Douce'],['aucun','Aucune']]},
    {k:'volume', l:'Volume', type:'range', min:0, max:100, step:5, u:'%'},
    {k:'bellRepeat', l:'Nombre de sonneries', type:'chips', o:[[1,'Une fois'],[2,'Deux fois'],[3,'Trois fois']]},
    {type:'action', l:'Écouter la sonnerie', a:'testBell'},
    {k:'warn', l:'Prévenir avant la fin', type:'chips', o:[[0,'Non'],[1,'1 min'],[2,'2 min'],[5,'5 min']], d:'Un petit carillon discret pour finir ta phrase avant que ça sonne.'},
    {k:'startSound', l:'Cliquetis au lancement', type:'toggle', d:'Le bruit d’un minuteur qu’on remonte.'},
    {k:'tick', l:'Tic-tac pendant le focus', type:'toggle'},
    {k:'tickVol', l:'Volume du tic-tac', type:'range', min:0, max:100, step:5, u:'%', show:s => s.tick}
  ]},
  { id:'ambiance', t:'Ambiance', d:'Un fond sonore pour couper le monde extérieur. Fabriqué en direct, sans rien télécharger.', items:[
    {k:'ambient', l:'Fond sonore', type:'chips', o:[['aucune','Silence'],['pluie','Pluie'],['vagues','Vagues'],['cheminee','Cheminée'],['brun','Bruit brun'],['blanc','Bruit blanc']]},
    {k:'ambVol', l:'Volume de l’ambiance', type:'range', min:0, max:100, step:5, u:'%', show:s => s.ambient !== 'aucune'},
    {k:'ambBreaks', l:'Garder l’ambiance pendant les pauses', type:'toggle', show:s => s.ambient !== 'aucune'}
  ]},
  { id:'apparence', t:'Apparence', items:[
    {k:'theme', l:'Thème', type:'chips', o:[['auto','Auto','linear-gradient(135deg, #D5382B 50%, #12162A 50%)'], ...['tomate','minuit','papier','agrume','sakura','espresso'].map(t => [t, t[0].toUpperCase() + t.slice(1), swatch(t)])], d:'Auto suit le mode clair ou sombre de ton téléphone.'},
    {k:'customAccent', l:'Couleur d’accent perso', type:'toggle'},
    {k:'accent', l:'Ta couleur', type:'color', show:s => s.customAccent},
    {k:'font', l:'Police', type:'chips', o:[['grotesque','Grotesque'],['serif','Sérif'],['machine','Machine à écrire']]},
    {k:'dialScale', l:'Graduation du cadran', type:'chips', o:[['classique','60 min, comme un vrai'],['adaptee','Un tour par session']]},
    {k:'size', l:'Taille du cadran', type:'range', min:60, max:100, step:5, u:'%'},
    {k:'showSeconds', l:'Afficher les secondes', type:'toggle'},
    {k:'showLabels', l:'Chiffres sur le cadran', type:'toggle'},
    {k:'gloss', l:'Reflet sur la tomate', type:'toggle', d:'Un éclat de lumière fixe : le cadran tourne dessous, comme un vrai.'},
    {k:'halo', l:'Halo lumineux', type:'toggle', d:'Une lueur douce derrière la tomate, qui respire quand le temps file.'},
    {k:'grain', l:'Grain du fond', type:'toggle', d:'Une texture papier très légère.'}
  ]},
  { id:'ecran', t:'Écran principal', items:[
    {k:'name', l:'Ton prénom', type:'text', ph:'Pour des encouragements perso'},
    {k:'quotes', l:'Phrases d’encouragement', type:'toggle', d:'Sous le cadran, et des conseils de pause pendant les pauses.'},
    {k:'zen', l:'Mode zen pendant le focus', type:'toggle', d:'Tout s’efface autour de la tomate quand le temps tourne.'},
    {k:'showTask', l:'Champ « sur quoi tu bosses »', type:'toggle', d:'La tâche s’affiche dans le cadran et s’inscrit dans ton journal.'},
    {k:'showDots', l:'Points du cycle', type:'toggle'},
    {k:'showStats', l:'Résumé du jour', type:'toggle'}
  ]},
  { id:'noir', t:'Écran noir', d:'Pendant le focus, l’écran s’éteint doucement jusqu’au noir complet : rien pour te distraire, et ta batterie dit merci. Les pauses restent allumées.', items:[
    {k:'blackout', l:'Éteindre l’écran pendant le focus', type:'toggle', d:'L’écran reste techniquement allumé (pour pouvoir sonner), mais tout en noir.'},
    {k:'fadeDur', l:'Durée du fondu', type:'chips', o:[[10,'10 s'],[30,'30 s'],[60,'1 min'],[120,'2 min']], show:s => s.blackout},
    {k:'wakeFor', l:'Rallumé quand tu touches', type:'chips', o:[[3,'3 s'],[5,'5 s'],[10,'10 s'],[20,'20 s']], show:s => s.blackout, d:'Le premier toucher ne fait que rallumer : pas de pause par erreur.'},
    {k:'waves', l:'Ondes la dernière minute', type:'toggle', show:s => s.blackout, d:'Des cercles très discrets, pour sentir la fin approcher.'},
    {k:'relight', l:'Se rallumer pour la sonnerie', type:'toggle', show:s => s.blackout, d:'L’écran revient doucement les 15 dernières secondes, pile allumé quand ça sonne.'}
  ]},
  { id:'animations', t:'Animations', items:[
    {k:'motion', l:'Niveau', type:'chips', o:[['complete','Complètes'],['reduite','Réduites'],['aucune','Aucune']]},
    {k:'digitAnim', l:'Chiffres qui défilent', type:'toggle'},
    {k:'particles', l:'Pluie de pépins à la fin', type:'toggle', d:'Double ration le jour où tu atteins ton objectif.'},
    {k:'particleCount', l:'Nombre de pépins', type:'range', min:20, max:250, step:10, show:s => s.particles},
    {k:'shake', l:'Le minuteur tremble quand il sonne', type:'toggle'},
    {k:'breathe', l:'Respiration guidée pendant les pauses', type:'toggle', d:'4 secondes pour inspirer, 4 pour expirer.'}
  ]},
  { id:'telephone', t:'Téléphone', items:[
    {k:'notify', l:'Notifications', type:'toggle', d: isIOS && !standalone ? 'Sur iPhone, il faut d’abord ajouter l’appli à l’écran d’accueil.' : ''},
    {k:'vibrate', l:'Vibrations', type:'toggle'},
    {k:'wakeLock', l:'Garder l’écran allumé', type:'toggle', d:'Conseillé sur iPhone : la sonnerie ne retentit que si l’appli est ouverte.'},
    {k:'tabTitle', l:'Temps dans le titre de l’onglet', type:'toggle'}
  ]},
  { id:'donnees', t:'Tes données', d:'Tout reste sur ton téléphone. Sauvegarde-les avant de changer d’appareil.', items:[
    {type:'action', l:'Exporter réglages et historique', a:'exportData'},
    {type:'action', l:'Importer une sauvegarde', a:'importData'},
    {type:'action', l:'Effacer les stats du jour', a:'clearStats', danger:true},
    {type:'action', l:'Effacer tout l’historique', a:'clearHistory', danger:true},
    {type:'action', l:'Remettre les réglages par défaut', a:'resetSettings', danger:true}
  ]}
];
const RERENDER = ['blackout','tick','customAccent','particles','ambient','autoBreak','autoFocus','focus','short','long','cycles'];
const ACTIONS = {
  testBell(){ ensureAudio(); playBell(S.bellRepeat); },
  clearStats(){
    const k = today(); delete hist.days[k]; hist.log = hist.log.filter(e => dayKey(e.t) !== k); saveHist();
    st.cycle = 0; prevCycle = 0; renderDots(); renderStats(); updateHint(); toast('Stats du jour effacées');
  },
  clearHistory(){ hist = { days:{}, log:[] }; saveHist(); st.cycle = 0; prevCycle = 0; renderDots(); renderStats(); updateHint(); toast('Historique effacé', 'On repart d’une page blanche.'); },
  resetSettings(){ S = Object.assign({}, DEFAULTS); save(); applyAll(); rerenderSettings(); toast('Réglages par défaut remis'); },
  async exportData(){
    const data = JSON.stringify({ app:'pomodoro', v:1, date:new Date().toISOString(), settings:S, hist, task:taskEl.value }, null, 1);
    const name = `pomodoro-${today()}.json`;
    try{
      const file = new File([data], name, { type:'application/json' });
      if(navigator.canShare && navigator.canShare({ files:[file] })){ await navigator.share({ files:[file], title:'Sauvegarde Pomodoro' }); return; }
    }catch(e){ if(e && e.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type:'application/json' })); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  },
  importData(){ $('#importFile').click(); }
};
$('#importFile').addEventListener('change', async e => {
  const f = e.target.files[0]; e.target.value = '';
  if(!f) return;
  try{
    const d = JSON.parse(await f.text());
    if(!d || d.app !== 'pomodoro') throw 0;
    if(d.settings && typeof d.settings === 'object'){ S = Object.assign({}, DEFAULTS, d.settings); save(); }
    if(d.hist && d.hist.days && Array.isArray(d.hist.log)){ hist = d.hist; saveHist(); }
    if(typeof d.task === 'string'){ taskEl.value = d.task; try{ localStorage.setItem(TASK, d.task); }catch(err){} }
    applyAll(); rerenderSettings(); toast('Sauvegarde importée', 'Tout est revenu à sa place.');
  }catch(err){ toast('Ce fichier ne ressemble pas à une sauvegarde Pomodoro'); }
});

function row(it){
  const r = document.createElement('div'); r.className = 'row row-' + it.type;
  const id = 's-' + (it.k || it.a || it.type);
  if(it.type === 'range'){
    const u = it.u ? ' ' + it.u : '';
    r.innerHTML = `<label for="${id}"><span>${it.l}</span><output>${S[it.k]}${u}</output></label><input id="${id}" type="range" min="${it.min}" max="${it.max}" step="${it.step || 1}" value="${S[it.k]}">`;
    const inp = r.querySelector('input'), out = r.querySelector('output');
    const fill = () => inp.style.setProperty('--p', ((inp.value - it.min) / (it.max - it.min) * 100) + '%');
    fill();
    inp.addEventListener('input', () => { out.textContent = inp.value + u; fill(); set(it.k, +inp.value); });
    inp.addEventListener('change', () => { if(RERENDER.includes(it.k)) rerenderSettings('#' + id); });
  } else if(it.type === 'toggle'){
    r.innerHTML = `<label class="switch" for="${id}"><span>${it.l}</span><input id="${id}" type="checkbox" role="switch" ${S[it.k] ? 'checked' : ''}><i></i></label>`;
    r.querySelector('input').addEventListener('change', e => { set(it.k, e.target.checked); if(RERENDER.includes(it.k)) rerenderSettings('#' + id); });
  } else if(it.type === 'chips'){
    r.innerHTML = `<div class="chips-label" id="${id}-l">${it.l}</div><div class="chips" role="radiogroup" aria-labelledby="${id}-l">`
      + it.o.map(([v, l, sw], i) => `<button type="button" role="radio" data-i="${i}" aria-checked="${S[it.k] === v}">${sw ? `<i class="sw" style="background:${sw}"></i>` : ''}${l}</button>`).join('') + '</div>';
    r.querySelectorAll('.chips button').forEach(b => b.addEventListener('click', () => {
      r.querySelectorAll('.chips button').forEach(x => x.setAttribute('aria-checked', x === b));
      set(it.k, it.o[b.dataset.i][0]);
      if(RERENDER.includes(it.k)) rerenderSettings(`[aria-labelledby="${id}-l"] [aria-checked="true"]`);
    }));
  } else if(it.type === 'color'){
    r.innerHTML = `<label for="${id}"><span>${it.l}</span><input id="${id}" type="color" value="${S[it.k]}"></label>`;
    r.querySelector('input').addEventListener('input', e => set(it.k, e.target.value));
  } else if(it.type === 'text'){
    r.innerHTML = `<label for="${id}">${it.l}</label><input id="${id}" type="text" maxlength="30" autocomplete="given-name" placeholder="${esc(it.ph || '')}" value="${esc(S[it.k])}">`;
    const inp = r.querySelector('input');
    inp.addEventListener('input', () => set(it.k, inp.value));
    inp.addEventListener('keydown', e => { if(e.key === 'Enter') inp.blur(); });
  } else if(it.type === 'presets'){
    r.innerHTML = '<div class="presets">' + PRESETS.map(p => {
      const on = ['focus','short','long','cycles'].every(k => S[k] === p[k]);
      return `<button type="button" data-p="${p.id}" aria-pressed="${on}"><b>${p.name}</b><span>${p.focus} · ${p.short} · ${p.long}</span><small>${p.d}</small></button>`;
    }).join('') + '</div>';
    r.querySelectorAll('.presets button').forEach(b => b.addEventListener('click', () => {
      const p = PRESETS.find(x => x.id === b.dataset.p);
      ['focus','short','long','cycles'].forEach(k => { S[k] = p[k]; });
      save(); vib(8);
      if(!st.running && !st.completing && st.remaining === st.total) reset();
      renderDots(); rerenderSettings(); toast(`Profil ${p.name}`, `${p.focus} min de focus, ${p.short} de pause, ${p.long} toutes les ${p.cycles} sessions.`);
    }));
  } else if(it.type === 'action'){
    r.innerHTML = `<button type="button" id="${id}" class="${it.danger ? 'danger' : ''}">${it.l}</button>`;
    const b = r.querySelector('button');
    let armed = 0;
    b.addEventListener('click', () => {
      // les actions qui effacent demandent une deuxième touche
      if(it.danger && !armed){
        b.classList.add('armed'); b.textContent = 'Touche encore pour confirmer';
        armed = setTimeout(() => { armed = 0; b.classList.remove('armed'); b.textContent = it.l; }, 3000);
        return;
      }
      clearTimeout(armed); armed = 0; b.classList.remove('armed'); b.textContent = it.l;
      ACTIONS[it.a]();
    });
  }
  if(it.d){ const p = document.createElement('p'); p.className = 'help'; p.textContent = it.d; r.appendChild(p); }
  return r;
}
function renderSettings(){
  const body = $('#settingsBody'); body.innerHTML = '';
  $('#setNav').innerHTML = SCHEMA.map(s => `<button type="button" data-to="sec-${s.id}">${s.t}</button>`).join('');
  for(const sec of SCHEMA){
    const f = document.createElement('section'); f.className = 'set-sec'; f.id = 'sec-' + sec.id;
    f.innerHTML = `<h3>${sec.t}</h3>${sec.d ? `<p class="sec-d">${sec.d}</p>` : ''}`;
    for(const it of sec.items){ if(it.show && !it.show(S)) continue; f.appendChild(row(it)); }
    body.appendChild(f);
  }
}
$('#setNav').addEventListener('click', e => {
  const b = e.target.closest('button'); if(!b) return;
  const sec = document.getElementById(b.dataset.to), body = $('#drawerBody');
  const top = body.scrollTop + sec.getBoundingClientRect().top - body.getBoundingClientRect().top - $('#setNav').offsetHeight + 8;
  body.scrollTo({ top, behavior: S.motion === 'aucune' ? 'auto' : 'smooth' });
});
// redessine les réglages sans perdre ni la position de défilement, ni le focus
function rerenderSettings(focusSel){
  if(!drawerOpen) return;
  const b = $('#drawerBody'), top = b.scrollTop;
  renderSettings(); b.scrollTop = top;
  if(focusSel) document.querySelector(focusSel)?.focus({ preventScroll:true });
}
function set(k, v){ S[k] = v; save(); apply(k); }
function apply(k){
  if(['focus','short','long'].includes(k)){
    if(k === st.mode && !st.running && !st.completing && st.remaining === st.total) reset();
    return;
  }
  switch(k){
    case 'cycles': case 'goal': case 'streak': renderDots(); renderStats(); break;
    case 'dayStart': renderStats(); break;
    case 'theme': case 'customAccent': case 'accent': applyColors(); break;
    case 'font': applyFont(); break;
    case 'size': applySize(); break;
    case 'dialScale': st.span = spanFor(st.total / MIN); buildScale(); break;
    case 'showLabels': buildScale(); break;
    case 'showSeconds': case 'digitAnim': renderDigits(currentRem(), true); updateTitle(currentRem()); break;
    case 'motion': case 'gloss': case 'halo': case 'grain': case 'showTask': case 'showDots': case 'showStats': applyLook(); break;
    case 'zen': updateUI(); break;
    case 'quotes': updateHint(); break;
    case 'tabTitle': updateTitle(currentRem()); break;
    case 'notify': if(S.notify) askNotify(); break;
    case 'wakeLock': case 'blackout': lockScreen(st.running); break;
    case 'ambient': previewAmbient(); break;
    case 'ambVol': if(amb) amb.out.gain.setTargetAtTime(ambLevel(), ac.currentTime, 0.1); break;
    case 'ambBreaks': syncAmbient(); break;
    case 'bell': ensureAudio(); playBell(1); break;
  }
}
function applyAll(){
  applyColors(); applyFont(); applySize(); applyLook();
  if(!st.running && !st.completing){ st.total = st.remaining = durOf(st.mode); }
  st.span = spanFor(st.total / MIN); buildScale();
  renderDigits(currentRem(), true); updateUI();
}

// tiroirs (réglages et bilan)
const drawer = $('#drawer'), bilan = $('#bilan'), backdrop = $('#backdrop');
let drawerOpen = false, bilanOpen = false, opener = null;
function openPanel(p){
  closePanels(true);
  opener = document.activeElement;
  if(p === drawer){ drawerOpen = true; renderSettings(); $('#drawerBody').scrollTop = 0; }
  else { bilanOpen = true; renderBilan(); }
  p.classList.add('open'); backdrop.classList.add('open');
  setTimeout(() => p.querySelector('.close').focus({ preventScroll:true }), 50);
}
function closePanels(silent){
  if(!drawerOpen && !bilanOpen) return;
  if(drawerOpen && amb && amb.preview) stopAmbient();
  drawer.classList.remove('open'); bilan.classList.remove('open'); backdrop.classList.remove('open');
  drawerOpen = bilanOpen = false;
  if(!silent && opener && opener.focus) opener.focus({ preventScroll:true });
}
$('#openSettings').addEventListener('click', () => openPanel(drawer));
$('#todayBtn').addEventListener('click', () => openPanel(bilan));
document.querySelectorAll('.drawer .close').forEach(b => b.addEventListener('click', () => closePanels()));
backdrop.addEventListener('click', () => closePanels());

// ---------- boutons & clavier ----------
$('#startBtn').addEventListener('click', toggle);
$('#resetBtn').addEventListener('click', () => { reset(); vib(8); });
$('#skipBtn').addEventListener('click', () => { if(!st.completing){ skip(); vib(8); } });
document.querySelectorAll('.modes button').forEach(b => b.addEventListener('click', () => { if(b.dataset.mode !== st.mode) setMode(b.dataset.mode); }));
taskEl.value = (() => { try{ return localStorage.getItem(TASK) || ''; }catch(e){ return ''; } })();
taskEl.addEventListener('input', () => { try{ localStorage.setItem(TASK, taskEl.value); }catch(e){} });
taskEl.addEventListener('keydown', e => { if(e.key === 'Enter') taskEl.blur(); });

document.addEventListener('keydown', e => {
  if(drawerOpen || bilanOpen){ if(e.key === 'Escape') closePanels(); return; }
  if(e.target.matches('input, textarea, select')) return;
  if(e.target === dial && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter'].includes(e.key)) return;
  if(e.key === ' ' && e.target.closest('button')) return;
  if(e.metaKey || e.ctrlKey || e.altKey) return;
  switch(e.key){
    case ' ': e.preventDefault(); toggle(); break;
    case 'r': case 'R': reset(); break;
    case 's': case 'S': if(!st.completing) skip(); break;
    case '1': setMode('focus'); break;
    case '2': setMode('short'); break;
    case '3': setMode('long'); break;
    case ',': openPanel(drawer); break;
    case 'b': case 'B': openPanel(bilan); break;
  }
});

// ---------- go ----------
applyAll();
restoreRun();
requestAnimationFrame(frame);

// Mode hors ligne (ne marche pas en file://, il faut un petit serveur ou GitHub Pages)
if('serviceWorker' in navigator && location.protocol !== 'file:'){
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
})();
