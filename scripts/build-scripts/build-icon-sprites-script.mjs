// Per-family SVG sprite generator (subset + full tiers).
//
// Scans dashboard source for actually-used icon refs per family and emits:
//   public/svg-sprite/<family>.svg          — SUBSET (only used icons) for normal rendering
//   public/svg-sprite-full/<family>.svg     — FULL (every icon) for the picker
//
// Both tiers are pre-compressed (.gz + .br) for nginx brotli_static / gzip_static serving.
//
// Subset sprite is what the icon() factory loads via <svg><use href="/svg-sprite/<family>.svg#name"/></svg>.
// Stays small (~5-30 KB per family) so normal dashboard pages don't pay for picker-scale browsing.
//
// Full sprite is loaded only when the icon picker opens, fetched directly via the picker's
// per-family sprite loader. ~285 KB-1.2 MB per family — one-shot fetch per family per session.
//
// Run: node scripts/build-scripts/build-icon-sprites-script.mjs

import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import zlib from "node:zlib";
import ts from "typescript";

const here = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const dashSrc = path.resolve(repoRoot, "main", "dashboard", "src");
const svgRoot = path.resolve(repoRoot, "public", "svg");
const subsetOutDir = path.resolve(repoRoot, "public", "svg-sprite");
const fullOutDir = path.resolve(repoRoot, "public", "svg-sprite-full");
const allowlistPath = path.resolve(dashSrc, "icons", "icons-allowlist.json");

const FAMILIES = ["bi", "ti", "mdi", "gi", "ph"];
const FAMILY_SET = new Set(FAMILIES);

const SCAN_ROOTS = [
    path.resolve(dashSrc, "dom"),
    path.resolve(dashSrc, "managers"),
    path.resolve(dashSrc, "state"),
    path.resolve(dashSrc, "bootstrap"),
    path.resolve(dashSrc, "app"),
    path.resolve(dashSrc, "ai"),
    path.resolve(dashSrc, "ai-settings"),
    path.resolve(dashSrc, "config"),
    path.resolve(dashSrc, "shared"),
    path.resolve(dashSrc, "styles"),
    path.resolve(repoRoot, "main", "electron", "src"),
];
const SCAN_EXTS = new Set([".ts", ".tsx", ".css", ".json", ".js", ".cjs", ".mjs"]);
const EXCLUDE_DIRS = new Set(["node_modules", "dist", ".cache", ".git", "auto-gen"]);
const EXCLUDE_FILE_NAMES = new Set([
    "bi.json", "ti.json", "mdi.json", "gi.json", "ph.json", "osrs.json",
    "icons-allowlist.json",
]);

const VIEWBOX_RE = /viewBox\s*=\s*"([^"]+)"/;
const SVG_OPEN_RE = /<svg\b[^>]*>/;
const SVG_CLOSE_LITERAL = "</svg>";

function walkSync(dir, files = []) {
    if (!fs.existsSync(dir)) return files;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (EXCLUDE_DIRS.has(entry.name)) continue;
            walkSync(path.join(dir, entry.name), files);
            continue;
        }
        if (!entry.isFile()) continue;
        if (EXCLUDE_FILE_NAMES.has(entry.name)) continue;
        if (!SCAN_EXTS.has(path.extname(entry.name))) continue;
        files.push(path.join(dir, entry.name));
    }
    return files;
}

const DEFAULT_PROVIDER = "bi";
const ICON_NAME_SHAPE = /^[a-z][a-z0-9-]*$/;
const PROVIDER_ALIAS_KEYS = new Set(["provider", "kind"]);
const NAME_ALIAS_KEYS = new Set(["name", "iconName", "iconKey", "iconId", "glyph", "icon"]);
const ICON_FACTORY_CALLS = new Set(["icon", "iconEl"]);
const POSITIONAL_ICON_HELPERS = { entry: { argIndex: 1, family: DEFAULT_PROVIDER } };
const TS_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".cjs", ".mjs"]);

function isStringLiteralNode(node) {
    return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node);
}

function asIconLiteral(node) {
    if (!isStringLiteralNode(node)) return null;
    return ICON_NAME_SHAPE.test(node.text) ? node.text : null;
}

function asPlainLiteral(node) {
    return isStringLiteralNode(node) ? node.text : null;
}

function propertyKeyText(prop) {
    if (!prop.name) return null;
    if (ts.isIdentifier(prop.name)) return prop.name.text;
    if (ts.isStringLiteral(prop.name)) return prop.name.text;
    return null;
}

