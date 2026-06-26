/**
 * LVI/no-untracked-observer — `new ResizeObserver(...)` / `new
 * IntersectionObserver(...)` / `new MutationObserver(...)` must have its
 * `.disconnect()` reachable from some lifecycle. Heuristic: the same
 * function scope must contain at least one of:
 *   (a) `<observer>.disconnect()` — explicit cleanup
 *   (b) `trackDispose({ dispose: () => observer.disconnect() })` — Instance-tracked
 *   (c) `return ... observer ...` — returned for caller to dispose
 *   (d) `this.X = observer` — captured as class field (presumed managed)
 *
 * If none of these, the observer is a permanent subscription on the
 * observed element — the browser keeps the callback alive as long as the
 * observation is active. Per-mount observers (clan-map ResizeObserver,
 * runewatch IntersectionObserver) leak one observer per mount; route
 * changes accumulate them.
 *
 * Why: observers are the third leak class after createInstance(rawEl)
 * temp wrappers and bare effect() — different mechanism, same outcome.
 * They hold strong refs to their callback closure (which usually closes
 * over component state); even if the observed element is GC'd, the
 * observer survives until explicitly disconnected.
 *
 * Caught:
 *   const obs = new ResizeObserver(cb); obs.observe(el);  // no disconnect path
 *
 * Allowed:
 *   const obs = new ResizeObserver(cb); obs.observe(el);
 *   host.trackDispose({ dispose: () => obs.disconnect() });
 *
 *   const obs = new IntersectionObserver((es, o) => {
 *     for (const e of es) { fire(); o.disconnect(); }
 *   });                                                    // self-disconnects
 *
 * Exempt files:
 *   src/dom/factory/**          — factory's own internals
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, trace } = require("./report-builder.cjs");

const OBSERVER_CTORS = new Set(["ResizeObserver", "IntersectionObserver", "MutationObserver", "PerformanceObserver"]);
const EXEMPT_PATH_SEGMENTS = [
    "/dom/factory/",
];

function isExemptPath(normPath) {
    for (const seg of EXEMPT_PATH_SEGMENTS) {
        if (normPath.includes(seg)) return true;
    }
    return false;
}

function isObserverNew(node) {
    return node.type === "NewExpression"
        && node.callee
        && node.callee.type === "Identifier"
        && OBSERVER_CTORS.has(node.callee.name);
}

function getEnclosingFunctionScope(node) {
    let p = node.parent;
    while (p) {
        if (p.type === "FunctionDeclaration"
            || p.type === "FunctionExpression"
            || p.type === "ArrowFunctionExpression"
            || p.type === "MethodDefinition"
            || p.type === "Program") return p;
        p = p.parent;
    }
    return null;
}

function reportUntracked(context, node, varName, ctorName) {
    const raw = (context.filename || context.getFilename()).split("\\").join("/");
    const t = trace(node, raw, getModuleForFile(raw));
    context.report({
        node,
        messageId: "report",
        data: {
            report: build4DReport({
                rule: "no-untracked-observer",
                narrative: `${t.file}:${t.line} constructs new ${ctorName}(...) and observes a target, but no .disconnect() reaches the same function scope. The observer is a permanent subscription — the browser keeps the callback closure (which closes over component state) alive until explicit disconnect. Per-mount construction means each mount leaks one observer; under route changes the count grows monotonically.`,
                graph: {
                    X: `${t.file}:${t.line} — \`new ${ctorName}(...)\`${varName ? ` assigned to \`${varName}\`` : ""} in ${t.context}, no .disconnect() in same scope`,
                    Y: `observer holds strong ref to callback + closed-over state; observed element GC doesn't reach the observer; subscription persists past the component's lifetime`,
                    Z: `Subscribe/Unsubscribe Pair — every browser-side subscription (signals, listeners, observers) must declare its lifecycle`,
                    W: `silent accumulation: no console warning; CPU + RAM degrade over long sessions; debugging requires Performance Observer or heap snapshot inspection`,
                },
                remediation: `Track the observer on the owning Instance: \`host.trackDispose({ dispose: () => ${varName || "observer"}.disconnect() });\`. For helpers that don't have an Instance in scope, return a Disposable from the function and let the caller track it. For self-disconnecting one-shots (IntersectionObserver that fires once and calls o.disconnect() inside the callback), the existing pattern is fine — the rule walks the function scope for any .disconnect() call.`,
                trace: t,
            }),
        },
    });
}

module.exports = {
    meta: {
        type: "problem",
        docs: { description: "Observer constructors must have a reachable .disconnect() — browser-side subscription leak otherwise." },
        schema: [],
        messages: { report: "{{ report }}" },
    },
    create(context) {
        const raw = (context.filename || context.getFilename()).split("\\").join("/");
        if (isExemptPath(raw)) return {};
        const pending = [];
        return {
            NewExpression(node) {
                if (!isObserverNew(node)) return;
                let varName = null;
                if (node.parent && node.parent.type === "VariableDeclarator" && node.parent.id && node.parent.id.type === "Identifier") {
                    varName = node.parent.id.name;
                }
                if (node.parent && node.parent.type === "AssignmentExpression"
                    && node.parent.left && node.parent.left.type === "MemberExpression"
                    && node.parent.left.property && node.parent.left.property.type === "Identifier") {
                    // captured as field: `this.X = new ResizeObserver(...)` — presumed managed
                    if (node.parent.left.object && node.parent.left.object.type === "ThisExpression") return;
                }
                const fn = getEnclosingFunctionScope(node);
                pending.push({ node, varName, ctorName: node.callee.name, fn });
            },
            "Program:exit"() {
                // Walk pending list; for each, search the function scope for `.disconnect()` calls
                // on any identifier OR an observer-related callback-shaped scenario.
                const src = context.sourceCode || context.getSourceCode();
                for (const p of pending) {
                    if (!p.fn) continue;
                    const fnText = src.getText(p.fn);
                    if (!fnText) continue;
                    // Cheap textual check: does the function body contain `.disconnect()`?
                    // If yes, assume it's wired (allows trackDispose, return, or inline self-disconnect).
                    if (fnText.includes(".disconnect()")) continue;
                    // Also allow returning the observer ref (caller responsibility).
                    if (p.varName && new RegExp(`return[^;]*\\b${p.varName}\\b`).test(fnText)) continue;
                    reportUntracked(context, p.node, p.varName, p.ctorName);
                }
            },
        };
    },
};
