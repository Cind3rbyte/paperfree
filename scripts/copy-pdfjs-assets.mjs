/**
 * Copies the pdf.js worker plus CMaps, standard fonts, WASM decoders and ICC profiles
 * from node_modules to public/pdfjs. Everything is served from your own domain –
 * no CDN and no version mismatch between the API and the worker.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const targetDir = path.join(projectRoot, "public", "pdfjs");

function resolvePdfJsDir() {
  try {
    const require = createRequire(path.join(projectRoot, "package.json"));
    return path.dirname(require.resolve("pdfjs-dist/package.json"));
  } catch {
    const fallback = path.join(projectRoot, "node_modules", "pdfjs-dist");
    return existsSync(fallback) ? fallback : null;
  }
}

const pdfjsDir = resolvePdfJsDir();

if (!pdfjsDir) {
  console.warn("[paperfree] pdfjs-dist not found – please run `npm install` first.");
  process.exit(0);
}

const { version } = JSON.parse(readFileSync(path.join(pdfjsDir, "package.json"), "utf8"));

rmSync(targetDir, { recursive: true, force: true });
mkdirSync(targetDir, { recursive: true });

cpSync(path.join(pdfjsDir, "build", "pdf.worker.min.mjs"), path.join(targetDir, "pdf.worker.min.mjs"));

for (const directory of ["cmaps", "standard_fonts", "wasm", "iccs"]) {
  const source = path.join(pdfjsDir, directory);
  if (existsSync(source)) {
    cpSync(source, path.join(targetDir, directory), { recursive: true });
  }
}

console.log(`[paperfree] pdf.js ${version}: copied worker & assets to public/pdfjs.`);
