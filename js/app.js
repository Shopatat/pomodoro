(() => {
const $ = s => document.querySelector(s);
const KEY = 'pomodoro-settings-v1', STATS = 'pomodoro-stats-v1', TASK = 'pomodoro-task-v1', RUN = 'pomodoro-run-v1';
const MIN = 60000;
const LABEL = { focus:'Focus', short:'Pause courte', long:'Pause longue' };

const DEFAULTS = {
  focus:25, short:5, long:15, cycles:4, goal:8,
  autoBreak:true, autoFocus:false,
  bell:'mecanique', volume:70, tick:false, tickVol:30,
  theme:'auto', customAccent:false, accent:'#ff5a3c', font:'grotesque', dialScale:'classique', size:100,
  showSeconds:true, showLabels:true,
  motion:'complete', digitAnim:true, particles:true, particleCount:90, shake:true, breathe:true,
  notify:false, vibrate:true, wakeLock:false, tabTitle:true, showTask:true
};

const THEMES = {
  tomate:{
    focus:{bg:'#D5382B', onBg:'#FFF1EC', face:'#FFF1EC', ink:'#4A120C', accent:'#D5382B', stem:'#2F7A36'},
    short:{bg:'#3D8B4E', onBg:'#F0FAEF', face:'#F0FAEF', ink:'#123D1C', accent:'#3D8B4E', stem:'#1E5C2A'},
    long: {bg:'#4E3A78', onBg:'#F2EEFB', face:'#F2EEFB', ink:'#261A42', accent:'#4E3A78', stem:'#2F7A36'}
  },
  minuit:{
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
  }
};
const FONTS = {
  grotesque:'"Bricolage Grotesque", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  serif:'"Fraunces", Georgia, "Times New Roman", serif',
  machine:'"Space Mono", ui-monospace, Menlo, Consolas, monospace'
};

// ---------- stockage ----------
function store(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
function read(k){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; }catch(e){ return null; } }
const saved = read(KEY);
let S = Object.assign({}, DEFAULTS, saved || {});
if(!saved && window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) S.motion = 'reduite';
const save = () => store(KEY, S);

const today = () => { const d = new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
let stats = read(STATS);
function checkDate(){ if(!stats || stats.date !== today()) stats = { date:today(), sessions:0, minutes:0 }; }
checkDate();
const saveStats = () => store(STATS, stats);
const savedRun = read(RUN); // lu avant le premier affichage, qui réécrit RUN

// ---------- état ----------
const durOf = m => S[m] * MIN;
const spanFor = totalMin => S.dialScale === 'adaptee' ? Math.max(1, Math.round(totalMin)) : (totalMin <= 60 ? 60 : 120);
const st = { mode:'focus', running:false, total:durOf('focus'), remaining:durOf('focus'), endAt:0, cycle:0,
  span:spanFor(S.focus), dispRot:0, dragging:false, lastSec:-1, lastStr:'', completing:false };

const dial = $('#dial'), wrap = $('#dialWrap'), scaleG = $('#scale'), arc = $('#arc');
const digitsEl = $('#digits'), subEl = $('#sub'), readout = $('#readout'), taskEl = $('#task');
const CIRC = 2 * Math.PI * 128;
const NS = 'http://www.w3.org/2000/svg', C = 200;

function el(tag, attrs){ const e = document.createElementNS(NS, tag); for(const k in attrs) e.setAttribute(k, attrs[k]); return e; }
function polar(r, a){ const rad = (a - 90) * Math.PI / 180; return [+(C + r*Math.cos(rad)).toFixed(2), +(C + r*Math.sin(rad)).toFixed(2)]; }

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
let themeName = 'tomate';
function applyColors(){
  let t = S.theme;
  if(t === 'auto') t = (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) ? 'minuit' : 'tomate';
  themeName = t;
  const p = Object.assign({}, THEMES[t][st.mode]);
  if(S.customAccent) p.accent = S.accent;
  const r = document.documentElement;
  r.style.setProperty('--bg', p.bg); r.style.setProperty('--on-bg', p.onBg); r.style.setProperty('--face', p.face);
  r.style.setProperty('--ink', p.ink); r.style.setProperty('--accent', p.accent); r.style.setProperty('--stem', p.stem);
  r.dataset.theme = t === 'minuit' ? 'dark' : 'light';
  const meta = document.querySelector('meta[name="theme-color"]'); if(meta) meta.setAttribute('content', p.bg);
}
function applyFont(){ document.documentElement.style.setProperty('--font', FONTS[S.font] || FONTS.grotesque); }
function applySize(){ document.documentElement.style.setProperty('--size', S.size / 100); }
function applyMotion(){
  const r = document.documentElement.classList;
  r.toggle('motion-none', S.motion === 'aucune');
}
if(window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { if(S.theme === 'auto') applyColors(); });

// ---------- son ----------
let ac = null;
function ensureAudio(){
  try{ if(!ac) ac = new (window.AudioContext || window.webkitAudioContext)(); if(ac.state === 'suspended') ac.resume(); }
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
function playBell(){
  if(!ensureAudio() || S.bell === 'aucun') return;
  const v = S.volume / 100, t = ac.currentTime + 0.03;
  switch(S.bell){
    case 'mecanique':
      for(let b = 0; b < 2; b++) for(let i = 0; i < 14; i++){
        const tt = t + b*1.25 + i*0.065;
        tone(i % 2 ? 2350 : 2150, tt, 0.22, 0.2*v, 'triangle'); tone(5200, tt, 0.08, 0.04*v);
      }
      break;
    case 'cloche':
      [0, 0.9, 1.8].forEach(k => [[1,.45,2.6],[2.76,.22,1.6],[5.4,.1,.9],[8.93,.05,.5]].forEach(([r,g,d]) => tone(620*r, t+k, d, g*v)));
      break;
    case 'marimba':
      [523.25,659.25,783.99,1046.5,783.99,1046.5].forEach((f,i) => { const tt = t + i*0.13 + (i > 3 ? 0.25 : 0); tone(f, tt, 0.8, 0.38*v); tone(f*4, tt, 0.12, 0.06*v); });
      break;
    case 'doux':
      [[392,493.88,587.33],[440,554.37,659.25]].forEach((ch,k) => ch.forEach(f => tone(f, t + k*1.1, 2.4, 0.13*v, 'sine', 0.35)));
      break;
  }
}
function playTick(sec){ if(!ac) return; tone(sec % 2 ? 1800 : 1350, ac.currentTime, 0.035, 0.22 * (S.volume/100) * (S.tickVol/100), 'square'); }
function playClick(){ if(!ac) return; tone(2800, ac.currentTime, 0.025, 0.12 * S.volume/100, 'triangle'); }
function vib(p){ if(!S.vibrate) return; try{ navigator.vibrate && navigator.vibrate(p); }catch(e){} }

// ---------- écran allumé ----------
let wl = null;
async function lockScreen(on){
  try{
    if(on && S.wakeLock && 'wakeLock' in navigator){ if(!wl){ wl = await navigator.wakeLock.request('screen'); wl.addEventListener('release', () => { wl = null; }); } }
    else if(wl){ await wl.release(); wl = null; }
  }catch(e){ wl = null; }
}
document.addEventListener('visibilitychange', () => { if(!document.hidden) lockScreen(st.running); });

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

function draw(){
  scaleG.setAttribute('transform', `rotate(${st.dispRot.toFixed(3)} 200 200)`);
  let a = Math.min(360, Math.max(0, -st.dispRot));
  arc.setAttribute('stroke-dasharray', `${(a/360*CIRC).toFixed(2)} ${CIRC.toFixed(2)}`);
  arc.setAttribute('transform', `rotate(${(-90 - a).toFixed(3)} 200 200)`);

  if(st.running && st.mode !== 'focus' && S.breathe && S.motion !== 'aucune'){
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
    if(st.running && sec < st.lastSec && S.tick && st.mode === 'focus' && sec > 0) playTick(sec);
    st.lastSec = sec; renderDigits(rem); updateTitle(rem);
  }
  if(st.running && rem <= 0) complete(true);
}

function frame(){
  const rem = currentRem();
  const target = -(rem / MIN) * (360 / st.span);
  const k = S.motion === 'aucune' ? 1 : (st.dragging ? 0.45 : (S.motion === 'reduite' ? 0.3 : 0.12));
  st.dispRot += (target - st.dispRot) * k;
  if(Math.abs(target - st.dispRot) < 0.01) st.dispRot = target;
  draw(); tick(rem);
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
function toast(msg){ const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600); }
function announce(msg){ $('#live').textContent = msg; }

// ---------- logique ----------
function updateUI(){
  document.querySelectorAll('.modes button').forEach(b => b.setAttribute('aria-selected', b.dataset.mode === st.mode));
  const rem = currentRem();
  $('#startBtn').textContent = st.running ? 'Pause' : (rem > 0 && rem < st.total ? 'Reprendre' : 'Démarrer');
  document.body.classList.toggle('running', st.running);
  renderDots(); renderStats(); updateTitle(rem); renderDigits(rem);
  lockScreen(st.running); saveRun();
}
// Sur iPhone, une appli en arrière-plan peut être fermée sans prévenir : on garde le minuteur en cours pour le reprendre au retour.
function saveRun(){ store(RUN, { mode:st.mode, running:st.running, endAt:st.endAt, remaining:st.remaining, total:st.total, cycle:st.cycle }); }
function restoreRun(){
  const r = savedRun;
  if(!r || !LABEL[r.mode] || st.completing) return;
  st.cycle = Math.max(0, Math.min(r.cycle | 0, S.cycles));
  prevCycle = st.cycle;
  st.mode = r.mode;
  if(r.remaining > 0 || r.running){
    st.total = r.total; st.remaining = r.remaining; st.running = !!r.running; st.endAt = r.endAt;
  } else st.total = st.remaining = durOf(r.mode);
  st.span = spanFor(st.total / MIN); buildScale(); applyColors(); updateUI();
}
function start(){
  ensureAudio();
  if(st.running || st.completing) return;
  if(st.remaining <= 0) st.remaining = st.total;
  st.running = true; st.endAt = Date.now() + st.remaining;
  if(S.motion !== 'aucune') flash('pulse', 800);
  burst(14, 0.55); vib(15);
  updateUI();
}
function pause(){ if(!st.running) return; st.remaining = Math.max(0, st.endAt - Date.now()); st.running = false; updateUI(); }
function toggle(){ st.running ? pause() : start(); }
function reset(){
  if(st.completing) return;
  st.running = false; st.total = st.remaining = durOf(st.mode);
  st.span = spanFor(S[st.mode]); buildScale(); updateUI();
}
function setMode(m, auto){
  st.completing = false; st.mode = m; st.running = false;
  st.total = st.remaining = durOf(m); st.span = spanFor(S[m]);
  buildScale(); applyColors(); updateUI();
  if(auto) start();
}
function complete(natural){
  if(st.completing) return;
  const was = st.mode;
  st.running = false; st.remaining = 0; st.completing = true;
  let next, auto = false;
  if(was === 'focus'){
    if(natural){ checkDate(); stats.sessions++; stats.minutes += Math.round(st.total / MIN); saveStats(); st.cycle++; }
    next = st.cycle >= S.cycles ? 'long' : 'short';
    auto = natural && S.autoBreak;
  } else {
    if(was === 'long') st.cycle = 0;
    next = 'focus'; auto = natural && S.autoFocus;
  }
  if(natural){
    playBell(); burst(S.particleCount, 1); vib([140, 70, 140, 70, 220]);
    if(S.shake && S.motion === 'complete') flash('ringing', 1400);
    notifyEnd(was);
    announce(was === 'focus' ? 'Focus terminé, place à la pause.' : 'Pause terminée, on y retourne.');
  }
  updateUI();
  setTimeout(() => setMode(next, auto), natural ? 1100 : 0);
}
function skip(){ complete(false); }

async function notifyEnd(m){
  if(!S.notify || !('Notification' in window) || Notification.permission !== 'granted') return;
  const title = m === 'focus' ? 'Focus terminé' : 'Pause terminée';
  const opts = { body: m === 'focus' ? 'Lève-toi, souffle un peu.' : 'Allez, on y retourne.', icon:'icons/icon-192.png', tag:'pomodoro' };
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
    S.notify = false; save(); renderSettings();
    toast(isIOS && !standalone ? 'Ajoute d\'abord l\'appli à l\'écran d\'accueil pour les notifications' : 'Ton navigateur bloque les notifications sur cette page');
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
function renderStats(){
  checkDate();
  const s = stats.sessions, g = S.goal, m = stats.minutes;
  const time = m >= 60 ? `${Math.floor(m/60)} h ${String(m % 60).padStart(2,'0')}` : `${m} min`;
  $('#statsText').textContent = s >= g
    ? `Objectif atteint : ${s} sessions, ${time} de focus`
    : `${s} sur ${g} sessions aujourd’hui${m ? `, ${time} de focus` : ''}`;
  $('#goalBar').style.width = Math.min(100, s / g * 100) + '%';
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
  if(e.button > 0 || st.completing) return;
  ensureAudio();
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
    e.preventDefault(); ensureAudio();
    const was = st.running; if(was){ st.remaining = currentRem(); st.running = false; }
    const cur = Math.ceil(st.remaining / MIN - 1e-9);
    const v = Math.max(1, Math.min(120, cur + (k === 'ArrowUp' || k === 'ArrowRight' ? 1 : -1)));
    setMinutes(v); playClick();
    st.span = spanFor(v); buildScale();
    if(was) start(); else updateUI();
  } else if(k === 'Enter'){ e.preventDefault(); toggle(); }
});

// ---------- réglages ----------
const SCHEMA = [
  { t:'Durées', items:[
    {k:'focus', l:'Focus', type:'range', min:1, max:120, u:'min'},
    {k:'short', l:'Pause courte', type:'range', min:1, max:30, u:'min'},
    {k:'long', l:'Pause longue', type:'range', min:5, max:60, u:'min'},
    {k:'cycles', l:'Focus avant la pause longue', type:'range', min:2, max:8},
    {k:'goal', l:'Objectif du jour', type:'range', min:1, max:16, u:'sessions'}
  ]},
  { t:'Enchaînement', items:[
    {k:'autoBreak', l:'Lancer la pause toute seule', type:'toggle'},
    {k:'autoFocus', l:'Relancer le focus après la pause', type:'toggle'}
  ]},
  { t:'Son', items:[
    {k:'bell', l:'Sonnerie', type:'chips', o:[['mecanique','Mécanique'],['cloche','Cloche'],['marimba','Marimba'],['doux','Douce'],['aucun','Aucune']]},
    {k:'volume', l:'Volume', type:'range', min:0, max:100, step:5, u:'%'},
    {type:'action', l:'Écouter la sonnerie', a:'testBell'},
    {k:'tick', l:'Tic-tac pendant le focus', type:'toggle'},
    {k:'tickVol', l:'Volume du tic-tac', type:'range', min:0, max:100, step:5, u:'%', show:s => s.tick}
  ]},
  { t:'Apparence', items:[
    {k:'theme', l:'Thème', type:'chips', o:[['auto','Auto'],['tomate','Tomate'],['minuit','Minuit'],['papier','Papier'],['agrume','Agrume']]},
    {k:'customAccent', l:'Couleur d’accent perso', type:'toggle'},
    {k:'accent', l:'Ta couleur', type:'color', show:s => s.customAccent},
    {k:'font', l:'Police', type:'chips', o:[['grotesque','Grotesque'],['serif','Sérif'],['machine','Machine à écrire']]},
    {k:'dialScale', l:'Graduation du cadran', type:'chips', o:[['classique','60 min, comme un vrai'],['adaptee','Un tour par session']]},
    {k:'size', l:'Taille du cadran', type:'range', min:60, max:100, step:5, u:'%'},
    {k:'showSeconds', l:'Afficher les secondes', type:'toggle'},
    {k:'showLabels', l:'Chiffres sur le cadran', type:'toggle'}
  ]},
  { t:'Animations', items:[
    {k:'motion', l:'Niveau', type:'chips', o:[['complete','Complètes'],['reduite','Réduites'],['aucune','Aucune']]},
    {k:'digitAnim', l:'Chiffres qui défilent', type:'toggle'},
    {k:'particles', l:'Pluie de pépins à la fin', type:'toggle'},
    {k:'particleCount', l:'Nombre de pépins', type:'range', min:20, max:250, step:10, show:s => s.particles},
    {k:'shake', l:'Le minuteur tremble quand il sonne', type:'toggle'},
    {k:'breathe', l:'Respiration guidée pendant les pauses', type:'toggle'}
  ]},
  { t:'Divers', items:[
    {k:'notify', l:'Notifications', type:'toggle'},
    {k:'vibrate', l:'Vibrations', type:'toggle'},
    {k:'wakeLock', l:'Garder l’écran allumé', type:'toggle'},
    {k:'tabTitle', l:'Temps dans le titre de l’onglet', type:'toggle'},
    {k:'showTask', l:'Champ « sur quoi tu bosses »', type:'toggle'},
    {type:'action', l:'Effacer les stats du jour', a:'clearStats'},
    {type:'action', l:'Remettre les réglages par défaut', a:'resetSettings', danger:true}
  ]}
];
const RERENDER = ['tick','customAccent','particles'];
const ACTIONS = {
  testBell(){ ensureAudio(); playBell(); },
  clearStats(){ stats = { date:today(), sessions:0, minutes:0 }; saveStats(); st.cycle = 0; prevCycle = 0; renderDots(); renderStats(); toast('Stats du jour effacées'); },
  resetSettings(){ S = Object.assign({}, DEFAULTS); save(); applyAll(); renderSettings(); toast('Réglages par défaut remis'); }
};

function row(it){
  const r = document.createElement('div'); r.className = 'row row-' + it.type;
  const id = 's-' + (it.k || it.a);
  if(it.type === 'range'){
    const u = it.u ? ' ' + it.u : '';
    r.innerHTML = `<label for="${id}"><span>${it.l}</span><output>${S[it.k]}${u}</output></label><input id="${id}" type="range" min="${it.min}" max="${it.max}" step="${it.step || 1}" value="${S[it.k]}">`;
    const inp = r.querySelector('input'), out = r.querySelector('output');
    inp.addEventListener('input', () => { out.textContent = inp.value + u; set(it.k, +inp.value); });
  } else if(it.type === 'toggle'){
    r.innerHTML = `<label class="switch" for="${id}"><span>${it.l}</span><input id="${id}" type="checkbox" role="switch" ${S[it.k] ? 'checked' : ''}><i></i></label>`;
    r.querySelector('input').addEventListener('change', e => set(it.k, e.target.checked, id));
  } else if(it.type === 'chips'){
    r.innerHTML = `<div class="chips-label" id="${id}-l">${it.l}</div><div class="chips" role="radiogroup" aria-labelledby="${id}-l">`
      + it.o.map(([v, l]) => `<button type="button" role="radio" data-v="${v}" aria-checked="${S[it.k] === v}">${l}</button>`).join('') + '</div>';
    r.querySelectorAll('.chips button').forEach(b => b.addEventListener('click', () => {
      r.querySelectorAll('.chips button').forEach(x => x.setAttribute('aria-checked', x === b));
      set(it.k, b.dataset.v);
    }));
  } else if(it.type === 'color'){
    r.innerHTML = `<label for="${id}"><span>${it.l}</span><input id="${id}" type="color" value="${S[it.k]}"></label>`;
    r.querySelector('input').addEventListener('input', e => set(it.k, e.target.value));
  } else if(it.type === 'action'){
    r.innerHTML = `<button type="button" id="${id}" class="${it.danger ? 'danger' : ''}">${it.l}</button>`;
    r.querySelector('button').addEventListener('click', () => ACTIONS[it.a]());
  }
  return r;
}
function renderSettings(){
  const body = $('#settingsBody'); body.innerHTML = '';
  for(const sec of SCHEMA){
    const f = document.createElement('section'); f.className = 'set-sec';
    f.innerHTML = `<h3>${sec.t}</h3>`;
    for(const it of sec.items){ if(it.show && !it.show(S)) continue; f.appendChild(row(it)); }
    body.appendChild(f);
  }
}
function set(k, v, focusId){
  S[k] = v; save(); apply(k);
  if(RERENDER.includes(k)){
    const b = $('#drawerBody'), top = b.scrollTop;
    renderSettings(); b.scrollTop = top;
    if(focusId) document.getElementById(focusId)?.focus();
  }
}
function apply(k){
  if(['focus','short','long'].includes(k)){
    if(k === st.mode && !st.running && !st.completing && st.remaining === st.total) reset();
    return;
  }
  switch(k){
    case 'cycles': case 'goal': renderDots(); renderStats(); break;
    case 'theme': case 'customAccent': case 'accent': applyColors(); break;
    case 'font': applyFont(); break;
    case 'size': applySize(); break;
    case 'dialScale': st.span = spanFor(st.total / MIN); buildScale(); break;
    case 'showLabels': buildScale(); break;
    case 'showSeconds': case 'digitAnim': renderDigits(currentRem(), true); updateTitle(currentRem()); break;
    case 'motion': applyMotion(); break;
    case 'showTask': taskEl.hidden = !S.showTask; break;
    case 'tabTitle': updateTitle(currentRem()); break;
    case 'notify': if(S.notify) askNotify(); break;
    case 'wakeLock': lockScreen(st.running); break;
  }
}
function applyAll(){
  applyColors(); applyFont(); applySize(); applyMotion();
  taskEl.hidden = !S.showTask;
  if(!st.running && !st.completing){ st.total = st.remaining = durOf(st.mode); }
  st.span = spanFor(st.total / MIN); buildScale();
  renderDigits(currentRem(), true); updateUI();
}

// tiroir
const drawer = $('#drawer'), backdrop = $('#backdrop');
let drawerOpen = false;
function openDrawer(){ renderSettings(); drawer.classList.add('open'); backdrop.classList.add('open'); drawerOpen = true; setTimeout(() => $('#closeSettings').focus(), 50); }
function closeDrawer(){ drawer.classList.remove('open'); backdrop.classList.remove('open'); drawerOpen = false; $('#openSettings').focus(); }
$('#openSettings').addEventListener('click', openDrawer);
$('#closeSettings').addEventListener('click', closeDrawer);
backdrop.addEventListener('click', closeDrawer);

// ---------- boutons & clavier ----------
$('#startBtn').addEventListener('click', toggle);
$('#resetBtn').addEventListener('click', () => { reset(); vib(8); });
$('#skipBtn').addEventListener('click', () => { if(!st.completing){ skip(); vib(8); } });
document.querySelectorAll('.modes button').forEach(b => b.addEventListener('click', () => { if(b.dataset.mode !== st.mode) setMode(b.dataset.mode); }));
taskEl.value = (() => { try{ return localStorage.getItem(TASK) || ''; }catch(e){ return ''; } })();
taskEl.addEventListener('input', () => { try{ localStorage.setItem(TASK, taskEl.value); }catch(e){} });
taskEl.addEventListener('keydown', e => { if(e.key === 'Enter') taskEl.blur(); });

document.addEventListener('keydown', e => {
  if(drawerOpen){ if(e.key === 'Escape') closeDrawer(); return; }
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
    case ',': openDrawer(); break;
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
