/**
 * LVI/no-mixed-concerns — Detects SoC violations: files mixing multiple concerns,
 * via TF-IDF clustering over identifier tokens. Mandates structural decomposition
 * (split one file into N siblings, one concern per file) — never token renames.
 * Stop-words are derived dynamically from the codebase corpus (no curated lists).
 * Requires .lint-reports/token-corpus.json — fail closed if missing.
 */
const fs = require("node:fs");
const path = require("node:path");
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, trace } = require("./report-builder.cjs");

const CORPUS_PATH = path.resolve(__dirname, "..", "..", "..", ".lint-reports", "token-corpus.json");

let corpus = null;
let corpusError = null;
let idfMap = null;
let idfCutoff = 0;

function loadCorpus() {
    if (corpus !== null || corpusError !== null) return;
    let raw;
    try {
        raw = fs.readFileSync(CORPUS_PATH, "utf-8");
    } catch (err) {
        corpusError = `corpus file missing or unreadable at ${CORPUS_PATH}: ${err.code || err.message}`;
        return;
    }
    try {
        corpus = JSON.parse(raw);
    } catch (err) {
        corpusError = `corpus JSON parse failed: ${err.message}`;
        return;
    }
    if (!corpus || typeof corpus.totalFiles !== "number" || !corpus.tokenFileCount) {
        corpusError = `corpus shape invalid: missing totalFiles or tokenFileCount`;
        corpus = null;
        return;
    }
    idfMap = Object.create(null);
    const total = corpus.totalFiles;
    for (const [t, n] of Object.entries(corpus.tokenFileCount)) {
        idfMap[t] = Math.log(total / n);
    }
    const idfs = Object.values(idfMap).sort((a, b) => a - b);
    idfCutoff = idfs.length > 0 ? idfs[Math.floor(idfs.length * 0.5)] : 0;
}

function tokenize(name) {
    return name
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
        .split(/[\s_-]+/)
        .filter((t) => t.length > 0)
        .map((t) => t.toLowerCase());
}

function concernSet(name) {
    const out = new Set();
    for (const t of tokenize(name)) {
        const idf = idfMap[t];
        if (idf !== undefined && idf >= idfCutoff) out.add(t);
    }
    return out;
}

// Verb-family cohesion override: if every declaration in the file shares the same first
// token (verb-stem), the file is single-role regardless of how TF-IDF clusters the suffixes.
// Example: `validateNumber`/`validateEnum`/`validateField` all share `validate` — that IS
// the role, even though `validate` is too common (low IDF) to make it into concern sets
// individually. The shared first-token across ALL decls is the role-cohesion signal.
function sharesVerbFamily(declarations) {
    if (declarations.length < 2) return false;
    let firstToken = null;
    for (const d of declarations) {
        const tokens = tokenize(d.name);
        if (tokens.length === 0) return false;
        if (firstToken === null) firstToken = tokens[0];
        else if (tokens[0] !== firstToken) return false;
    }
    return true;
}

function jaccard(a, b) {
    if (a.size === 0 && b.size === 0) return 1;
    if (a.size === 0 || b.size === 0) return 0;
    let inter = 0;
    for (const t of a) if (b.has(t)) inter++;
    return inter / (a.size + b.size - inter);
}

function clusterByJaccard(declarations, pairThreshold) {
    const n = declarations.length;
    const parent = new Array(n).fill(0).map((_, i) => i);
    const find = (x) => {
        while (parent[x] !== x) {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    };
    const union = (a, b) => {
        const ra = find(a);
        const rb = find(b);
        if (ra !== rb) parent[ra] = rb;
    };
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            if (jaccard(declarations[i].set, declarations[j].set) >= pairThreshold) union(i, j);
        }
    }
    const groups = new Map();
    for (let i = 0; i < n; i++) {
        const r = find(i);
        if (!groups.has(r)) groups.set(r, []);
        groups.get(r).push(declarations[i]);
    }
    return [...groups.values()];
}

function collectDeclarations(programBody) {
    const out = [];
    for (const node of programBody) {
        const target = node.type === "ExportNamedDeclaration" ? node.declaration : node;
        if (!target) continue;
        if (target.type === "FunctionDeclaration" && target.id) out.push({ name: target.id.name, isType: false });
        else if (target.type === "ClassDeclaration" && target.id) out.push({ name: target.id.name, isType: false });
        else if (target.type === "TSInterfaceDeclaration" && target.id) out.push({ name: target.id.name, isType: true });
        else if (target.type === "TSTypeAliasDeclaration" && target.id) out.push({ name: target.id.name, isType: true });
        else if (target.type === "TSEnumDeclaration" && target.id) out.push({ name: target.id.name, isType: false });
        else if (target.type === "VariableDeclaration") {
            for (const d of target.declarations) {
                if (d.id && d.id.type === "Identifier" && d.init) {
                    const k = d.init.type;
                    if (
                        k === "ArrowFunctionExpression" ||
                        k === "FunctionExpression" ||
                        k === "ObjectExpression" ||
                        k === "ClassExpression"
                    ) {
                        out.push({ name: d.id.name, isType: false });
                    }
                }
            }
        }
    }
    return out;
}

