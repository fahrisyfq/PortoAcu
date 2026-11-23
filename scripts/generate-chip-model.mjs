import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const ROOT = resolve(import.meta.dirname, '..');
const MODEL_PATH = resolve(ROOT, 'public/models/chip.glb');
const POSTER_PATH = resolve(ROOT, 'public/images/chip-poster.webp');

const materials = [
  { name: 'PCB', base: [0.015, 0.085, 0.045, 1], metallic: 0.25, roughness: 0.6 },
  { name: 'ChipBody', base: [0.012, 0.014, 0.02, 1], metallic: 0.2, roughness: 0.5 },
  { name: 'ChipTop', base: [0.07, 0.09, 0.13, 1], metallic: 0.6, roughness: 0.35 },
  { name: 'Pin', base: [0.85, 0.66, 0.26, 1], metallic: 0.95, roughness: 0.25 },
  { name: 'Trace', base: [0.05, 0.18, 0.45, 1], emissive: [0.1, 0.35, 1], metallic: 0.4, roughness: 0.3 },
  { name: 'Pad', base: [0.8, 0.62, 0.24, 1], metallic: 0.95, roughness: 0.3 },
  { name: 'CapBody', base: [0.1, 0.22, 0.45, 1], metallic: 0.55, roughness: 0.35 },
  { name: 'CapTop', base: [0.55, 0.6, 0.68, 1], metallic: 0.9, roughness: 0.25 },
  { name: 'LED', base: [0.2, 0.7, 1, 1], emissive: [0.15, 0.55, 1], metallic: 0.2, roughness: 0.3 },
  { name: 'Silk', base: [0.6, 0.68, 0.78, 1], metallic: 0.1, roughness: 0.8 },
  { name: 'Silver', base: [0.5, 0.55, 0.62, 1], metallic: 0.9, roughness: 0.3 },
];

const MAT = Object.fromEntries(materials.map((m, i) => [m.name, i]));

const boxes = [];
const box = (mat, cx, cy, cz, sx, sy, sz) => {
  boxes.push({ mat: MAT[mat], cx, cy, cz, sx, sy, sz });
};

// PCB base — top surface at y = 0.06
box('PCB', 0, 0, 0, 2.4, 0.12, 1.6);

// Main IC
box('ChipBody', 0.35, 0.16, 0.1, 0.72, 0.2, 0.72);
box('ChipTop', 0.35, 0.272, 0.1, 0.56, 0.024, 0.56);
box('Trace', 0.13, 0.29, -0.12, 0.05, 0.02, 0.05);

for (let i = 0; i < 4; i++) {
  const z = 0.1 + (i - 1.5) * 0.16;
  box('Pin', -0.05, 0.085, z, 0.08, 0.05, 0.08);
  box('Pin', 0.75, 0.085, z, 0.08, 0.05, 0.08);
}

// Secondary IC
box('ChipBody', -0.55, 0.125, -0.3, 0.46, 0.13, 0.36);
box('ChipTop', -0.55, 0.198, -0.3, 0.34, 0.016, 0.26);

for (let i = 0; i < 3; i++) {
  const z = -0.3 + (i - 1) * 0.1;
  box('Pin', -0.81, 0.08, z, 0.06, 0.04, 0.06);
  box('Pin', -0.29, 0.08, z, 0.06, 0.04, 0.06);
}

// Capacitors
const cap = (x, z, w, h) => {
  box('CapBody', x, 0.06 + h / 2, z, w, h, w);
  box('CapTop', x, 0.06 + h + 0.01, z, w * 0.86, 0.02, w * 0.86);
};
cap(-0.95, 0.45, 0.16, 0.24);
cap(-0.68, 0.45, 0.12, 0.18);
cap(0.95, -0.45, 0.14, 0.2);

// USB-C connector on the right edge
box('Silver', 1.16, 0.11, 0, 0.14, 0.1, 0.28);

// LEDs
box('LED', 0.98, 0.075, 0.62, 0.08, 0.03, 0.08);
box('LED', -0.95, 0.075, -0.62, 0.07, 0.03, 0.07);

// Traces on the board surface (y = 0.068)
const trace = (cx, cz, sx, sz) => box('Trace', cx, 0.068, cz, sx, 0.016, sz);
trace(-0.1, 0.55, 1.9, 0.04);
trace(-1.0, -0.15, 0.04, 0.9);
trace(1.0, 0.2, 0.04, 0.9);
trace(0.55, -0.55, 1.1, 0.04);
trace(0.05, 0.3, 0.72, 0.04);
trace(0.4, 0.42, 0.04, 0.28);
trace(-0.35, 0.0, 0.04, 0.6);
trace(0.05, -0.1, 0.68, 0.04);

