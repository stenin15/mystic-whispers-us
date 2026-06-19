// Comprime vídeos de alto bitrate (UGC/loop) p/ web mobile: 720x1280, CRF 28, faststart.
// Pula os já eficientes (ex: VSL ~729kbps). Uso: node scripts/compress-videos.mjs
import { execFileSync } from "node:child_process";
import { readdirSync, statSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";

const PUB = join(process.cwd(), "public");

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.toLowerCase().endsWith(".mp4")) out.push(p);
  }
  return out;
}
function durationOf(f) {
  try {
    return (
      parseFloat(
        execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim(),
      ) || 0
    );
  } catch {
    return 0;
  }
}
const mb = (n) => (n / 1048576).toFixed(1);

let before = 0;
let after = 0;
for (const f of walk(PUB)) {
  const size = statSync(f).size;
  const name = f.split(/[\\/]/).pop();
  if (size < 3 * 1024 * 1024) continue;
  const dur = durationOf(f);
  const kbps = dur > 0 ? (size * 8) / 1000 / dur : 0;
  if (kbps < 3000) {
    console.log(`SKIP ${name}: ${Math.round(kbps)} kbps (já eficiente)`);
    continue;
  }
  const tmp = f + ".tmp.mp4";
  try {
    execFileSync(
      "ffmpeg",
      [
        "-hide_banner", "-loglevel", "error", "-i", f,
        "-vf", "scale=-2:'min(1280,ih)'",
        "-c:v", "libx264", "-crf", "28", "-preset", "fast",
        "-movflags", "+faststart",
        "-c:a", "aac", "-b:a", "96k",
        "-y", tmp,
      ],
      { stdio: "inherit" },
    );
  } catch (e) {
    console.log(`ERR  ${name}: ${e.message}`);
    try { rmSync(tmp); } catch {}
    continue;
  }
  const nsize = statSync(tmp).size;
  if (nsize > 50000 && nsize < size) {
    before += size;
    after += nsize;
    rmSync(f);
    renameSync(tmp, f);
    console.log(`OK   ${name}: ${mb(size)}MB -> ${mb(nsize)}MB`);
  } else {
    try { rmSync(tmp); } catch {}
    console.log(`KEEP ${name}: sem ganho`);
  }
}
console.log(`\n=== TOTAL: ${mb(before)}MB -> ${mb(after)}MB ===`);
