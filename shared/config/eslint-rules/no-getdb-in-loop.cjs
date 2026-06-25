/**
 * LVI/no-getDb-in-loop — DB connection accessor inside a loop. Same hot-spot shape as
 * no-prepare-in-loop but for the handle-fetch step (cache miss → connection open).
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

const LOOP_TYPES = new Set(["ForStatement", "ForInStatement", "ForOfStatement", "WhileStatement", "DoWhileStatement"]);
const LOOP_METHODS = new Set(["forEach", "map", "filter", "reduce", "reduceRight", "flatMap", "find", "findIndex", "some", "every"]);
const DB_FNS = new Set(["getDb", "getStaticDb", "getClanDb", "clanPluginDb", "discordGuildDb", "clanAuditDb", "clanVaultDb"]);

function isDbAccessor(node) {
    if (node.callee.type === "Identifier") return DB_FNS.has(node.callee.name);
    return false;
}

function isInsideLoop(node) {
    let p = node.parent;
    while (p) {
        if (LOOP_TYPES.has(p.type)) return p;
        if (p.type === "CallExpression" && p.callee.type === "MemberExpression" && p.callee.property.type === "Identifier" && LOOP_METHODS.has(p.callee.property.name)) return p;
        if (p.type === "FunctionDeclaration" || p.type === "FunctionExpression" || p.type === "ArrowFunctionExpression") {
            const g = p.parent;
            if (g && g.type === "CallExpression" && g.callee.type === "MemberExpression" && g.callee.property.type === "Identifier" && LOOP_METHODS.has(g.callee.property.name)) return g;
            return null;
        }
        p = p.parent;
    }
    return null;
}

module.exports = {
    meta: { type: "problem", docs: { description: "DB handle accessor inside loop — hoist" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        return {
            CallExpression(node) {
                if (!isDbAccessor(node)) return;
                const loop = isInsideLoop(node);
                if (!loop) return;
                const t = trace(node, raw, mod);
                const ctx = getContext(node);
                context.report({ node, messageId: "report", data: { report: build4DReport({
                    rule: "no-getDb-in-loop",
                    narrative: `${file}:${node.loc.start.line} calls a DB handle accessor inside a loop in ${ctx}. Even with handle caching, the lookup + cache-hit check runs every iteration. Hoist to a single \`const db = ...;\` before the loop.`,
                    graph: {
                        X: `${file}:${node.loc.start.line} — DB handle accessor inside ${loop.type}`,
                        Y: `cache lookup × N iterations; cache miss inside loop = N connection opens`,
                        Z: `Acquire Resource Once Per Scope — connection handles are scope-stable`,
                        W: `if the accessor ever changes its caching policy (e.g. per-clan dbs cached per-tenant), N iterations could each trigger expensive open + bootstrap`,
                    },
                    remediation: `Hoist before the loop: \`const db = getDb(DB_NAMES.X); for (...) db.prepare(...).run(...);\`. If different per iteration (rare), cache in a Map keyed by the iteration var.`,
                    trace: t,
                }) } });
            },
        };
    },
};