// Gold pads at trace ends and corners
const pad = (x, z) => box('Pad', x, 0.078, z, 0.09, 0.02, 0.09);
pad(-1.05, 0.55);
pad(0.85, 0.55);
pad(-1.0, 0.3);
pad(-1.0, -0.6);
pad(1.0, -0.25);
pad(1.0, 0.65);
pad(0.2, -0.55);
pad(0.9, -0.55);
pad(-0.35, -0.3);
pad(-0.35, 0.3);
for (const [x, z] of [
  [-1.08, 0.72],
  [1.08, 0.72],
  [-1.08, -0.72],
  [1.08, -0.72],
]) {
  box('Pad', x, 0.075, z, 0.13, 0.02, 0.13);
}

// Silkscreen marks
for (let i = 0; i < 4; i++) {
  box('Silk', 0.35 + (i - 1.5) * 0.16, 0.065, 0.48, 0.08, 0.008, 0.02);
}

const FACES = [
  { n: [1, 0, 0], v: [[1, -1, 1], [1, -1, -1], [1, 1, -1], [1, 1, 1]] },
  { n: [-1, 0, 0], v: [[-1, -1, -1], [-1, -1, 1], [-1, 1, 1], [-1, 1, -1]] },
  { n: [0, 1, 0], v: [[-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, 1, -1]] },
  { n: [0, -1, 0], v: [[-1, -1, -1], [1, -1, -1], [1, -1, 1], [-1, -1, 1]] },
  { n: [0, 0, 1], v: [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]] },
  { n: [0, 0, -1], v: [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]] },
];

const groups = materials.map(() => ({
  positions: [],
  normals: [],
  indices: [],
  min: [Infinity, Infinity, Infinity],
  max: [-Infinity, -Infinity, -Infinity],
}));

for (const b of boxes) {
  const g = groups[b.mat];
  const base = g.positions.length / 3;
  const hx = b.sx / 2;
  const hy = b.sy / 2;
  const hz = b.sz / 2;

  for (const face of FACES) {
    for (const v of face.v) {
      const x = b.cx + v[0] * hx;
      const y = b.cy + v[1] * hy;
      const z = b.cz + v[2] * hz;
      g.positions.push(x, y, z);
      g.normals.push(face.n[0], face.n[1], face.n[2]);
      g.min[0] = Math.min(g.min[0], x);
      g.min[1] = Math.min(g.min[1], y);
      g.min[2] = Math.min(g.min[2], z);
      g.max[0] = Math.max(g.max[0], x);
      g.max[1] = Math.max(g.max[1], y);
      g.max[2] = Math.max(g.max[2], z);
    }
    const o = base + FACES.indexOf(face) * 4;
    g.indices.push(o, o + 1, o + 2, o, o + 2, o + 3);
  }
}

function pad4(buffer, fill = 0) {
  const r = buffer.length % 4;
  if (r === 0) return buffer;
  return Buffer.concat([buffer, Buffer.alloc(4 - r, fill)]);
}

function buildGlb() {
  const bufferViews = [];
  const accessors = [];
  const chunks = [];
  let offset = 0;

  const addView = (buf, target) => {
    if (offset % 4 !== 0) {
      const padding = Buffer.alloc(4 - (offset % 4));
      chunks.push(padding);
      offset += padding.length;
    }
    const index = bufferViews.length;
    bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: buf.length, ...(target ? { target } : {}) });
    chunks.push(buf);
    offset += buf.length;
    return index;
  };

  const primitives = [];

  groups.forEach((g, materialIndex) => {
    if (g.indices.length === 0) return;

    const positions = new Float32Array(g.positions);
    const normals = new Float32Array(g.normals);
    const indices = new Uint16Array(g.indices);

    const posView = addView(Buffer.from(positions.buffer), 34962);
    const normView = addView(Buffer.from(normals.buffer), 34962);
    const idxView = addView(Buffer.from(indices.buffer), 34963);

    const posAccessor = accessors.length;
    accessors.push({
      bufferView: posView,
      componentType: 5126,
      count: positions.length / 3,
      type: 'VEC3',
      min: g.min,
      max: g.max,
    });
    const normAccessor = accessors.length;
    accessors.push({ bufferView: normView, componentType: 5126, count: normals.length / 3, type: 'VEC3' });
    const idxAccessor = accessors.length;
    accessors.push({ bufferView: idxView, componentType: 5123, count: indices.length, type: 'SCALAR' });

    primitives.push({
      attributes: { POSITION: posAccessor, NORMAL: normAccessor },
      indices: idxAccessor,
      material: materialIndex,
    });
  });

  const bin = Buffer.concat(chunks);

  const gltf = {
    asset: { version: '2.0', generator: 'PortoAku PCB generator' },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: 'PCB' }],
    meshes: [{ primitives }],
    materials: materials.map((m) => ({
      name: m.name,
      pbrMetallicRoughness: {
        baseColorFactor: m.base,
        metallicFactor: m.metallic,
        roughnessFactor: m.roughness,
      },
      ...(m.emissive ? { emissiveFactor: m.emissive } : {}),
    })),
    accessors,
    bufferViews,
    buffers: [{ byteLength: bin.length }],
  };

  const jsonChunk = pad4(Buffer.from(JSON.stringify(gltf), 'utf8'), 0x20);
  const binChunk = pad4(bin, 0);
  const total = 12 + 8 + jsonChunk.length + 8 + binChunk.length;

  const glb = Buffer.alloc(total);
  glb.writeUInt32LE(0x46546c67, 0);
  glb.writeUInt32LE(2, 4);
  glb.writeUInt32LE(total, 8);
  glb.writeUInt32LE(jsonChunk.length, 12);
  glb.writeUInt32LE(0x4e4f534a, 16);
  jsonChunk.copy(glb, 20);
  const binStart = 20 + jsonChunk.length;
  glb.writeUInt32LE(binChunk.length, binStart);
  glb.writeUInt32LE(0x004e4942, binStart + 4);
  binChunk.copy(glb, binStart + 8);
  return glb;
}

