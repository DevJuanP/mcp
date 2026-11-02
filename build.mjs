/**
 * build.mjs — ensambla el deck en un único dist/index.html autocontenido.
 *
 * - Lee las 27 slides de src/slides en orden numérico.
 * - Embebe las fuentes .woff2 como data URI.
 * - Compacta el CSS y elimina comentarios HTML.
 * - No descarga nada en runtime: el resultado abre con doble clic y sin red.
 */
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, "src");
const DIST = join(ROOT, "dist");

const FONTS = [
  {
    family: "Space Grotesk",
    file: "space-grotesk-var.woff2",
    weight: "300 700",
    style: "normal",
  },
  {
    family: "IBM Plex Sans",
    file: "ibm-plex-sans-var.woff2",
    weight: "100 700",
    stretch: "75% 100%",
    style: "normal",
  },
  {
    family: "IBM Plex Mono",
    file: "ibm-plex-mono-400.woff2",
    weight: "400",
    style: "normal",
  },
  {
    family: "IBM Plex Mono",
    file: "ibm-plex-mono-500.woff2",
    weight: "500",
    style: "normal",
  },
  {
    family: "IBM Plex Mono",
    file: "ibm-plex-mono-600.woff2",
    weight: "600",
    style: "normal",
  },
];

function kb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function compactCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>])\s*/g, "$1")
    .trim();
}

async function buildFontCSS() {
  const faces = [];
  for (const font of FONTS) {
    const path = join(ROOT, "assets", "fonts", font.file);
    if (!existsSync(path)) {
      throw new Error(`Falta la fuente: ${font.file}`);
    }
    const base64 = (await readFile(path)).toString("base64");
    const stretch = font.stretch ? `font-stretch:${font.stretch};` : "";
    faces.push(
      `@font-face{font-family:'${font.family}';font-style:${font.style};font-weight:${font.weight};${stretch}font-display:swap;src:url(data:font/woff2;base64,${base64}) format('woff2')}`
    );
  }
  return faces.join("\n");
}

async function build() {
  const started = Date.now();
  await mkdir(DIST, { recursive: true });

  const [template, deckJS, diagramsJS] = await Promise.all([
    readFile(join(SRC, "index.template.html"), "utf8"),
    readFile(join(SRC, "scripts", "deck.js"), "utf8"),
    readFile(join(SRC, "scripts", "diagrams.js"), "utf8"),
  ]);

  const cssFiles = ["tokens.css", "deck.css", "slides.css", "print.css"];
  const cssParts = await Promise.all(
    cssFiles.map((name) => readFile(join(SRC, "styles", name), "utf8"))
  );
  const fontCSS = await buildFontCSS();
  const css = compactCSS([fontCSS, ...cssParts].join("\n"));

  const slideFiles = (await readdir(join(SRC, "slides")))
    .filter((name) => /^\d{2}-.+\.html$/.test(name))
    .sort();

  if (slideFiles.length !== 27) {
    throw new Error(
      `Se esperaban 27 slides y se encontraron ${slideFiles.length}: ${slideFiles.join(", ")}`
    );
  }

  const slides = (
    await Promise.all(
      slideFiles.map((name) => readFile(join(SRC, "slides", name), "utf8"))
    )
  )
    .map((html) => html.replace(/<!--[\s\S]*?-->/g, "").trim())
    .join("\n");

  const year = new Date().getFullYear();
  const output = template
    .replace("{{FONT_CSS}}", fontCSS)
    .replace("{{STYLES}}", css)
    .replace("{{SLIDES}}", slides)
    .replace("{{DECK_JS}}", deckJS)
    .replace("{{DIAGRAMS_JS}}", diagramsJS)
    .replaceAll("{{YEAR}}", String(year));

  const outPath = join(DIST, "index.html");
  await writeFile(outPath, output, "utf8");

  const fontBytes = (
    await Promise.all(
      FONTS.map((f) => readFile(join(ROOT, "assets", "fonts", f.file)))
    )
  ).reduce((total, buffer) => total + buffer.length, 0);

  console.log("✓ build limpio");
  console.log(`  slides:       ${slideFiles.length}`);
  console.log(`  fuentes:      ${FONTS.length} · ${kb(fontBytes)} embebidos`);
  console.log(`  css:          ${kb(Buffer.byteLength(css))}`);
  console.log(`  dist/index.html: ${kb(Buffer.byteLength(output))}`);
  console.log(`  tiempo:       ${Date.now() - started} ms`);
}

build().catch((error) => {
  console.error("✗ build falló:", error.message);
  process.exitCode = 1;
});
