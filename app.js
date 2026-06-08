import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ---------- State ----------
const S = {
  img: null,            // HTMLImageElement
  shape: 'flat',
  width: 100, maxT: 3, minT: 0.6, border: 3, curve: 120, res: 300,
  bri: 0, con: 0, gam: 1, blur: 0,
  invert: true, mirror: false,
};
let mesh = null, geo = null, wireOn = false, bgIdx = 0;
const bgCols = ['radial-gradient(circle at 50% 30%,#161c2b,#0b0e14)','#ffffff','#2b2f3a','#000000'];
let regenTimer = null;

// ---------- Three setup ----------
const host = document.getElementById('canvasHost');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 5000);
camera.position.set(0, -160, 130);
camera.up.set(0, 0, 1);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
host.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;

scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(80, -120, 160); scene.add(key);
const rim = new THREE.DirectionalLight(0x88aaff, 0.7); rim.position.set(-100, 100, 60); scene.add(rim);
// backlight to simulate lithophane glow
const back = new THREE.PointLight(0xfff2d8, 0, 600); back.position.set(0, 60, -40); scene.add(back);

function resize() {
  const w = host.clientWidth, h = host.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(host);
resize();

(function loop() {
  requestAnimationFrame(loop);
  controls.update();
  renderer.render(scene, camera);
})();

// ---------- Image → height sampling ----------
function sampleHeights() {
  // returns {cols, rows, heights:Float32Array(thickness mm), gray:ImageData-ready canvas}
  const aspect = S.img.height / S.img.width;
  const cols = S.res;
  const rows = Math.max(2, Math.round(cols * aspect));
  const c = document.createElement('canvas');
  c.width = cols; c.height = rows;
  const ctx = c.getContext('2d', { willReadFrequently: true });

  ctx.filter = S.blur > 0 ? `blur(${S.blur}px)` : 'none';
  ctx.save();
  if (S.mirror) { ctx.translate(cols, 0); ctx.scale(-1, 1); }
  ctx.drawImage(S.img, 0, 0, cols, rows);
  ctx.restore();
  ctx.filter = 'none';

  const id = ctx.getImageData(0, 0, cols, rows);
  const d = id.data;
  const con = (S.con / 100) * 1.5;       // -1.5..1.5
  const cf = (1 + con) / (1 - con * 0.999);
  const bri = S.bri / 100 * 255;
  const ig = 1 / S.gam;

  const heights = new Float32Array(cols * rows);
  const span = S.maxT - S.minT;
  const borderPx = S.border > 0 ? Math.round(S.border / (S.width / cols)) : 0;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      let lum = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      lum += bri;
      lum = cf * (lum - 128) + 128;       // contrast
      lum = Math.min(255, Math.max(0, lum)) / 255;
      lum = Math.pow(lum, ig);            // gamma
      const L = S.invert ? lum : 1 - lum; // L high = thin
      let t = S.minT + (1 - L) * span;
      // border frame solid at maxT
      if (borderPx > 0 && (x < borderPx || x >= cols - borderPx || y < borderPx || y >= rows - borderPx))
        t = S.maxT;
      heights[y * cols + x] = t;
      // write grayscale back for PNG export (what light sees: brighter where thinner)
      const g = Math.round((S.invert ? lum : 1 - lum) * 255);
      d[i] = d[i + 1] = d[i + 2] = g; d[i + 3] = 255;
    }
  }
  ctx.putImageData(id, 0, 0);
  return { cols, rows, heights, grayCanvas: c };
}

