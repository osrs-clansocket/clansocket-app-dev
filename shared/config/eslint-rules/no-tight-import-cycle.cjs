/**
 * LVI/no-tight-import-cycle — A→B→A direct import cycle. Two-step cycles cause module
 * init-order bugs (one side sees undefined for the other's exports during eval).
 *
 * Uses a memoized cross-file graph built lazily. Reports on the file at the cycle "exit".
 */
const fs = require("node:fs");
const path = require("node:path");
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

const graphCache = new Map(); // absPath → Set<absPath>

function readImports(absFile) {
    if (graphCache.has(absFile)) return graphCache.get(absFile);
    const out = new Set();
    let src;
    try {
        src = fs.readFileSync(absFile, "utf8");
    } catch {
        graphCache.set(absFile, out);
        return out;
    }
    // Skip `import type { ... } from "..."` — type-only imports are erased at compile time
    // and don't participate in module init, so they can't cause the runtime init-order race
    // the rule warns about.
    const re = /^import\s+(?!type\s)[^;]*?from\s+"(\.[^"]+)"/gm;
    let m;
    const dir = path.dirname(absFile);
    while ((m = re.exec(src)) !== null) {
        const spec = m[1];
        let resolved = path.resolve(dir, spec.replace(/\.js$/, ".ts")).replace(/\\/g, "/");
        if (!fs.existsSync(resolved)) {
            const alt = path.resolve(dir, spec.replace(/\.js$/, "/index.ts")).replace(/\\/g, "/");
            if (fs.existsSync(alt)) resolved = alt;
            else continue;
        }
        out.add(resolved);
    }
    graphCache.set(absFile, out);
    return out;
}

module.exports = {
    meta: { type: "problem", docs: { description: "A→B→A tight import cycle" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        return {
            ImportDeclaration(node) {
                const spec = node.source.value;
                if (typeof spec !== "string" || !spec.startsWith(".")) return;
                // Type-only imports are erased at compile time — no runtime init order race.
                if (node.importKind === "type") return;
                const fromDir = path.dirname(raw);
                let target = path.resolve(fromDir, spec.replace(/\.js$/, ".ts")).replace(/\\/g, "/");
                if (!fs.existsSync(target)) {
                    const alt = path.resolve(fromDir, spec.replace(/\.js$/, "/index.ts")).replace(/\\/g, "/");
                    if (fs.existsSync(alt)) target = alt;
                    else return;
                }
                const targetImports = readImports(target);
                if (!targetImports.has(raw)) return;
                const t = trace(node, raw, mod);
                const ctx = getContext(node);
                context.report({ node, messageId: "report", data: { report: build4DReport({
                    rule: "no-tight-import-cycle",
                    narrative: `${file}:${node.loc.start.line} imports from '${spec}' which imports back from this file (${ctx}). A→B→A cycle. Whichever side loads first sees the other's exports as undefined during module init.`,
                    graph: {
                        X: `${file}:${node.loc.start.line} ↔ ${spec.replace(/\.js$/, ".ts")} — 2-step cycle`,
                        Y: `module init order becomes load-order-dependent; bugs only repro when import order changes (rare, hard to debug)`,
                        Z: `Acyclic Module Graph — cycles defeat the JS module init contract`,
                        W: `subtle 'undefined is not a function' at boot, only on cold start, only on some platforms; refactors that shuffle imports break the cycle accidentally and surface the bug`,
                    },
                    remediation: `Extract the shared dependency into a third module that both A and B import. If the cycle is between types only, use \`import type\` (TS removes those at compile time and they don't participate in init). If the cycle is structural (A needs B and B needs A as values), the design is wrong — there's an inheritance/composition fix at the architecture level.`,
                    trace: t,
                }) } });
            },
        };
    },
};
