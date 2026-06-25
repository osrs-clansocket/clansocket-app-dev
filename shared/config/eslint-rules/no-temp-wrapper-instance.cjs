/**
 * LVI/no-temp-wrapper-instance — `createInstance(rawEl).clear()` /
 * `.setChildren(...)` / `.destroy()` / `.addChild(<Instance>)` is banned.
 *
 * The substrate at `dom/factory/core/instance.ts:90-112` allocates a
 * fresh `tracked = new Set<Instance>()` and `disposers = []` PER CALL to
 * `createInstance(el)`. The wrapper's lifecycle is owned ONLY by the
 * caller's local scope — when the statement ends, the wrapper is GC'd
 * along with its tracked set and disposer list.
 *
 * Consequence:
 *   - `.clear()` / `.destroy()` iterate the wrapper's tracked set;
 *     because it's a fresh empty Set, NO children destroy. DOM nodes
 *     are wiped via replaceChildren but their JS-side disposers
 *     (effects, listeners, raf timers) leak.
 *   - `.setChildren(...newKids)` tracks newKids on a wrapper that GC's
 *     next statement; subsequent calls can't reach them to destroy.
 *   - `.addChild(<Instance>)` tracks the Instance child on a dead
 *     wrapper; the child's disposer chain has no cleanup path.
 *
 * The fix family (canonical):
 *   - PERSISTENT HOST: WeakMap<rawEl, Instance> caches one wrapper per
 *     element. Same wrapper across all calls → real tracked set.
 *   - TAKE Instance: change the function signature from `host: HTMLElement`
 *     to `host: Instance`. Caller passes the Instance it built.
 *   - FORWARD-REF: closures that need the host-to-be-built capture it
 *     via a `{ current: Instance | null }` ref set after construction.
 *   - USE THE LOCAL Instance: if you built the Instance two lines up,
 *     use it directly — don't wrap it back into `createInstance(x.el)`.
 *
 * Caught patterns (outside src/dom/factory/**):
 *   createInstance(host).clear()                  // setChildren via temp wrapper
 *   createInstance(host).setChildren(a, b)         // same
 *   createInstance(host).destroy()                 // worse — runs against empty tracked
 *   createInstance(host).addChild(someInstance)    // tracks on dead wrapper
 *
 * Allowed (NOT caught):
 *   createInstance(host).addChild(rawElement)      // raw element children aren't tracked anyway
 *   createInstance(host).setText("..."), .setAttr(...), .removeEffect(...)  // API sugar, no disposer chain
 *   const inst = createInstance(host); ...long-lived use...                  // captured in scope
 *   HOSTS.set(el, createInstance(el))                                        // WeakMap cache pattern
 *
 * Exempt files:
 *   src/dom/factory/**       — factory itself
 *   src/dom/ai/panel/messages-host.ts — canonical persistent-host helper
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, trace } = require("./report-builder.cjs");

const LEAKY_METHODS = new Set(["clear", "setChildren", "destroy"]);
const ADD_METHODS = new Set(["addChild", "addBefore", "addFirst", "addBatchBefore"]);
const EXEMPT_PATH_SEGMENTS = [
    "/dom/factory/",
    "/messages-host.ts",
];

function isExemptPath(normPath) {
    for (const seg of EXEMPT_PATH_SEGMENTS) {
        if (normPath.includes(seg)) return true;
    }
    return false;
}

// `createInstance(x).method(...)` — return the method name + the inner arg
function matchTempWrapperCall(node) {
    if (node.type !== "CallExpression") return null;
    const callee = node.callee;
    if (!callee || callee.type !== "MemberExpression") return null;
    const methodName = callee.property && callee.property.name;
    if (!methodName) return null;
    const obj = callee.object;
    if (!obj || obj.type !== "CallExpression") return null;
    if (!obj.callee || obj.callee.type !== "Identifier" || obj.callee.name !== "createInstance") return null;
    return { methodName, addArgs: node.arguments };
}

// Best-effort: is the AST node likely an Instance vs a raw HTMLElement?
// Cheap heuristic: Identifier — assume Instance UNLESS name hints at raw
// (ends with "El", "Element", or is "el"/"node"/"target"/"document").
const RAW_HINT_NAMES = new Set(["el", "node", "target", "rawEl", "container", "host", "parent", "btn", "btnEl", "shell"]);
const RAW_NAME_SUFFIXES = [/El$/, /Element$/, /Node$/];

function looksLikeRawElement(argNode) {
    if (!argNode) return false;
    if (argNode.type === "MemberExpression"
        && argNode.property && argNode.property.type === "Identifier"
        && argNode.property.name === "el") return true; // foo.el → raw element
    if (argNode.type === "Identifier") {
        if (RAW_HINT_NAMES.has(argNode.name)) return true;
        for (const re of RAW_NAME_SUFFIXES) if (re.test(argNode.name)) return true;
    }
    if (argNode.type === "CallExpression"
        && argNode.callee && argNode.callee.type === "Identifier"
        && argNode.callee.name === "document") return true;
    return false;
}

function reportLeak(context, node, methodName, kind) {
    const raw = (context.filename || context.getFilename()).split("\\").join("/");
    const t = trace(node, raw, getModuleForFile(raw));
    context.report({
        node,
        messageId: "report",
        data: {
            report: build4DReport({
                rule: "no-temp-wrapper-instance",
                narrative: `${t.file}:${t.line} calls \`createInstance(...).${methodName}(${kind === "instance-child" ? "<Instance>" : "..."})\` as a temp wrapper. The fresh wrapper's tracked-children Set is allocated per-call, dies with the statement, and the substrate at dom/factory/core/instance.ts has no way to reach it again. ${methodName === "destroy" ? "destroy() iterates an empty Set — prior Instance disposers never run." : methodName === "clear" ? "clear() iterates an empty Set + replaceChildren wipes DOM, but tracked Instances' disposers leak (effects, listeners, raf, intervals)." : methodName === "setChildren" ? "setChildren tracks the new children on a wrapper that GC's next statement; next call can't reach them to destroy." : "addChild tracks the Instance child on a dead wrapper; child's disposer chain has no cleanup path."}`,
                graph: {
                    X: `${t.file}:${t.line} — \`createInstance(<rawEl>).${methodName}(...)\` in ${t.context}`,
                    Y: `fresh \`tracked: Set<Instance>\` per call (see dom/factory/core/instance.ts:90-112); set dies with the wrapper; substrate has no recovery path`,
                    Z: `single-owner — an Instance has exactly one tracked-children Set per DOM element; temp wrappers fragment this and break the cascade-destroy contract`,
                    W: `silent leak: DOM nodes may visibly clear (replaceChildren works); the JS-side disposers stay alive and continue running against orphan nodes until page unload`,
                },
                remediation: `Choose one of the canonical fixes:\n  (1) PERSISTENT HOST: cache \`createInstance(el)\` in a \`WeakMap<HTMLElement, Instance>\` keyed on the raw element. All calls return the same wrapper. See \`dom/ai/panel/messages-host.ts\` for the canonical helper.\n  (2) TAKE Instance: change the function signature from \`(host: HTMLElement, ...)\` to \`(host: Instance, ...)\` and have the caller pass the Instance it built.\n  (3) FORWARD-REF: if the host is built later in the same module, capture it via \`{ current: Instance | null }\` set after construction; the closure reads it at call time.\n  (4) USE THE LOCAL Instance: if you already have the Instance two lines up, use it directly. Don't unwrap to .el and re-wrap with createInstance.`,
                trace: t,
            }),
        },
    });
}

module.exports = {
    meta: {
        type: "problem",
        docs: { description: "createInstance(rawEl).clear/setChildren/destroy/addChild(Instance) is a temp-wrapper leak — fresh tracked Set dies with the wrapper." },
        schema: [],
        messages: { report: "{{ report }}" },
    },
    create(context) {
        const raw = (context.filename || context.getFilename()).split("\\").join("/");
        if (isExemptPath(raw)) return {};
        return {
            CallExpression(node) {
                const match = matchTempWrapperCall(node);
                if (!match) return;
                const { methodName } = match;
                if (LEAKY_METHODS.has(methodName)) {
                    // .clear / .setChildren / .destroy ALWAYS leak when called on createInstance(rawEl).
                    // Verify the inner arg actually looks like a raw element (not an Instance).
                    const inner = node.callee.object.arguments[0];
                    if (looksLikeRawElement(inner)) reportLeak(context, node, methodName, "any");
                    return;
                }
                if (ADD_METHODS.has(methodName)) {
                    // addChild(Instance) leaks; addChild(rawElement) is fine.
                    const inner = node.callee.object.arguments[0];
                    if (!looksLikeRawElement(inner)) return;
                    // Check the FIRST argument's shape. If it looks like an Instance (factory builder
                    // result), report. Heuristic: identifier whose name doesn't look raw.
                    const firstArg = node.arguments[0];
                    if (!firstArg) return;
                    if (firstArg.type === "Identifier" && !looksLikeRawElement(firstArg)) {
                        reportLeak(context, node, methodName, "instance-child");
                        return;
                    }
                    if (firstArg.type === "CallExpression") {
                        // Most factory builders (div, span, button, ...) return Instance.
                        // Cheap check: callee.name is short lowercase (factory primitive convention).
                        const callee = firstArg.callee;
                        if (callee && callee.type === "Identifier" && /^[a-z][a-zA-Z0-9]*$/.test(callee.name) && callee.name.length <= 20) {
                            reportLeak(context, node, methodName, "instance-child");
                        }
                    }
                }
            },
        };
    },
};
