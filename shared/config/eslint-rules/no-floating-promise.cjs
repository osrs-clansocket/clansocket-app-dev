/**
 * LVI/no-floating-promise — Call to a function whose name suggests async (verb-then-Async or
 * known-async callee) whose result is not awaited / .then'd / .catch'd / returned.
 *
 * Heuristic without TS types:
 *   - CallExpression that is also an ExpressionStatement (result discarded)
 *   - Callee name ends with 'Async' OR is a member call on a known async-ish object
 *   - Parent is NOT AwaitExpression, NOT a chained .then/.catch
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

// Suffix convention: `fetchUserAsync`, `loadAsynchronously`.
const ASYNC_SUFFIX_RE = /(Async|Asynchronously)$/;
// Prefix verbs that strongly indicate Promise return. Narrow on purpose — excludes
// broad verbs (apply/update/open/close/bind/set/emit/read/write/post/put/patch/delete)
// that are usually synchronous in this codebase (DOM writes, event emits, state setters,
// or DOM/RTC primitives like `postMessage` / `deleteRecord`).
const ASYNC_PREFIX_RE = /^(fetch)([A-Z_]|$)/;

function isPromiseChainOrAwait(node) {
    const p = node.parent;
    if (!p) return false;
    if (p.type === "AwaitExpression") return true;
    if (p.type === "ReturnStatement") return true;
    if (p.type === "ArrowFunctionExpression" && p.body === node) return true; // implicit return
    if (p.type === "VariableDeclarator" || p.type === "AssignmentExpression") return true;
    if (p.type === "UnaryExpression" && p.operator === "void") return true; // explicit fire-and-forget marker
    if (p.type === "MemberExpression" && p.object === node) {
        const prop = p.property;
        if (prop.type === "Identifier" && (prop.name === "then" || prop.name === "catch" || prop.name === "finally")) return true;
    }
    if (p.type === "CallExpression" && p.callee.type === "MemberExpression" && p.callee.object === node) {
        // x.then(...) form caught above; this catches when our call is the callee receiver of a chain
        return true;
    }
    return false;
}

function calleeName(node) {
    if (node.callee.type === "Identifier") return node.callee.name;
    if (node.callee.type === "MemberExpression" && node.callee.property.type === "Identifier") return node.callee.property.name;
    return null;
}

module.exports = {
    meta: { type: "problem", docs: { description: "Floating promise — result not awaited/handled" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        return {
            ExpressionStatement(node) {
                if (node.expression.type !== "CallExpression") return;
                const call = node.expression;
                const name = calleeName(call);
                if (!name) return;
                if (!ASYNC_SUFFIX_RE.test(name) && !ASYNC_PREFIX_RE.test(name)) return;
                if (isPromiseChainOrAwait(call)) return;
                const t = trace(call, raw, mod);
                const ctx = getContext(call);
                context.report({ node: call, messageId: "report", data: { report: build4DReport({
                    rule: "no-floating-promise",
                    narrative: `${file}:${call.loc.start.line} calls ${name}(...) as a statement (result discarded) in ${ctx}. The name suggests this returns a Promise; an unhandled rejection here propagates as 'UnhandledPromiseRejection' and may crash the process under future Node versions. Even when it doesn't reject, the caller continues without waiting for completion.`,
                    graph: {
                        X: `${file}:${call.loc.start.line} — ${name}() called as statement, no await/then/catch`,
                        Y: `caller doesn't know when this completes; rejection has no handler`,
                        Z: `Promises Are Values — discarding the value discards the contract of completion`,
                        W: `intermittent prod crashes; queue ordering bugs (later code runs before earlier); error rates invisible until they cause symptoms`,
                    },
                    remediation: `One of: (1) \`await ${name}(...)\` if the caller should block; (2) \`return ${name}(...)\` if the caller's contract should propagate; (3) \`${name}(...).catch((err) => logger.error(...))\` if fire-and-forget is intentional. The empty case is never correct.`,
                    trace: t,
                }) } });
            },
        };
    },
};
