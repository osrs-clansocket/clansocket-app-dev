/**
 * LVI/no-time-of-check-time-of-use — `await exists(x)` followed by `await use(x)` on
 * the same key. Race window: another caller can delete/modify between check and use.
 *
 * Heuristic: two consecutive await statements in the same block where the first is a
 * check-shaped callee (exists / has / find / get) and the second is a mutate-shaped callee
 * (update / set / write / save / delete / remove / apply) on a similar key.
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

const CHECK_RE = /^(exists|has|find|get|read|fetch|lookup|count|peek|isOwner|isClanManager|canSeeScope)/i;
const MUTATE_RE = /(update|set|write|save|delete|remove|apply|insert|upsert|persist|grant|revoke|enable|disable|attach|detach|bind|unbind|rename|move|publish|finalize|commit)/i;

function calleeIdent(node) {
    if (node.type !== "CallExpression") return null;
    if (node.callee.type === "Identifier") return node.callee.name;
    if (node.callee.type === "MemberExpression" && node.callee.property.type === "Identifier") return node.callee.property.name;
    return null;
}

// Walk a MemberExpression chain down to its root Identifier (e.g. `a.b.c` → "a").
function rootIdentifier(expr) {
    let cur = expr;
    while (cur) {
        if (cur.type === "Identifier") return cur.name;
        if (cur.type === "MemberExpression") cur = cur.object;
        else return null;
    }
    return null;
}

// When the check's await is `const x = await fetch(...)` and the mutate call USES `x` (as
// its callee root OR as a direct arg), the mutate operates on the SAME REFERENCE the check
// returned. That's "get handle + call API on handle" — the API call is itself atomic; no
// separate decision is being raced.
function mutateUsesCheckBinding(checkStmt, mutateCall) {
    if (checkStmt.type !== "VariableDeclaration") return false;
    const decl = checkStmt.declarations[0];
    if (!decl || decl.id.type !== "Identifier") return false;
    const bound = decl.id.name;
    if (rootIdentifier(mutateCall.callee) === bound) return true;
    for (const arg of mutateCall.arguments) {
        if (arg && arg.type === "Identifier" && arg.name === bound) return true;
    }
    return false;
}

function awaitInsideExpression(stmt) {
    if (!stmt) return null;
    if (stmt.type === "ExpressionStatement" && stmt.expression.type === "AwaitExpression") return stmt.expression.argument;
    if (stmt.type === "VariableDeclaration" && stmt.declarations[0] && stmt.declarations[0].init && stmt.declarations[0].init.type === "AwaitExpression") return stmt.declarations[0].init.argument;
    if (stmt.type === "IfStatement" && stmt.test.type === "AwaitExpression") return stmt.test.argument;
    if (stmt.type === "IfStatement" && stmt.test.type === "UnaryExpression" && stmt.test.argument.type === "AwaitExpression") return stmt.test.argument.argument;
    return null;
}

module.exports = {
    meta: { type: "problem", docs: { description: "TOCTOU: await check then await use on same data" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        return {
            BlockStatement(node) {
                for (let i = 0; i < node.body.length - 1; i++) {
                    const a = awaitInsideExpression(node.body[i]);
                    const b = awaitInsideExpression(node.body[i + 1]);
                    if (!a || !b) continue;
                    const aName = calleeIdent(a);
                    const bName = calleeIdent(b);
                    if (!aName || !bName) continue;
                    if (!CHECK_RE.test(aName)) continue;
                    if (!MUTATE_RE.test(bName)) continue;
                    if (mutateUsesCheckBinding(node.body[i], b)) continue;
                    const t = trace(node.body[i], raw, mod);
                    const ctx = getContext(node.body[i]);
                    context.report({ node: node.body[i], messageId: "report", data: { report: build4DReport({
                        rule: "no-time-of-check-time-of-use",
                        narrative: `${file}:${node.body[i].loc.start.line} performs an await on '${aName}(...)' (check) followed by await on '${bName}(...)' (mutate) in ${ctx}. Between the two awaits another concurrent caller can mutate the underlying state — the check result becomes stale.`,
                        graph: {
                            X: `${file}:${node.body[i].loc.start.line} — await ${aName}() at line ${node.body[i].loc.start.line}, await ${bName}() at line ${node.body[i+1].loc.start.line}`,
                            Y: `event loop yields between the two awaits; another request can run and invalidate the precondition`,
                            Z: `Check And Act Must Be Atomic — either both inside a transaction, or the mutate must be idempotent / conditional`,
                            W: `concurrent race: 'check said it was safe to delete'; another caller already deleted; second delete fails OR worse, the second caller's recreate is now lost`,
                        },
                        remediation: `One of: (1) wrap both calls in a single DB transaction so the row lock spans them; (2) make the mutate self-checking (e.g. UPDATE ... WHERE existing_condition); (3) restructure to use a single atomic call (e.g. INSERT ON CONFLICT DO UPDATE).`,
                        trace: t,
                    }) } });
                    return;
                }
            },
        };
    },
};
