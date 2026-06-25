// Usage-based icon CSS subset generator.
//
// Reads each icon family's glyph map (icons/{family}.json), scans the dashboard
// source for class references, unions with the manual allowlist, and writes
// subset CSS containing ONLY rules for icons actually used.
//
// Run: node scripts/build-scripts/build-icons-subset-script.mjs
//
// Output is gitignored — generated on every build, never committed.

import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const here = path.dirname(url.fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..");
const dashSrc = path.resolve(repoRoot, "main", "dashboard", "src");
const iconsDir = path.resolve(dashSrc, "icons");
const allowlistPath = path.resolve(iconsDir, "icons-allowlist.json");
const subsetOutDir = path.resolve(dashSrc, "styles", "auto-gen", "icons-subset");
const scanRoots = [
    path.resolve(dashSrc, "dom"),
    path.resolve(dashSrc, "managers"),
    path.resolve(dashSrc, "state"),
    path.resolve(dashSrc, "bootstrap"),
    path.resolve(dashSrc, "app"),
    path.resolve(dashSrc, "ai"),
    path.resolve(dashSrc, "styles"),
    path.resolve(dashSrc, "config"),
    // Shared constants define icon class strings (BS_ICON_ZOOM_IN_CLASS = "bi-zoom-in" etc.)
    // that DOM consumers reference via the constant — the constant value itself must be in scan reach.
    path.resolve(dashSrc, "shared"),
    // Electron preload injects window-control buttons (bi-dash, bi-square, bi-x) directly into
    // the dashboard DOM via raw createElement. Not seen by the dashboard scan; must be scanned here.
    path.resolve(repoRoot, "main", "electron", "src"),
];
const scanExtensions = new Set([".ts", ".tsx", ".css", ".json", ".js", ".cjs", ".mjs"]);

// Files whose contents must NOT count as "usage" — they're the canonical glyph maps
// themselves (every glyph name appears as a JSON key) or static-icon registries that
// enumerate the full library. Including them would force 100% subset = no win.
const excludePaths = [
    path.resolve(iconsDir, "bi.json"),
    path.resolve(iconsDir, "mdi.json"),
    path.resolve(iconsDir, "ti.json"),
    path.resolve(iconsDir, "gi.json"),
    path.resolve(iconsDir, "lu.json"),
    path.resolve(iconsDir, "ph.json"),
    path.resolve(iconsDir, "ra.json"),
    path.resolve(iconsDir, "osrs.json"),
    path.resolve(iconsDir, "bi-paths.json"),
    path.resolve(iconsDir, "mdi-paths.json"),
    path.resolve(iconsDir, "ti-paths.json"),
    path.resolve(iconsDir, "gi-paths.json"),
    path.resolve(iconsDir, "lu-paths.json"),
    path.resolve(iconsDir, "ph-paths.json"),
    path.resolve(iconsDir, "ra-paths.json"),
    path.resolve(dashSrc, "styles", "auto-gen"),
];

function isExcluded(filePath) {
    for (const excluded of excludePaths) {
        if (filePath === excluded || filePath.startsWith(excluded + path.sep)) return true;
    }
    return false;
}

// Per-family generation config. Each entry produces one subset CSS file.
// The header is whatever should land in the subset BEFORE the per-glyph rules
// (the @font-face declaration + base class). Per-glyph rules are appended
// for icons actually used. Note: bi's @font-face lives in elements-global.css —
// other families declare their @font-face in the family CSS itself.
function buildFontFaceHeader(family, src) {
    return [
        `@font-face {`,
        `    font-family: ${family.fontFamily};`,
        `    font-weight: 400;`,
        `    font-style: normal;`,
        `    font-display: swap;`,
        `    src: ${src};`,
        `}`,
        `.${family.baseClass} {`,
        `    display: inline-block;`,
        `    font-family: ${family.fontFamily}, sans-serif;`,
        `    font-weight: 400;`,
        `    font-style: normal;`,
        `    font-variant: normal;`,
        `    line-height: 1;`,
        `    text-transform: none;`,
        `    -webkit-font-smoothing: antialiased;`,
        `    -moz-osx-font-smoothing: grayscale;`,
        `    speak: never;`,
        `}`,
    ].join("\n");
}

const FAMILIES = [
    {
        prefix: "bi",
        glyphMapPath: path.resolve(iconsDir, "bi.json"),
        outFile: "bi.css",
        baseClass: "bi",
        fontFamily: "bootstrap-icons",
        // bi uses combinator selectors at base, font-face declared elsewhere (elements-global.css)
        header:
            `.bi::before, [class*=" bi-"]::before, [class^="bi-"]::before {\n` +
            `    display: inline-block;\n` +
            `    font-family: bootstrap-icons, sans-serif;\n` +
            `    font-style: normal;\n` +
            `    font-weight: 400;\n` +
            `    font-variant: normal;\n` +
            `    text-transform: none;\n` +
            `    line-height: 1;\n` +
            `    vertical-align: -0.125em;\n` +
            `}`,
    },
    {
        prefix: "mdi",
        glyphMapPath: path.resolve(iconsDir, "mdi.json"),
        outFile: "mdi.css",
        baseClass: "mdi",
        fontFamily: '"Material Design Icons"',
        header: null, // computed below
        src: `url("/fonts/mdi/materialdesignicons-webfont.woff2") format("woff2")`,
    },
    {
        prefix: "ti",
        glyphMapPath: path.resolve(iconsDir, "ti.json"),
        outFile: "ti.css",
        baseClass: "ti",
        fontFamily: "tabler-icons",
        header: null,
        src: `url("/fonts/tabler/tabler-icons.woff2") format("woff2")`,
    },
    {
        prefix: "gi",
        glyphMapPath: path.resolve(iconsDir, "gi.json"),
        outFile: "gi.css",
        baseClass: "gi",
        fontFamily: "rpgen-gameicons",
        header: null,
        src: `url("/fonts/game-icons/rpgen-gameicons.woff2") format("woff2")`,
    },
    {
        prefix: "lu",
        glyphMapPath: path.resolve(iconsDir, "lu.json"),
        outFile: "lu.css",
        baseClass: "lucide",
        fontFamily: "lucide",
        header: null,
        src: `url("/fonts/lucide/lucide.woff2") format("woff2")`,
    },
    {
        prefix: "ph",
        glyphMapPath: path.resolve(iconsDir, "ph.json"),
        outFile: "ph.css",
        baseClass: "ph",
        fontFamily: "Phosphor",
        header: null,
        src: `url("/fonts/phosphor/Phosphor.woff2") format("woff2")`,
    },
    {
        prefix: "ra",
        glyphMapPath: path.resolve(iconsDir, "ra.json"),
        outFile: "ra.css",
        baseClass: "ra",
        fontFamily: "RPGAwesome",
        header: null,
        src:
            `\n` +
            `        url("/fonts/rpg-awesome/rpgawesome-webfont.woff2") format("woff2"),\n` +
            `        url("/fonts/rpg-awesome/rpgawesome-webfont.woff") format("woff")`,
    },
];

// Resolve null headers via the standard @font-face + base-class template.
for (const family of FAMILIES) {
    if (family.header === null) family.header = buildFontFaceHeader(family, family.src);
}

function walkSync(dir, files = []) {
    if (!fs.existsSync(dir)) return files;
    if (isExcluded(dir)) return files;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (isExcluded(full)) continue;
        if (entry.isDirectory()) walkSync(full, files);
        else if (scanExtensions.has(path.extname(entry.name))) files.push(full);
    }
    return files;
}

