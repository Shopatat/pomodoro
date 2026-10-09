// Dessine les icônes de l'appli (la tomate-minuteur) et les range dans icons/.
// Lancer depuis la racine du dossier : node outils/icones.js
// Aucun module à installer : le PNG est encodé à la main avec zlib.
const fs = require('fs'), zlib = require('zlib'), path = require('path');

const hex = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
const RED = hex('#D5382B'), FACE = hex('#FFF1EC'), INK = hex('#4A120C'), GREEN = hex('#2F7A36');
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const TRACK = mix(FACE, INK, 0.07), RIDGE = mix(FACE, INK, 0.2);

// Repère : 0..1, y vers le bas. Cadran centré un peu plus bas pour laisser la place à la queue.
const CX = 0.5, CY = 0.545, R = 0.335;
const deg = Math.PI / 180;
const ang = (x, y) => { let a = Math.atan2(x - CX, -(y - CY)) / deg; return a < 0 ? a + 360 : a; }; // 0 en haut, sens horaire
const dist = (x, y) => Math.hypot(x - CX, y - CY);

// Sépales : étoile à 5 branches posée en haut du cadran (comme l'aiguille de l'appli)
const star = (() => {
  const pts = [], sx = CX, sy = CY - R + 0.005;
  for(let i = 0; i < 10; i++){ const a = Math.PI/2 + i*Math.PI/5, r = i % 2 ? 0.032 : 0.095; pts.push([sx + r*Math.cos(a), sy + r*Math.sin(a)]); }
  return pts;
})();
function inPoly(x, y, p){
  let inside = false;
  for(let i = 0, j = p.length - 1; i < p.length; j = i++){
    const [xi, yi] = p[i], [xj, yj] = p[j];
    if((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// Couleur d'un point : formes peintes de l'arrière vers l'avant
function color(x, y, maskable){
  let c = RED;
  const d = dist(x, y), a = ang(x, y);
  if(d <= R) c = FACE;
  // graduations (toutes les 5 min sur 60)
  if(d <= R - 0.012 && d >= R - 0.05){
    const m = a / 6, near = Math.abs(m - Math.round(m));
    const major = Math.round(m) % 5 === 0;
    const w = (major ? 0.0085 : 0.004) / (d * 6 * deg);
    if(near < w && (major || d >= R - 0.032)) c = major ? INK : mix(FACE, INK, 0.4);
  }
  // anneau : il reste 25 min, l'arc rouge part du haut vers la gauche
  if(d >= 0.205 && d <= 0.245) c = a >= 360 - 150 ? RED : TRACK;
  // bouton central strié
  if(d <= 0.188) c = FACE;
  if(d <= 0.188 && d >= 0.183) c = mix(FACE, INK, 0.14);
  if(d >= 0.155 && d <= 0.172){ const m = a / 9; if(Math.abs(m - Math.round(m)) < 0.13) c = RIDGE; }
  if(Math.hypot(x - CX, y - (CY - 0.125)) <= 0.016) c = RED;
  // queue et sépales
  if(Math.abs(x - CX) <= 0.014 && y >= CY - R - 0.075 && y <= CY - R) c = GREEN;
  if(inPoly(x, y, star)) c = GREEN;
  return c;
}

function render(size, maskable){
  const ss = 4, px = Buffer.alloc(size * size * 3);
  // l'icône maskable est un peu réduite pour rester dans la zone sûre
  const k = maskable ? 0.9 : 1;
  for(let j = 0; j < size; j++) for(let i = 0; i < size; i++){
    let r = 0, g = 0, b = 0;
    for(let sj = 0; sj < ss; sj++) for(let si = 0; si < ss; si++){
      const x = ((i + (si + .5) / ss) / size - .5) / k + .5, y = ((j + (sj + .5) / ss) / size - .5) / k + .5;
      const c = color(x, y, maskable); r += c[0]; g += c[1]; b += c[2];
    }
    const o = (j * size + i) * 3, n = ss * ss;
    px[o] = Math.round(r / n); px[o+1] = Math.round(g / n); px[o+2] = Math.round(b / n);
  }
  return png(size, px);
}

// --- encodeur PNG (RVB 8 bits) ---
const CRC = new Int32Array(256).map((_, n) => { let c = n; for(let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc32 = buf => { let c = -1; for(const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function chunk(type, data){
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]), crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, px){
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for(let y = 0; y < size; y++){ raw[y * (size * 3 + 1)] = 0; px.copy(raw, y * (size * 3 + 1) + 1, y * size * 3, (y + 1) * size * 3); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level:9 })), chunk('IEND', Buffer.alloc(0))]);
}

const out = path.join(__dirname, '..', 'icons');
fs.mkdirSync(out, { recursive:true });
for(const [name, size, maskable] of [['icon-192.png',192], ['icon-512.png',512], ['icon-maskable-512.png',512,true], ['apple-touch-icon.png',180], ['favicon-32.png',32]]){
  fs.writeFileSync(path.join(out, name), render(size, maskable));
  console.log('icons/' + name);
}