function isPureTypesFile(declarations) {
    if (declarations.length === 0) return false;
    return declarations.every((d) => d.isType);
}

function isBarrelFile(programBody) {
    let re = 0;
    let other = 0;
    for (const node of programBody) {
        if (node.type === "ExportAllDeclaration") re++;
        else if (node.type === "ExportNamedDeclaration" && node.source) re++;
        else if (node.type !== "ImportDeclaration") other++;
    }
    return re > 0 && other === 0;
}


function clusterLabel(group) {
    const tokens = new Set();
    for (const d of group) for (const t of d.set) tokens.add(t);
    const sorted = [...tokens].sort();
    return sorted.slice(0, 2).join("/") || "unclassified";
}

module.exports = {
    meta: {
        type: "problem",
        docs: { description: "Detect SoC violations: multi-concern files via dynamic TF-IDF concern clustering" },
        schema: [
            {
                type: "object",
                properties: {
                    maxConcerns: { type: "number" },
                    minDeclarations: { type: "number" },
                    pairThreshold: { type: "number" },
                },
                additionalProperties: false,
            },
        ],
        messages: { report: "{{ report }}" },
    },
    create(context) {
        const opts = context.options[0] || {};
        const maxConcerns = opts.maxConcerns ?? 2;
        const minDeclarations = opts.minDeclarations ?? 3;
        const pairThreshold = opts.pairThreshold ?? 0.3;
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw) || "unknown";
        loadCorpus();
        if (corpusError !== null) {
            return {
                "Program:exit"(node) {
                    const t = trace(node, raw, mod);
                    context.report({
                        node,
                        messageId: "report",
                        data: {
                            report: build4DReport({
                                rule: "no-mixed-concerns",
                                narrative: `Token corpus required for SoC enforcement is missing. ${corpusError}.`,
                                graph: {
                                    X: `.lint-reports/token-corpus.json — required input for lvi/no-mixed-concerns`,
                                    Y: `every TS file across dashboard/server/discord depends on the corpus for concern-cardinality detection`,
                                    Z: `LAW 0 enforcement gate — fails closed without corpus state`,
                                    W: `silent skip would let SoC violations re-accumulate without detection`,
                                },
                                remediation: `Run \`npm run sync:tokens\` to regenerate the corpus. Include in \`npm run chain:verify\` so it stays current.`,
                                trace: t,
                            }),
                        },
                    });
                },
            };
        }
        return {
            "Program:exit"(node) {
                if (isBarrelFile(node.body)) return;
                const declarations = collectDeclarations(node.body);
                if (declarations.length < minDeclarations) return;
                if (isPureTypesFile(declarations)) return;
                if (sharesVerbFamily(declarations)) return;
                for (const d of declarations) d.set = concernSet(d.name);
                const clusters = clusterByJaccard(declarations, pairThreshold);
                if (clusters.length <= maxConcerns) return;
                const t = trace(node, raw, mod);
                const lines = clusters
                    .map((g) => `    ├─ ${clusterLabel(g)}: ${g.map((d) => d.name).join(", ")}`)
                    .join("\n");
                context.report({
                    node,
                    messageId: "report",
                    data: {
                        report: build4DReport({
                            rule: "no-mixed-concerns",
                            narrative: `${t.file} mixes ${clusters.length} distinct concerns across ${declarations.length} declarations (max ${maxConcerns}). SoC violation — concern dispersion detected via TF-IDF over identifier tokens.`,
                            graph: {
                                X: `${t.file} — ${clusters.length} concern clusters, ${maxConcerns} max`,
                                Y: `co-located concerns couple consumers to unrelated code; every consumer pulls every concern`,
                                Z: `LAW 0 single-concern + dynamic TF-IDF clustering (pair Jaccard ${pairThreshold}, IDF cutoff ${idfCutoff.toFixed(2)})`,
                                W: `mixed-concern files breed cross-file duplication and resist deletion`,
                            },
                            remediation: `MANDATORY: structural decomposition. Detected concern clusters:\n${lines}\n\n  Split this file into N sibling files — one concern per file — using the same domain prefix. Each cluster above becomes its own \`{prefix}-{concern}.ts\` sibling. NEVER rename tokens to merge clusters — token renames mask the SoC violation; they don't resolve it. Re-exports from the original file are allowed for backwards-compat.`,
                            trace: t,
                        }),
                    },
                });
            },
        };
    },
};