function loadAllowlist() {
    if (!fs.existsSync(allowlistPath)) return {};
    const raw = JSON.parse(fs.readFileSync(allowlistPath, "utf-8"));
    const cleaned = {};
    for (const [key, value] of Object.entries(raw)) {
        if (key.startsWith("_")) continue;
        cleaned[key] = value;
    }
    return cleaned;
}

function scanForClassRefs(prefix) {
    // Match `{prefix}-{name}` where name is kebab-case alphanumeric.
    // Catches: class="bi-home", `bi-${...}` template-literal prefixes (we capture the literal portion),
    // CSS selectors like .bi-home, and JSON config values.
    const pattern = new RegExp(`\\b${prefix}-([a-z0-9-]+)`, "g");
    const found = new Set();
    for (const root of scanRoots) {
        for (const file of walkSync(root)) {
            const content = fs.readFileSync(file, "utf-8");
            for (const match of content.matchAll(pattern)) {
                found.add(match[1]);
            }
        }
    }
    return found;
}

function generateSubsetCss(family, glyphMap, usedNames) {
    const lines = [
        `/* GENERATED — do not edit. Source: scripts/build-scripts/build-icons-subset-script.mjs */`,
        `/* Family: ${family.prefix} | Glyphs in subset: ${usedNames.size} of ${Object.keys(glyphMap).length} */`,
        family.header,
    ];
    const sorted = [...usedNames].sort();
    let emitted = 0;
    let missing = 0;
    for (const name of sorted) {
        const codepoint = glyphMap[name];
        if (codepoint === undefined) {
            missing += 1;
            continue;
        }
        const hex = codepoint.toString(16);
        lines.push(`.${family.prefix}-${name}::before { content: "\\${hex}" }`);
        emitted += 1;
    }
    return { css: lines.join("\n") + "\n", emitted, missing };
}