function extractIconFieldsFromObject(objLit) {
    const fields = { providers: [], names: [], aliasNames: [] };
    for (const prop of objLit.properties) {
        if (!ts.isPropertyAssignment(prop)) continue;
        const key = propertyKeyText(prop);
        if (key === null) continue;
        if (PROVIDER_ALIAS_KEYS.has(key)) {
            const v = asPlainLiteral(prop.initializer);
            if (v !== null) fields.providers.push(v);
            continue;
        }
        if (key === "name") {
            const v = asIconLiteral(prop.initializer);
            if (v !== null) fields.names.push(v);
            continue;
        }
        if (NAME_ALIAS_KEYS.has(key)) {
            const v = asIconLiteral(prop.initializer);
            if (v !== null) fields.aliasNames.push({ key, value: v });
        }
    }
    return fields;
}

function getCalleeName(call) {
    const expr = call.expression;
    if (ts.isIdentifier(expr)) return expr.text;
    if (ts.isPropertyAccessExpression(expr) && ts.isIdentifier(expr.name)) return expr.name.text;
    return null;
}

function recordRef(collected, family, name) {
    if (!ICON_NAME_SHAPE.test(name)) return;
    if (!collected.has(family)) collected.set(family, new Set());
    collected.get(family).add(name);
}

function resolveFamily(providerValues) {
    for (const v of providerValues) {
        if (FAMILY_SET.has(v)) return v;
    }
    return DEFAULT_PROVIDER;
}

function collectFromIconFactoryCall(call, collected) {
    const arg0 = call.arguments[0];
    if (!arg0 || !ts.isObjectLiteralExpression(arg0)) return;
    const fields = extractIconFieldsFromObject(arg0);
    const family = resolveFamily(fields.providers);
    for (const n of fields.names) recordRef(collected, family, n);
    for (const a of fields.aliasNames) recordRef(collected, family, a.value);
}

function collectFromPositionalHelper(call, helper, collected) {
    const arg = call.arguments[helper.argIndex];
    if (!arg) return;
    const v = asIconLiteral(arg);
    if (v !== null) recordRef(collected, helper.family, v);
}

function collectFromObjectLiteral(objLit, collected) {
    const fields = extractIconFieldsFromObject(objLit);
    const targetFamily = resolveFamily(fields.providers);
    for (const n of fields.names) recordRef(collected, targetFamily, n);
    for (const a of fields.aliasNames) recordRef(collected, targetFamily, a.value);
}

function walkAst(sourceText, filename, collected) {
    const sf = ts.createSourceFile(filename, sourceText, ts.ScriptTarget.Latest, true);
    const visit = (node) => {
        if (ts.isCallExpression(node)) {
            const callee = getCalleeName(node);
            if (callee !== null) {
                if (ICON_FACTORY_CALLS.has(callee)) collectFromIconFactoryCall(node, collected);
                const helper = POSITIONAL_ICON_HELPERS[callee];
                if (helper) collectFromPositionalHelper(node, helper, collected);
            }
        }
        if (ts.isObjectLiteralExpression(node)) {
            collectFromObjectLiteral(node, collected);
        }
        ts.forEachChild(node, visit);
    };
    visit(sf);
}

function scanCssClasses(content, prefix, found) {
    const classPattern = new RegExp(`\\b${prefix}-([a-z0-9-]+)`, "g");
    for (const m of content.matchAll(classPattern)) found.add(m[1]);
}

function scanAll(sourceFiles) {
    const collected = new Map();
    for (const file of sourceFiles) {
        const content = fs.readFileSync(file, "utf-8");
        const ext = path.extname(file);
        if (TS_EXTS.has(ext)) {
            try {
                walkAst(content, file, collected);
            } catch (err) {
                console.warn(`  ast skip: ${path.relative(repoRoot, file)} — ${err.message}`);
            }
        }
        for (const family of FAMILIES) {
            if (!collected.has(family)) collected.set(family, new Set());
            scanCssClasses(content, family, collected.get(family));
        }
    }
    return collected;
}

function loadAllowlist() {
    if (!fs.existsSync(allowlistPath)) return {};
    try {
        return JSON.parse(fs.readFileSync(allowlistPath, "utf-8"));
    } catch {
        return {};
    }
}

