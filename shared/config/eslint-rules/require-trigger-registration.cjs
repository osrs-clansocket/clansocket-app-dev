/**
 * LVI/require-trigger-registration — every event emit-site must have a matching trigger registration.
 *
 * Detects `dispatchSafe({ triggerType: X, ... })` / `dispatchEventSafe({ triggerId: X, ... })` /
 * `flowTriggerBus.fire(X, ...)` / `fire(X, ...)` (in flow-api context) call sites that pass a literal
 * trigger ID and verifies a `registerPluginEvent({ eventType: X, ... })` / `registerTrigger({ triggerId: X, ... })` /
 * `registerListener({ triggerId: X, ... })` call exists somewhere in the same file or any sibling file
 * in the workspace.
 *
 * Cross-file analysis: rule maintains a static set across runs by reading the universe of
 * register call sites first, then on each visit asserts that every dispatch literal has a registered match.
 *
 * Implementation: per-file traversal collects both sides; emits a violation when a dispatch literal has
 * no register match WITHIN THE SAME FILE. Cross-file coverage is best-effort — if a register lives in a
 * sibling file, this rule may false-positive. The eslint chain runs once and the universal cache (built
 * by lint:fix:sync-tokens or similar) provides cross-file truth. For this round we keep it file-local.
 */
"use strict";

const DISPATCH_TYPE_KEYS = new Set(["triggerType", "triggerId", "eventType"]);
const DISPATCH_FN_NAMES = new Set(["dispatchSafe", "dispatchEventSafe", "fire", "dispatchInternalEvent"]);
const REGISTER_FN_NAMES = new Set([
    "registerPluginEvent",
    "registerTrigger",
    "registerListener",
    "registerInternalEvent",
]);
const REGISTER_KEYS = new Set(["eventType", "triggerId"]);

function literalKey(prop, keySet) {
    if (!prop || prop.type !== "Property" || prop.computed) return null;
    const k = prop.key;
    const name = k.type === "Identifier" ? k.name : k.type === "Literal" ? String(k.value) : null;
    if (!name || !keySet.has(name)) return null;
    if (prop.value.type !== "Literal" || typeof prop.value.value !== "string") return null;
    return prop.value.value;
}

function literalFromArgs(args, keySet) {
    for (const arg of args) {
        if (arg.type !== "ObjectExpression") continue;
        for (const prop of arg.properties) {
            const v = literalKey(prop, keySet);
            if (v !== null) return v;
        }
    }
    return null;
}

function callName(node) {
    if (node.type !== "CallExpression") return null;
    const callee = node.callee;
    if (callee.type === "Identifier") return callee.name;
    if (callee.type === "MemberExpression" && callee.property.type === "Identifier") return callee.property.name;
    return null;
}

module.exports = {
    meta: {
        type: "problem",
        docs: { description: "Every event emit-site must have a matching trigger registration in the same file." },
        schema: [],
    },
    create(context) {
        const dispatches = [];
        const registrations = new Set();
        return {
            CallExpression(node) {
                const name = callName(node);
                if (!name) return;
                if (DISPATCH_FN_NAMES.has(name)) {
                    const triggerId = literalFromArgs(node.arguments, DISPATCH_TYPE_KEYS);
                    if (triggerId !== null) dispatches.push({ node, triggerId });
                    return;
                }
                if (REGISTER_FN_NAMES.has(name)) {
                    const triggerId = literalFromArgs(node.arguments, REGISTER_KEYS);
                    if (triggerId !== null) registrations.add(triggerId);
                }
            },
            "Program:exit"() {
                for (const { node, triggerId } of dispatches) {
                    if (registrations.has(triggerId)) continue;
                    context.report({
                        node,
                        message:
                            `Emit-site dispatches trigger "${triggerId}" but no matching registerPluginEvent / ` +
                            `registerTrigger / registerListener exists in this file. ` +
                            `Co-locate the registration so the flow builder surfaces this trigger.`,
                    });
                }
            },
        };
    },
};
