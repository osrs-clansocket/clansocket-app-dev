// Per-family SVG sprite generator.
//
// Reads each family's per-glyph SVG files at public/svg/<family>/<name>.svg and
// concatenates them into ONE sprite file at public/svg-sprite/<family>.svg with
// each glyph wrapped as a <symbol id="<name>" viewBox="..."> element.
//
// Consumed at runtime via <svg><use href="/svg-sprite/<family>.svg#<name>"/></svg>.
// Browser fetches each sprite ONCE per session; every <use> reference resolves
// instantly from the in-memory parsed sprite document. Replaces N per-icon HTTP
// requests with 1 per family.
//
// Run: node scripts/build-scripts/build-icon-sprites-script.mjs

import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import zlib from "node:zlib";

const here = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const svgRoot = path.resolve(repoRoot, "public", "svg");
const spriteOutDir = path.resolve(repoRoot, "public", "svg-sprite");

const FAMILIES = ["bi", "ti", "mdi", "gi", "ph"];

const VIEWBOX_RE = /viewBox\s*=\s*"([^"]+)"/;
const SVG_OPEN_RE = /<svg\b[^>]*>/;
const SVG_CLOSE_LITERAL = "</svg>";

function extractGlyph(svgText) {
    const viewBoxMatch = svgText.match(VIEWBOX_RE);
    if (!viewBoxMatch) return null;
    const viewBox = viewBoxMatch[1];
    const openMatch = svgText.match(SVG_OPEN_RE);
    if (!openMatch || openMatch.index === undefined) return null;
    const innerStart = openMatch.index + openMatch[0].length;
    const innerEnd = svgText.lastIndexOf(SVG_CLOSE_LITERAL);
    if (innerEnd <= innerStart) return null;
    const inner = svgText.slice(innerStart, innerEnd).trim();
    return { viewBox, inner };
}

function buildSprite(family) {
    const familyDir = path.resolve(svgRoot, family);
    if (!fs.existsSync(familyDir)) return { written: 0, skipped: 0, missing: true };
    const entries = fs
        .readdirSync(familyDir, { withFileTypes: true })
        .filter((e) => e.isFile() && e.name.endsWith(".svg"))
        .map((e) => e.name)
        .sort();
    const lines = [`<svg xmlns="http://www.w3.org/2000/svg" style="display:none">`];
    let written = 0;
    let skipped = 0;
    for (const filename of entries) {
        const name = filename.slice(0, -4);
        const text = fs.readFileSync(path.resolve(familyDir, filename), "utf-8");
        const glyph = extractGlyph(text);
        if (!glyph) {
            skipped += 1;
            continue;
        }
        lines.push(`<symbol id="${name}" viewBox="${glyph.viewBox}">${glyph.inner}</symbol>`);
        written += 1;
    }
    lines.push(`</svg>`);
    const sprite = lines.join("");
    const outPath = path.resolve(spriteOutDir, `${family}.svg`);
    fs.writeFileSync(outPath, sprite);
    const gz = zlib.gzipSync(sprite, { level: 9 });
    fs.writeFileSync(`${outPath}.gz`, gz);
    const br = zlib.brotliCompressSync(sprite);
    fs.writeFileSync(`${outPath}.br`, br);
    return {
        written,
        skipped,
        sizeBytes: sprite.length,
        gzBytes: gz.length,
        brBytes: br.length,
        missing: false,
        outPath,
    };
}

function main() {
    fs.mkdirSync(spriteOutDir, { recursive: true });
    const startedAt = Date.now();
    let totalWritten = 0;
    let totalSkipped = 0;
    let totalBytes = 0;
    for (const family of FAMILIES) {
        const result = buildSprite(family);
        if (result.missing) {
            console.warn(`  ${family.padEnd(4)} SKIP: no public/svg/${family}/ directory`);
            continue;
        }
        totalWritten += result.written;
        totalSkipped += result.skipped;
        totalBytes += result.sizeBytes;
        const raw = (result.sizeBytes / 1024).toFixed(1);
        const gz = (result.gzBytes / 1024).toFixed(1);
        const br = (result.brBytes / 1024).toFixed(1);
        const skipSuffix = result.skipped > 0 ? ` (${result.skipped} skipped — no viewBox)` : "";
        console.log(
            `  ${family.padEnd(4)} ${String(result.written).padStart(6)} symbols | raw ${raw.padStart(7)} KB | gz ${gz.padStart(6)} KB | br ${br.padStart(6)} KB${skipSuffix}`,
        );
    }
    const elapsed = Date.now() - startedAt;
    const totalKb = (totalBytes / 1024).toFixed(1);
    console.log(`[icon-sprites] wrote ${totalWritten} symbols across ${FAMILIES.length} families (${totalKb} KB total) in ${elapsed}ms`);
    if (totalSkipped > 0) console.log(`[icon-sprites] skipped ${totalSkipped} glyphs (missing viewBox)`);
}

main();
