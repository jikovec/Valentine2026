import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SOURCE_DIR = path.resolve("assets/photos");

const INPUT_EXTS = new Set([".jpg", ".jpeg", ".png"]);
const MAX_WIDTH = 1800;

const ENABLE_AVIF = String(process.env.ENABLE_AVIF || "").trim() === "1";

const WEBP_OPTIONS = { quality: 82, effort: 6 };
const AVIF_OPTIONS = { quality: 50, effort: 4 };

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listInputImagesRecursive(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await listInputImagesRecursive(full)));
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (INPUT_EXTS.has(ext)) out.push(full);
  }

  return out;
}

function replaceExt(filePath, ext) {
  return filePath.replace(/\.[^.]+$/, `.${ext}`);
}

async function isOutdated(inputPath, outputPath) {
  if (!(await exists(outputPath))) return true;
  const [inStat, outStat] = await Promise.all([fs.stat(inputPath), fs.stat(outputPath)]);
  return inStat.mtimeMs > outStat.mtimeMs;
}

async function optimizeOne(inputPath) {
  const webpOut = replaceExt(inputPath, "webp");
  const avifOut = replaceExt(inputPath, "avif");

  const needWebp = await isOutdated(inputPath, webpOut);
  const needAvif = ENABLE_AVIF ? await isOutdated(inputPath, avifOut) : false;

  if (!needWebp && !needAvif) {
    return { skipped: true, inputPath };
  }

  const base = sharp(inputPath).rotate();
  const meta = await base.metadata();
  const width = meta.width || 0;

  let pipeline = sharp(inputPath).rotate();
  if (width > MAX_WIDTH) {
    pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
  }

  if (needWebp) {
    await pipeline.clone().webp(WEBP_OPTIONS).toFile(webpOut);
  }

  if (needAvif) {
    await pipeline.clone().avif(AVIF_OPTIONS).toFile(avifOut);
  }

  return {
    skipped: false,
    inputPath,
    webp: needWebp,
    avif: needAvif
  };
}

async function main() {
  if (!(await exists(SOURCE_DIR))) {
    console.log("optimize-images: assets/photos not found, skipping.");
    return;
  }

  const inputs = await listInputImagesRecursive(SOURCE_DIR);
  if (inputs.length === 0) {
    console.log("optimize-images: no JPG/JPEG/PNG files found.");
    return;
  }

  let built = 0;
  let skipped = 0;
  let errors = 0;

  for (const input of inputs) {
    try {
      const result = await optimizeOne(input);
      if (result.skipped) skipped++;
      else built++;
    } catch (err) {
      errors++;
      console.warn(`optimize-images: failed for ${path.relative(process.cwd(), input)}`);
      console.warn(`  -> ${err?.message || err}`);
    }
  }

  console.log(
    `optimize-images: done | total=${inputs.length} built=${built} skipped=${skipped} errors=${errors} avif=${ENABLE_AVIF ? "on" : "off"}`
  );
}

main().catch((err) => {
  console.error("optimize-images: fatal error");
  console.error(err);
  process.exit(1);
});
