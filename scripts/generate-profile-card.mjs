import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const ROOT = resolve(import.meta.dirname, '..');
const CUTOUT_PATH = resolve(ROOT, 'src/assets/images/profile-cutout.png');
const MODEL_PATH = resolve(ROOT, 'public/models/profile.glb');
const POSTER_PATH = resolve(ROOT, 'public/images/profile-poster.webp');

const CARD_HEIGHT = 1;
const HALF_THICKNESS = 0.005;

function pad4(buffer, fill = 0) {
  const remainder = buffer.length % 4;
  if (remainder === 0) return buffer;
  return Buffer.concat([buffer, Buffer.alloc(4 - remainder, fill)]);
}

function buildGlb({ texture, textureWidth, textureHeight }) {
  const width = CARD_HEIGHT * (textureWidth / textureHeight);
  const w = width / 2;
  const h = CARD_HEIGHT / 2;
  const t = HALF_THICKNESS;

  const positions = new Float32Array([
    -w, h, t,
    w, h, t,
    w, -h, t,
    -w, -h, t,
    -w, h, -t,
    w, h, -t,
    w, -h, -t,
    -w, -h, -t,
  ]);

  const normals = new Float32Array([
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
  ]);

  const uvs = new Float32Array([
    0, 0,
    1, 0,
    1, 1,
    0, 1,
    1, 0,
    0, 0,
    0, 1,
    1, 1,
  ]);

  const indices = new Uint16Array([
    0, 2, 1, 0, 3, 2,
    4, 5, 6, 4, 6, 7,
  ]);

  const positionBytes = Buffer.from(positions.buffer);
  const normalBytes = Buffer.from(normals.buffer);
  const uvBytes = Buffer.from(uvs.buffer);
  const indexBytes = Buffer.from(indices.buffer);

  const positionOffset = 0;
  const normalOffset = positionBytes.length;
  const uvOffset = normalOffset + normalBytes.length;
  const indexOffset = uvOffset + uvBytes.length;
  const imageOffset = indexOffset + indexBytes.length;

  const bin = Buffer.concat([
    positionBytes,
    normalBytes,
    uvBytes,
    indexBytes,
    texture,
  ]);

  const gltf = {
    asset: { version: '2.0', generator: 'PortoAku profile card generator' },
    extensionsUsed: ['KHR_materials_unlit'],
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: 'ProfileCard' }],
    meshes: [
      {
        primitives: [
          {
            attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 },
            indices: 3,
            material: 0,
          },
        ],
      },
    ],
    materials: [
      {
        name: 'ProfileCardMaterial',
        pbrMetallicRoughness: {
          baseColorTexture: { index: 0 },
          metallicFactor: 0,
          roughnessFactor: 1,
        },
        alphaMode: 'BLEND',
        doubleSided: false,
        extensions: { KHR_materials_unlit: {} },
      },
    ],
    textures: [{ sampler: 0, source: 0 }],
    samplers: [
      { magFilter: 9729, minFilter: 9729, wrapS: 33071, wrapT: 33071 },
    ],
    images: [{ mimeType: 'image/png', bufferView: 4 }],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: 8,
        type: 'VEC3',
        min: [-w, -h, -t],
        max: [w, h, t],
      },
      { bufferView: 1, componentType: 5126, count: 8, type: 'VEC3' },
      { bufferView: 2, componentType: 5126, count: 8, type: 'VEC2' },
      { bufferView: 3, componentType: 5123, count: 12, type: 'SCALAR' },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: positionOffset, byteLength: positionBytes.length, target: 34962 },
      { buffer: 0, byteOffset: normalOffset, byteLength: normalBytes.length, target: 34962 },
      { buffer: 0, byteOffset: uvOffset, byteLength: uvBytes.length, target: 34962 },
      { buffer: 0, byteOffset: indexOffset, byteLength: indexBytes.length, target: 34963 },
      { buffer: 0, byteOffset: imageOffset, byteLength: texture.length },
    ],
    buffers: [{ byteLength: bin.length }],
  };

  const jsonChunk = pad4(Buffer.from(JSON.stringify(gltf), 'utf8'), 0x20);
  const binChunk = pad4(bin, 0);
  const totalLength = 12 + 8 + jsonChunk.length + 8 + binChunk.length;

  const glb = Buffer.alloc(totalLength);
  glb.writeUInt32LE(0x46546c67, 0);
  glb.writeUInt32LE(2, 4);
  glb.writeUInt32LE(totalLength, 8);
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
  return `<svg width="1000" height="1000" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bg" cx="50%" cy="38%" r="78%">
      <stop offset="0%" stop-color="#1e3f78"/>
      <stop offset="45%" stop-color="#152850"/>
      <stop offset="100%" stop-color="#0e1e3a"/>
    </radialGradient>
  </defs>
  <rect width="1000" height="1000" fill="url(#bg)"/>
</svg>`;
}

async function main() {
  const cutout = await readFile(CUTOUT_PATH);
  const meta = await sharp(cutout).metadata();

  if (!meta.hasAlpha) {
    throw new Error('profile-cutout.png must have an alpha channel.');
  }

  const texture = await sharp(cutout).png({ compressionLevel: 9 }).toBuffer();

  const glb = buildGlb({
    texture,
    textureWidth: meta.width,
    textureHeight: meta.height,
  });

  await mkdir(dirname(MODEL_PATH), { recursive: true });
  await writeFile(MODEL_PATH, glb);

  const posterHeight = 880;
  const posterWidth = Math.round(posterHeight * (meta.width / meta.height));
  const cutoutResized = await sharp(cutout)
    .resize({ height: posterHeight, fit: 'inside' })
    .png()
    .toBuffer();

  const posterBackground = await sharp(Buffer.from(posterSvg())).png().toBuffer();

  await sharp(posterBackground)
    .composite([
      {
        input: cutoutResized,
        top: Math.round((1000 - posterHeight) / 2),
        left: Math.round((1000 - posterWidth) / 2),
      },
    ])
    .webp({ quality: 88 })
    .toFile(POSTER_PATH);

  console.log(`Wrote ${MODEL_PATH} (${glb.length} bytes)`);
  console.log(`Wrote ${POSTER_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
