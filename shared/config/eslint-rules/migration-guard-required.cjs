const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

function isInsideGuardedCall(node) {
    let p = node.parent;
    while (p) {
        if (
            p.type === "CallExpression" &&
            p.callee.type === "Identifier" &&
            p.callee.name === "guarded"
        ) {
            return true;
        }
        p = p.parent;
    }
    return false;
}

function isDbExecCall(node) {
    if (node.callee.type !== "MemberExpression") return false;
    if (node.callee.object.type !== "Identifier") return false;
    if (node.callee.object.name !== "db") return false;
    if (node.callee.property.type !== "Identifier") return false;
    return node.callee.property.name === "exec";
}

function isDbPrepareRunCall(node) {
    if (node.callee.type !== "MemberExpression") return false;
    if (node.callee.property.type !== "Identifier") return false;
    if (node.callee.property.name !== "run") return false;
    const receiver = node.callee.object;
    if (receiver.type !== "CallExpression") return false;
    if (receiver.callee.type !== "MemberExpression") return false;
    if (receiver.callee.object.type !== "Identifier") return false;
    if (receiver.callee.object.name !== "db") return false;
    if (receiver.callee.property.type !== "Identifier") return false;
    return receiver.callee.property.name === "prepare";
}

module.exports = {
    meta: {
        type: "problem",
        docs: { description: "Migrations must route mutations through guarded() — no raw db.exec or db.prepare(...).run()" },
        schema: [],
        messages: { report: "{{ report }}" },
    },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        if (!raw.includes("/database/migrations/")) return {};
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);

        function reportRaw(node, label, suggested) {
            const ctx = getContext(node);
            const t = trace(node, raw, mod);
            context.report({
                node,
                messageId: "report",
                data: {
                    report: build4DReport({
                        rule: "migration-guard-required",
                        narrative: `Raw ${label} in migration ${file}:${node.loc.start.line}. Migrations must route ALL mutations through guarded(db, predicate, action) — the chokepoint enforces idempotency by reading current state before mutating. Raw ${label} breaks the convergent reconciler contract: the second boot would re-apply the mutation against state that already converged.`,
                        graph: {
                            X: `${file}:${node.loc.start.line} — raw ${label} in ${ctx}`,
                            Y: `runner invokes ensure() every boot; without a guard, ${label} runs every boot → duplicate column / duplicate row / sql error`,
                            Z: `Idempotency + Crash-Only — every operation must be safe to repeat with the same observed state`,
                            W: `subsequent boots throw inside the migration → boot halts via MigrationError → service unavailable`,
                        },
                        remediation: `Wrap the mutation in guarded(db, () => <predicate>, ${suggested}). Example: guarded(db, () => !columnExists(db, "x", "y"), "ALTER TABLE x ADD COLUMN y TEXT"). For multi-step migrations pass a callback as the action argument.`,
                        trace: t,
                    }),
                },
            });
        }

        return {
            CallExpression(node) {
                if (isInsideGuardedCall(node)) return;
                if (isDbExecCall(node)) {
                    reportRaw(node, "db.exec()", "\"<your sql>\"");
                    return;
                }
                if (isDbPrepareRunCall(node)) {
                    reportRaw(node, "db.prepare(...).run()", "(db) => { db.prepare(...).run(...); }");
                }
            },
        };
    },
};