// ---------- Build solid watertight geometry ----------
function buildGeometry() {
  const { cols, rows, heights } = sampleHeights();
  S._cols = cols; S._rows = rows;
  const W = S.width, H = W * (rows / cols);
  const dx = W / (cols - 1), dy = H / (rows - 1);
  const idx = (x, y) => y * cols + x;

  const top = new Float32Array(cols * rows * 3);
  const bot = new Float32Array(cols * rows * 3);

  const place = (px, py, z) => {
    // map flat (px,py in mm centered) + z thickness → 3D by shape
    if (S.shape === 'flat') return [px, py, z];
    if (S.shape === 'curved') {
      const ang = (px / W) * (S.curve * Math.PI / 180);
      const R = W / (S.curve * Math.PI / 180);
      const r = R + z;
      return [r * Math.sin(ang), py, r * Math.cos(ang) - R];
    }
    // cylinder: wrap full 360 around circumference = W
    const ang = (px / W) * Math.PI * 2;
    const R = W / (Math.PI * 2);
    const r = R + z;
    return [r * Math.sin(ang), py, r * Math.cos(ang)];
  };

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const px = x * dx - W / 2, py = H / 2 - y * dy;
      const t = heights[idx(x, y)];
      const o = idx(x, y) * 3;
      const a = place(px, py, t), b = place(px, py, 0);
      top[o] = a[0]; top[o + 1] = a[1]; top[o + 2] = a[2];
      bot[o] = b[0]; bot[o + 1] = b[1]; bot[o + 2] = b[2];
    }
  }

  const pos = [];
  const pushTri = (arr, A, B, C) => {
    const o1 = A * 3, o2 = B * 3, o3 = C * 3;
    pos.push(arr[o1], arr[o1 + 1], arr[o1 + 2], arr[o2], arr[o2 + 1], arr[o2 + 2], arr[o3], arr[o3 + 1], arr[o3 + 2]);
  };
  // top surface
  for (let y = 0; y < rows - 1; y++)
    for (let x = 0; x < cols - 1; x++) {
      const a = idx(x, y), b = idx(x + 1, y), c = idx(x + 1, y + 1), d = idx(x, y + 1);
      pushTri(top, a, b, c); pushTri(top, a, c, d);
    }
  // bottom surface (reversed winding)
  for (let y = 0; y < rows - 1; y++)
    for (let x = 0; x < cols - 1; x++) {
      const a = idx(x, y), b = idx(x + 1, y), c = idx(x + 1, y + 1), d = idx(x, y + 1);
      pushTri(bot, a, c, b); pushTri(bot, a, d, c);
    }
  // side walls connect top edge → bottom edge
  const wall = (A, B) => { // edge from vertex A to B, build quad top/bot
    const ta = A * 3, tb = B * 3;
    pos.push(top[ta], top[ta + 1], top[ta + 2], top[tb], top[tb + 1], top[tb + 2], bot[tb], bot[tb + 1], bot[tb + 2]);
    pos.push(top[ta], top[ta + 1], top[ta + 2], bot[tb], bot[tb + 1], bot[tb + 2], bot[ta], bot[ta + 1], bot[ta + 2]);
  };
  for (let x = 0; x < cols - 1; x++) { wall(idx(x + 1, 0), idx(x, 0)); wall(idx(x, rows - 1), idx(x + 1, rows - 1)); }
  for (let y = 0; y < rows - 1; y++) { wall(idx(0, y), idx(0, y + 1)); wall(idx(cols - 1, y + 1), idx(cols - 1, y)); }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

// ---------- Regenerate scene mesh ----------
function regen() {
  if (!S.img) return;
  document.getElementById('loading').hidden = false;
  // defer so spinner paints
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (mesh) { scene.remove(mesh); geo.dispose(); mesh.material.dispose(); }
    geo = buildGeometry();
    const mat = new THREE.MeshStandardMaterial({
      color: 0xf3ead6, roughness: 0.85, metalness: 0.0,
      side: THREE.DoubleSide, wireframe: wireOn,
      flatShading: false,
    });
    mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    const tris = geo.getAttribute('position').count / 3;
    document.getElementById('stats').textContent = tris.toLocaleString('it-IT') + ' triangoli · ' + S._cols + '×' + S._rows;
    document.getElementById('loading').hidden = true;
  }));
}
function scheduleRegen() { clearTimeout(regenTimer); regenTimer = setTimeout(regen, 180); }

function resetView() {
  controls.reset();
  camera.position.set(0, -S.width * 1.7, S.width * 1.3);
  controls.target.set(0, 0, 0);
}

// ---------- Exporters ----------
function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function exportSTL() {
  if (!geo) return;
  const p = geo.getAttribute('position').array;
  const nTri = p.length / 9;
  const buf = new ArrayBuffer(84 + nTri * 50);
  const dv = new DataView(buf);
  dv.setUint32(80, nTri, true);
  let off = 84;
  const v = new THREE.Vector3(), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3();
  for (let i = 0; i < nTri; i++) {
    const o = i * 9;
    a.set(p[o], p[o + 1], p[o + 2]); b.set(p[o + 3], p[o + 4], p[o + 5]); c.set(p[o + 6], p[o + 7], p[o + 8]);
    n.subVectors(b, a).cross(v.subVectors(c, a)).normalize();
    dv.setFloat32(off, n.x, true); dv.setFloat32(off + 4, n.y, true); dv.setFloat32(off + 8, n.z, true); off += 12;
    for (const pt of [a, b, c]) { dv.setFloat32(off, pt.x, true); dv.setFloat32(off + 4, pt.y, true); dv.setFloat32(off + 8, pt.z, true); off += 12; }
    dv.setUint16(off, 0, true); off += 2;
  }
  download(new Blob([buf], { type: 'application/octet-stream' }), 'lithophane.stl');
}
function exportOBJ() {
  if (!geo) return;
  const p = geo.getAttribute('position').array;
  let s = '# Lithophane Studio\n', f = '';
  const nV = p.length / 3;
  for (let i = 0; i < nV; i++) s += `v ${p[i * 3].toFixed(3)} ${p[i * 3 + 1].toFixed(3)} ${p[i * 3 + 2].toFixed(3)}\n`;
  for (let i = 0; i < nV; i += 3) f += `f ${i + 1} ${i + 2} ${i + 3}\n`;
  download(new Blob([s + f], { type: 'text/plain' }), 'lithophane.obj');
}
function exportPNG() {
  if (!S.img) return;
  // high-res grayscale backing image
  const old = S.res;
  const aspect = S.img.height / S.img.width;
  const big = Math.min(2000, Math.max(S.img.width, 800));
  S.res = big;
  const { grayCanvas } = sampleHeights();
  S.res = old;
  grayCanvas.toBlob(bl => download(bl, 'lithophane-retro.png'), 'image/png');
}