function posterSvg() {
  const pins = [];
  for (let i = 0; i < 4; i++) {
    const y = 430 + i * 34;
    pins.push(`<rect x="404" y="${y}" width="22" height="12" rx="3" fill="#d9b45b"/>`);
    pins.push(`<rect x="574" y="${y}" width="22" height="12" rx="3" fill="#d9b45b"/>`);
  }
  return `<svg width="1000" height="1000" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="78%">
      <stop offset="0%" stop-color="#1e3f78"/>
      <stop offset="45%" stop-color="#152850"/>
      <stop offset="100%" stop-color="#0e1e3a"/>
    </radialGradient>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="shadow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="22" stdDeviation="28" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>
  <rect width="1000" height="1000" fill="url(#bg)"/>
  <g transform="rotate(-11 500 500)" filter="url(#shadow)">
    <rect x="200" y="300" width="600" height="400" rx="30" fill="#0b3b28" stroke="#1f6f52" stroke-width="4"/>
    <g stroke="#4c8dff" stroke-width="6" stroke-linecap="round" opacity="0.9" filter="url(#glow)">
      <line x1="260" y1="360" x2="740" y2="360"/>
      <line x1="260" y1="640" x2="620" y2="640"/>
      <line x1="300" y1="340" x2="300" y2="660"/>
      <line x1="720" y1="340" x2="720" y2="600"/>
      <line x1="260" y1="520" x2="380" y2="520"/>
      <line x1="380" y1="520" x2="380" y2="600"/>
    </g>
    <rect x="410" y="400" width="180" height="170" rx="10" fill="#0a0f18" stroke="#24324a" stroke-width="4"/>
    <rect x="300" y="450" width="90" height="80" rx="8" fill="#0a0f18" stroke="#24324a" stroke-width="3"/>
    ${pins.join('')}
    <circle cx="660" cy="420" r="20" fill="#1c4a8a" stroke="#8fb8ff" stroke-width="3"/>
    <circle cx="700" cy="470" r="14" fill="#1c4a8a" stroke="#8fb8ff" stroke-width="3"/>
    <rect x="620" y="620" width="30" height="30" rx="5" fill="#d9b45b"/>
    <rect x="260" y="620" width="26" height="26" rx="5" fill="#d9b45b"/>
    <rect x="260" y="340" width="26" height="26" rx="5" fill="#d9b45b"/>
    <rect x="714" y="340" width="26" height="26" rx="5" fill="#d9b45b"/>
    <rect x="486" y="312" width="28" height="10" rx="4" fill="#4c8dff" filter="url(#glow)"/>
  </g>
</svg>`;
}

async function main() {
  const glb = buildGlb();
  await mkdir(dirname(MODEL_PATH), { recursive: true });
  await writeFile(MODEL_PATH, glb);

  await sharp(Buffer.from(posterSvg()))
    .resize(1000, 1000)
    .webp({ quality: 88 })
    .toFile(POSTER_PATH);

  console.log(`Wrote ${MODEL_PATH} (${glb.length} bytes)`);
  console.log(`Wrote ${POSTER_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