function extractGlyph(svgText) {
    const viewBoxMatch = svgText.match(VIEWBOX_RE);
    if (!viewBoxMatch) return null;
    const viewBox = viewBoxMatch[1];
    const openMatch = svgText.match(SVG_OPEN_RE);
    if (!openMatch || openMatch.index === undefined) return null;
    const innerStart = openMatch.index + openMatch[0].length;
    const innerEnd = svgText.lastIndexOf(SVG_CLOSE_LITERAL);
    if (innerEnd <= innerStart) return null;
    return { viewBox, inner: svgText.slice(innerStart, innerEnd).trim() };
}

function readFamilyGlyphs(family) {
    const familyDir = path.resolve(svgRoot, family);
    if (!fs.existsSync(familyDir)) return null;
    const entries = fs
        .readdirSync(familyDir, { withFileTypes: true })
        .filter((e) => e.isFile() && e.name.endsWith(".svg"))
        .map((e) => e.name)
        .sort();
    const glyphs = new Map();
    let skipped = 0;
    for (const filename of entries) {
        const name = filename.slice(0, -4);
        const text = fs.readFileSync(path.resolve(familyDir, filename), "utf-8");
        const glyph = extractGlyph(text);
        if (!glyph) {
            skipped += 1;
            continue;
        }
        glyphs.set(name, glyph);
    }
    return { glyphs, skipped };
}

function emitSprite(outPath, glyphs, names) {
    const lines = [`<svg xmlns="http://www.w3.org/2000/svg" style="display:none">`];
    for (const name of names) {
        const glyph = glyphs.get(name);
        if (!glyph) continue;
        lines.push(`<symbol id="${name}" viewBox="${glyph.viewBox}">${glyph.inner}</symbol>`);
    }
    lines.push(`</svg>`);
    const sprite = lines.join("");
    fs.writeFileSync(outPath, sprite);
    const gz = zlib.gzipSync(sprite, { level: 9 });
    fs.writeFileSync(`${outPath}.gz`, gz);
    const br = zlib.brotliCompressSync(sprite);
    fs.writeFileSync(`${outPath}.br`, br);
    return { sizeBytes: sprite.length, gzBytes: gz.length, brBytes: br.length };
}

function fmtKb(bytes) {
    return (bytes / 1024).toFixed(1).padStart(7);
}

function main() {
    fs.mkdirSync(subsetOutDir, { recursive: true });
    fs.mkdirSync(fullOutDir, { recursive: true });
    const startedAt = Date.now();

    const sourceFiles = [];
    for (const root of SCAN_ROOTS) walkSync(root, sourceFiles);
    const allowlist = loadAllowlist();
    const allScanned = scanAll(sourceFiles);

    let subsetTotal = 0;
    let fullTotal = 0;

    for (const family of FAMILIES) {
        const familyData = readFamilyGlyphs(family);
        if (familyData === null) {
            console.warn(`  ${family.padEnd(4)} SKIP: no public/svg/${family}/ directory`);
            continue;
        }
        const { glyphs, skipped } = familyData;

        const scanned = allScanned.get(family) ?? new Set();
        const allowEntry = allowlist[family];
        const fullFamily = allowEntry === "*";
        const allowSet = Array.isArray(allowEntry) ? new Set(allowEntry) : new Set();
        const usedNames = fullFamily
            ? new Set(glyphs.keys())
            : new Set([...scanned, ...allowSet].filter((n) => glyphs.has(n)));
        const subsetNames = [...usedNames].sort();

        const subsetOut = path.resolve(subsetOutDir, `${family}.svg`);
        const subsetSize = emitSprite(subsetOut, glyphs, subsetNames);
        subsetTotal += subsetSize.brBytes;

        const allNames = [...glyphs.keys()].sort();
        const fullOut = path.resolve(fullOutDir, `${family}.svg`);
        const fullSize = emitSprite(fullOut, glyphs, allNames);
        fullTotal += fullSize.brBytes;

        const skipSuffix = skipped > 0 ? ` (${skipped} glyphs missing viewBox)` : "";
        const fullTag = fullFamily ? " (FULL via allowlist)" : "";
        console.log(
            `  ${family.padEnd(4)}${fullTag} subset=${subsetNames.length}/${allNames.length} | ` +
                `subset.br ${fmtKb(subsetSize.brBytes)} KB | full.br ${fmtKb(fullSize.brBytes)} KB${skipSuffix}`,
        );
    }

    const elapsed = Date.now() - startedAt;
    console.log(
        `[icon-sprites] subset total ${fmtKb(subsetTotal)} KB brotli | full total ${fmtKb(fullTotal)} KB brotli | ${elapsed}ms`,
    );
}

main();
