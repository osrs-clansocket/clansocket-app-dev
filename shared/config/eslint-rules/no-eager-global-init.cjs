/**
 * LVI/no-eager-global-init — heavy work at module top level (db query, file read, network).
 * Blocks server boot; flaky tests when test env doesn't have the dependency.
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

const HEAVY_FNS = new Set(["readFileSync", "writeFileSync", "fetch", "getDb", "getClanDb", "getStaticDb", "discordGuildDb", "clanAuditDb"]);
const HEAVY_METHODS = new Set(["prepare", "run", "all", "get", "exec", "iterate"]);

function isTopLevel(node) {
    let p = node.parent;
    while (p) {
        if (p.type === "FunctionDeclaration" || p.type === "FunctionExpression" || p.type === "ArrowFunctionExpression" || p.type === "ClassBody") return false;
        if (p.type === "Program") return true;
        p = p.parent;
    }
    return false;
}

function isHeavy(node) {
    if (node.callee.type === "Identifier") return HEAVY_FNS.has(node.callee.name);
    if (node.callee.type === "MemberExpression" && node.callee.property.type === "Identifier") {
        return HEAVY_METHODS.has(node.callee.property.name);
    }
    return false;
}

module.exports = {
    meta: { type: "problem", docs: { description: "Heavy work at module top level" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        if (raw.includes("/scripts/") || raw.endsWith("/index.ts")) return {}; // index.ts is the boot point; scripts are one-shot
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        return {
            CallExpression(node) {
                if (!isHeavy(node)) return;
                if (!isTopLevel(node)) return;
                const t = trace(node, raw, mod);
                const ctx = getContext(node);
                context.report({ node, messageId: "report", data: { report: build4DReport({
                    rule: "no-eager-global-init",
                    narrative: `${file}:${node.loc.start.line} runs heavy work at module top level (${ctx}). Module import triggers this synchronously — server boot waits, tests fail when the dependency isn't available, and partial-init failures crash the import.`,
                    graph: {
                        X: `${file}:${node.loc.start.line} — heavy call at module init`,
                        Y: `import = side effect; consumers can't opt out; boot time grows linearly with importer count`,
                        Z: `Lazy Init Is Free — wrap in a function and call from the consumer when needed`,
                        W: `boot time degrades; tests randomly fail in CI when test env missing the underlying resource; partial-import failures masquerade as 'module not found'`,
                    },
                    remediation: `Wrap in a factory function that's called on demand: \`export function getX() { return X ?? (X = compute()); }\`. For genuinely one-time init that needs to happen at boot (rare), centralize in a boot orchestrator that the entry point calls explicitly.`,
                    trace: t,
                }) } });
            },
        };
    },
};