// ---------- UI wiring ----------
const $ = id => document.getElementById(id);
function loadFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const url = URL.createObjectURL(file);
  const im = new Image();
  im.onload = () => {
    S.img = im;
    $('thumb').src = url; $('thumbWrap').hidden = false;
    $('dropzone').querySelector('.drop').hidden = true;
    $('empty').hidden = true;
    resetView();
    regen();
  };
  im.src = url;
}
$('file').addEventListener('change', e => loadFile(e.target.files[0]));
$('clearImg').addEventListener('click', () => {
  S.img = null; if (mesh) { scene.remove(mesh); mesh = null; }
  $('thumbWrap').hidden = true; $('dropzone').querySelector('.drop').hidden = false;
  $('empty').hidden = false; $('stats').textContent = '— triangoli';
});
// drag/drop
const dz = $('dropzone');
['dragover', 'dragenter'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.querySelector('.drop')?.classList.add('over'); }));
['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.querySelector('.drop')?.classList.remove('over'); }));
dz.addEventListener('drop', e => loadFile(e.dataTransfer.files[0]));

// sliders → state. [id, key, label fn]
const sliders = [
  ['width', 'width', v => v + ' mm'], ['maxT', 'maxT', v => (+v).toFixed(1) + ' mm'],
  ['minT', 'minT', v => (+v).toFixed(1) + ' mm'], ['border', 'border', v => v + ' mm'],
  ['curve', 'curve', v => v + '°'], ['res', 'res', v => v + ' px'],
  ['bri', 'bri', v => v], ['con', 'con', v => v], ['gam', 'gam', v => (+v).toFixed(2)],
  ['blur', 'blur', v => (+v).toFixed(1)],
];
const lblMap = { width: 'lblW', maxT: 'lblMax', minT: 'lblMin', border: 'lblBorder', curve: 'lblCurve', res: 'lblRes', bri: 'lblBri', con: 'lblCon', gam: 'lblGam', blur: 'lblBlur' };
sliders.forEach(([id, key, fmt]) => {
  const el = $(id), lbl = $(lblMap[key]);
  const upd = () => { S[key] = parseFloat(el.value); lbl.textContent = fmt(el.value); };
  upd();
  el.addEventListener('input', () => { upd(); scheduleRegen(); });
});
// checkboxes
['invert', 'mirror'].forEach(k => $(k).addEventListener('change', e => { S[k] = e.target.checked; scheduleRegen(); }));
// shape segmented
$('shape').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
  $('shape').querySelectorAll('button').forEach(x => x.classList.remove('active'));
  b.classList.add('active'); S.shape = b.dataset.val;
  $('curveField').hidden = S.shape !== 'curved';
  resetView(); scheduleRegen();
}));

// export buttons
$('exStl').addEventListener('click', exportSTL);
$('exObj').addEventListener('click', exportOBJ);
$('exPng').addEventListener('click', exportPNG);

// viewport tools
$('resetView').addEventListener('click', resetView);
$('wire').addEventListener('click', () => { wireOn = !wireOn; if (mesh) mesh.material.wireframe = wireOn; });
$('bg').addEventListener('click', () => {
  bgIdx = (bgIdx + 1) % bgCols.length;
  document.querySelector('.viewport').style.background = bgCols[bgIdx];
  back.intensity = bgIdx === 3 ? 2.5 : 0; // glow on black bg
});
// view modes 3d / image
$('viewModes').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
  $('viewModes').querySelectorAll('button').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  const imgMode = b.dataset.mode === 'img';
  const cv = $('imgCanvas');
  host.style.display = imgMode ? 'none' : 'block';
  cv.hidden = !imgMode;
  if (imgMode && S.img) {
    const { grayCanvas } = sampleHeights();
    cv.width = grayCanvas.width; cv.height = grayCanvas.height;
    cv.getContext('2d').drawImage(grayCanvas, 0, 0);
  }
}));

resetView();
