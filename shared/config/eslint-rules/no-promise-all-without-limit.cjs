/**
 * LVI/no-promise-all-without-limit — Promise.all(items.map(...)) where items is a parameter
 * or comes from a query → unbounded concurrency. Use a concurrency-capped helper.
 *
 * Heuristic: Promise.all whose arg is `items.map(...)` where `items` is a parameter or
 * comes from a function call returning Array<T> (heuristic: variable not declared as ArrayExpression).
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

function isPromiseAll(node) {
    return node.callee.type === "MemberExpression" &&
        node.callee.object.type === "Identifier" &&
        node.callee.object.name === "Promise" &&
        node.callee.property.type === "Identifier" &&
        node.callee.property.name === "all";
}

function isBoundedRegistryCall(recv) {
    // `<x>Registry.list()` / `<x>Registry.keys()` is bounded by self-registration at boot.
    // Once module loading completes, the collection size is fixed (registries dont grow at
    // runtime in this codebase). Promise.all over registry.list() is the workspace's
    // legitimate fan-out shape for "do X for each registered Y".
    if (recv.type !== "CallExpression") return false;
    if (recv.callee.type !== "MemberExpression") return false;
    if (recv.callee.property.type !== "Identifier") return false;
    if (recv.callee.property.name !== "list" && recv.callee.property.name !== "keys") return false;
    const obj = recv.callee.object;
    if (obj.type !== "Identifier") return false;
    return /[Rr]egistry$/.test(obj.name);
}

function isSlicedReceiver(recv) {
    // `<src>.slice(i, i+N).map(...)` — the slice IS the concurrency cap. Standard batched
    // fan-out pattern: `for (let i = 0; i < items.length; i += N) await Promise.all(items.slice(i, i+N).map(fn))`.
    if (recv.type !== "CallExpression") return false;
    if (recv.callee.type !== "MemberExpression") return false;
    if (recv.callee.property.type !== "Identifier") return false;
    return recv.callee.property.name === "slice";
}

function isUnboundedMap(arg) {
    if (!arg) return false;
    if (arg.type !== "CallExpression") return false;
    if (arg.callee.type !== "MemberExpression") return false;
    if (arg.callee.property.type !== "Identifier" || arg.callee.property.name !== "map") return false;
    // The receiver of .map() is the iterable. If it's a literal array, bounded.
    const recv = arg.callee.object;
    if (recv.type === "ArrayExpression") return false; // explicit literal array, bounded
    if (isBoundedRegistryCall(recv)) return false; // <X>Registry.list()/keys() — bounded at boot
    if (isSlicedReceiver(recv)) return false; // <X>.slice(...) — caller capped via slice window
    return true; // anything else (param, call result, member access) is potentially unbounded
}

module.exports = {
    meta: { type: "problem", docs: { description: "Promise.all on unbounded items — concurrency storm risk" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        return {
            CallExpression(node) {
                if (!isPromiseAll(node)) return;
                const arg = node.arguments[0];
                if (!isUnboundedMap(arg)) return;
                const t = trace(node, raw, mod);
                const ctx = getContext(node);
                context.report({ node, messageId: "report", data: { report: build4DReport({
                    rule: "no-promise-all-without-limit",
                    narrative: `${file}:${node.loc.start.line} runs Promise.all over an unbounded mapped collection in ${ctx}. Every item starts concurrently with no cap — if the collection has 1000 items, that's 1000 simultaneous async ops competing for sockets / file handles / DB connections.`,
                    graph: {
                        X: `${file}:${node.loc.start.line} — Promise.all(<dynamic>.map(...))`,
                        Y: `concurrency = collection.length; no backpressure, no fan-out cap`,
                        Z: `Bound Concurrency Or Bound The Source — promises are cheap to start, expensive to fan out`,
                        W: `connection pool exhaustion, ENOMEM, downstream rate-limit cascade; whole subsystem degrades when one upstream is slow`,
                    },
                    remediation: `Either: (1) cap the concurrency with a helper (e.g. \`pLimit(8)\`, batched chunks of N at a time); (2) sequentialize with \`for await\` if order matters; (3) prove the source is bounded at the call site and add a comment naming the bound. \`Promise.all(items.map(fn))\` is correct ONLY when items.length is statically small.`,
                    trace: t,
                }) } });
            },
        };
    },
};
