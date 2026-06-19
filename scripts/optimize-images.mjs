// Otimiza imagens pesadas: PNG -> WebP (com resize) + atualiza referências no código.
// WebP grandes são recomprimidos no lugar. Uso: node scripts/optimize-images.mjs
import sharp from "sharp";
import { readdirSync, statSync, readFileSync, writeFileSync } from "node:fs";
import { join, extname, relative, sep } from "node:path";

const ROOT = process.cwd();
const PUBLIC = join(ROOT, "public");
const SRC = join(ROOT, "src");
const MIN_BYTES = 400 * 1024; // só mexe em imagens > 400KB
const Q = 80;

function walk(dir, exts) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p, exts));
    else if (exts.includes(extname(e.name).toLowerCase())) out.push(p);
  }
  return out;
}
const maxWidthFor = (p) => (/mobile|9x16/i.test(p) ? 800 : 1600);
const kb = (n) => Math.round(n / 1024);

let before = 0;
let after = 0;
const converted = []; // refs públicas "/x.png" que viraram webp

// 1) PNG -> WebP
const pngs = walk(PUBLIC, [".png"]).filter((p) => statSync(p).size >= MIN_BYTES);
for (const p of pngs) {
  const rel = "/" + relative(PUBLIC, p).split(sep).join("/");
  const meta = await sharp(p).metadata();
  const maxW = maxWidthFor(p);
  const webpPath = p.replace(/\.png$/i, ".webp");
  await sharp(p)
    .resize({ width: Math.min(meta.width || maxW, maxW), withoutEnlargement: true })
    .webp({ quality: Q })
    .toFile(webpPath);
  const o = statSync(p).size;
  const n = statSync(webpPath).size;
  before += o;
  after += n;
  converted.push(rel);
  console.log(`PNG→WebP ${rel}  ${kb(o)}KB → ${kb(n)}KB  (${meta.width}×${meta.height})`);
}

// 2) WebP grandes -> recomprime no lugar (ex: galaxy-bg.webp)
const webps = walk(PUBLIC, [".webp"]).filter((p) => statSync(p).size >= MIN_BYTES);
for (const p of webps) {
  const rel = "/" + relative(PUBLIC, p).split(sep).join("/");
  const buf = readFileSync(p);
  const meta = await sharp(buf).metadata();
  const maxW = maxWidthFor(p);
  const o = buf.length;
  await sharp(buf)
    .resize({ width: Math.min(meta.width || maxW, maxW), withoutEnlargement: true })
    .webp({ quality: Q })
    .toFile(p);
  const n = statSync(p).size;
  before += o;
  after += n;
  console.log(`WebP↺    ${rel}  ${kb(o)}KB → ${kb(n)}KB`);
}

// 3) Atualiza referências no código (só dos PNGs convertidos)
const srcFiles = walk(SRC, [".ts", ".tsx", ".css", ".html"]);
let edits = 0;
for (const f of srcFiles) {
  const orig = readFileSync(f, "utf8");
  let txt = orig;
  for (const ref of converted) {
    txt = txt.split(ref).join(ref.replace(/\.png$/i, ".webp"));
  }
  txt = txt.split('type="image/png"').join('type="image/webp"');
  if (txt !== orig) {
    writeFileSync(f, txt);
    edits++;
  }
}

console.log(`\n=== RESUMO ===`);
console.log(`Imagens otimizadas: ${converted.length} PNG→WebP + ${webps.length} WebP recomprimidos`);
console.log(`Peso: ${(before / 1048576).toFixed(1)}MB → ${(after / 1048576).toFixed(1)}MB  (-${Math.round((1 - after / before) * 100)}%)`);
console.log(`Arquivos de código atualizados: ${edits}`);