function main() {
    if (!fs.existsSync(subsetOutDir)) fs.mkdirSync(subsetOutDir, { recursive: true });

    const allowlist = loadAllowlist();
    const summary = [];

    for (const family of FAMILIES) {
        if (!fs.existsSync(family.glyphMapPath)) {
            console.error(`[icons-subset] SKIP ${family.prefix}: glyph map missing at ${family.glyphMapPath}`);
            continue;
        }
        const glyphMap = JSON.parse(fs.readFileSync(family.glyphMapPath, "utf-8"));

        // Scan for class references in source.
        const scanned = scanForClassRefs(family.prefix);

        // Union with allowlist.
        const allowEntry = allowlist[family.prefix];
        const fullFamily = allowEntry === "*";
        const allowSet = Array.isArray(allowEntry) ? new Set(allowEntry) : new Set();

        const used = fullFamily
            ? new Set(Object.keys(glyphMap))
            : new Set([...scanned, ...allowSet].filter((name) => glyphMap[name] !== undefined));

        // Filter scanned names that DON'T resolve in the glyph map — they're false-positive matches
        // (substrings of unrelated identifiers, kebab-case symbols that happen to start with the prefix).
        const invalidScanned = [...scanned].filter((name) => glyphMap[name] === undefined);

        const { css, emitted, missing } = generateSubsetCss(family, glyphMap, used);
        const outPath = path.resolve(subsetOutDir, family.outFile);
        fs.writeFileSync(outPath, css);

        const fullCount = Object.keys(glyphMap).length;
        const pct = ((emitted / fullCount) * 100).toFixed(1);
        summary.push({
            prefix: family.prefix,
            emitted,
            full: fullCount,
            pct: `${pct}%`,
            scanned: scanned.size,
            allow: allowSet.size,
            invalidScanned: invalidScanned.length,
            invalidScannedNames: invalidScanned,
            missing,
            fullFamily,
            outPath,
        });
    }

    // Emit barrel index importing every generated subset, so the eager root
    // can @import a single file without knowing which families exist.
    const indexLines = [
        `/* GENERATED — do not edit. Lists every subset emitted by the build script. */`,
    ];
    for (const family of FAMILIES) {
        indexLines.push(`@import "./${family.outFile}";`);
    }
    fs.writeFileSync(path.resolve(subsetOutDir, "index.css"), indexLines.join("\n") + "\n");

    // Emit runtime manifest — consumed by providers.ts ensureFamilyCss() to gate
    // lazy full-family CSS loads. If the icon being rendered is in the subset, the
    // eager subset CSS already has its rule and the full-family lazy chunk doesn't
    // need to fire. Saves 28-200 KB compressed per family per session.
    const manifestLines = [
        `// GENERATED — do not edit. Emitted by scripts/build-scripts/build-icons-subset-script.mjs`,
        `// Lists every "{prefix}-{name}" key the subset CSS provides a rule for. Consumed by`,
        `// icons/providers.ts ensureFamilyCss() to skip the lazy full-family CSS load when the`,
        `// rendered icon is already covered by the eager subset.`,
        ``,
        `export const SUBSET_GLYPHS: ReadonlySet<string> = new Set([`,
    ];
    const allKeys = [];
    for (const family of FAMILIES) {
        if (!fs.existsSync(family.glyphMapPath)) continue;
        const glyphMap = JSON.parse(fs.readFileSync(family.glyphMapPath, "utf-8"));
        const allowEntry = allowlist[family.prefix];
        const fullFamily = allowEntry === "*";
        const allowSet = Array.isArray(allowEntry) ? new Set(allowEntry) : new Set();
        const scanned = scanForClassRefs(family.prefix);
        const used = fullFamily
            ? new Set(Object.keys(glyphMap))
            : new Set([...scanned, ...allowSet].filter((name) => glyphMap[name] !== undefined));
        for (const name of [...used].sort()) allKeys.push(`${family.prefix}-${name}`);
    }
    for (const key of allKeys) manifestLines.push(`    ${JSON.stringify(key)},`);
    manifestLines.push(`]);`);
    manifestLines.push(``);
    fs.writeFileSync(path.resolve(subsetOutDir, "manifest.ts"), manifestLines.join("\n"));

    // Pretty-print summary.
    console.log("[icons-subset] generation complete:");
    for (const row of summary) {
        const fullTag = row.fullFamily ? " (FULL — allowlist)" : "";
        console.log(
            `  ${row.prefix}${fullTag}: ${row.emitted}/${row.full} glyphs (${row.pct})` +
                ` | scanned=${row.scanned} allow=${row.allow} invalid-scan=${row.invalidScanned}`,
        );
    }
    console.log(`[icons-subset] output: ${subsetOutDir}`);

    // CI gate: fail if any --check mode invariants violated.
    const checkMode = process.argv.includes("--check");
    if (checkMode) {
        let hard = 0;
        for (const row of summary) {
            if (row.invalidScanned > 0) {
                hard += row.invalidScanned;
                console.error(
                    `[icons-subset] CHECK FAIL: ${row.prefix} has ${row.invalidScanned} invalid class references ` +
                        `that don't resolve to any glyph (likely typos):`,
                );
                for (const name of row.invalidScannedNames.slice(0, 10)) {
                    console.error(`    ${row.prefix}-${name}`);
                }
                if (row.invalidScannedNames.length > 10) {
                    console.error(`    ... and ${row.invalidScannedNames.length - 10} more`);
                }
            }
        }
        if (hard > 0) {
            console.error(
                `[icons-subset] CHECK FAIL: ${hard} invalid glyph reference(s). ` +
                    `Fix the typos in source, or add the glyph name to icons-allowlist.json if it's a dynamic reference.`,
            );
            process.exit(1);
        }
        console.log("[icons-subset] CHECK PASS");
    }
}

main();
