/**
 * LVI/no-bare-effect — `effect(() => {...})` calls must be tracked. Either:
 *   (a) `xxx.trackDispose(effect(() => {...}))` — the canonical path
 *   (b) `const dispose = effect(...)` — captured for later disposal
 *   (c) `return effect(...)` — returned as a Disposable
 *
 * Bare effect-as-ExpressionStatement is banned because the effect's
 * signal subscription accumulates forever — every render of the containing
 * Instance leaks the prior call's subscription. Under realtime SSE
 * traffic this compounds: each signal write fans out to N+1 subscribers,
 * N+2, N+3 ... and every detached-but-not-destroyed Instance keeps
 * re-running its handlers against orphan DOM nodes.
 *
 * The substrate at `dom/factory/reactive.ts` `effect()` returns a
 * Disposable: `{ dispose(): void }`. trackDispose attaches it to an
 * Instance's disposers list — when the Instance is destroyed (via R1
 * cascade or explicit destroy), the effect's signal subscription is
 * removed from every dep's observer set. Bare-effect skips this entirely.
 *
 * Caught:
 *   function build() { effect(() => { ... }); }    // function-scope leak
 *   class X { method() { effect(() => { ... }); } } // method-scope leak
 *
 * Allowed:
 *   host.trackDispose(effect(() => { ... }));
 *   const dispose = effect(() => { ... });
 *   return effect(() => { ... });
 *
 *   // Module scope (app-lifetime, intentional):
 *   effect(() => { ... });   // at top-level — persisted-signal save, CSS sync
 *
 * Exempt files:
 *   src/dom/factory/**     — factory internals own their disposer plumbing
 *   src/state/effects/**   — state effects export their own teardown contract
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, trace } = require("./report-builder.cjs");

const EXEMPT_PATH_SEGMENTS = [
    "/dom/factory/",
    "/state/effects/",
];

function isExemptPath(normPath) {
    for (const seg of EXEMPT_PATH_SEGMENTS) {
        if (normPath.includes(seg)) return true;
    }
    return false;
}

function isEffectCall(node) {
    return node.type === "CallExpression"
        && node.callee
        && node.callee.type === "Identifier"
        && node.callee.name === "effect";
}

function reportBare(context, node) {
    const raw = (context.filename || context.getFilename()).split("\\").join("/");
    const t = trace(node, raw, getModuleForFile(raw));
    context.report({
        node,
        messageId: "report",
        data: {
            report: build4DReport({
                rule: "no-bare-effect",
                narrative: `${t.file}:${t.line} calls effect(() => {...}) as a bare ExpressionStatement. The Disposable returned by effect() is dropped — the signal subscription is permanent. Every Instance render that hits this path adds another subscriber; per realtime SSE write the handler runs N+1, N+2, N+3 ... times. Detached DOM mutated by orphan handlers continues to drive layout/paint until the page unloads.`,
                graph: {
                    X: `${t.file}:${t.line} — bare effect() in ${t.context}, no trackDispose / no captured dispose ref`,
                    Y: `every call adds a subscriber to each dep signal; subscriber set grows monotonically over the session`,
                    Z: `Subscribe/Unsubscribe Pair — every signal subscription must declare its lifecycle (trackDispose, return, or capture)`,
                    W: `silent accumulation: no warning fires; CPU degrades slowly as signal writes fan out to N+k handlers per write; debugging hits "why is my chart updating six times per tick"`,
                },
                remediation: `Wrap in the owning Instance's trackDispose: \`host.trackDispose(effect(() => {...}));\`. For bind-style helpers that return Disposable, do \`return effect(() => {...});\` and let the caller track it. The factory at dom/factory/reactive.ts effect() already returns the right shape — no other API change needed.`,
                trace: t,
            }),
        },
    });
}

module.exports = {
    meta: {
        type: "problem",
        docs: { description: "Bare effect() calls leak signal subscriptions — wrap in trackDispose or capture the Disposable." },
        schema: [],
        messages: { report: "{{ report }}" },
    },
    create(context) {
        const raw = (context.filename || context.getFilename()).split("\\").join("/");
        if (isExemptPath(raw)) return {};
        function isModuleScope(node) {
            // ExpressionStatement whose parent is Program (or BlockStatement
            // directly inside Program) is module-level.
            let p = node.parent;
            while (p) {
                if (p.type === "FunctionDeclaration"
                    || p.type === "FunctionExpression"
                    || p.type === "ArrowFunctionExpression"
                    || p.type === "MethodDefinition") return false;
                if (p.type === "Program") return true;
                p = p.parent;
            }
            return true;
        }
        return {
            ExpressionStatement(node) {
                if (!isEffectCall(node.expression)) return;
                // App-lifetime module-scope effects are intentional (persisted
                // signal save, top-level CSS var sync, etc.) — they live as
                // long as the module export they bind to.
                if (isModuleScope(node)) return;
                reportBare(context, node.expression);
            },
        };
    },
};
