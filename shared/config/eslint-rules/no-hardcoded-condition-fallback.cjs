/**
 * LVI/no-hardcoded-condition-fallback — bans `??` / `||` fallback chains where one side reads
 * from a registry-fed source and the other reads a hardcoded uppercase-named Record map.
 *
 * Targets the dual-path smell where a dynamic registry is layered alongside a legacy static map:
 *   `dynamicMap.get(x) ?? STATIC_MAP[x] ?? []`
 *   `REGISTRY[triggerType]?.[field] ?? REGISTRY["*"]?.[field]`
 *
 * Fires only on files matching the condition-resolution surfaces (path-gated).
 */
"use strict";

const PATH_MATCHERS = [
    /condition-field-list/,
    /value-resolvers\//,
    /auto-hook-conditions\//,
];

function normalizePath(raw) {
    return raw.split("\\").join("/");
}

function fileMatches(absPath) {
    for (const re of PATH_MATCHERS) if (re.test(absPath)) return true;
    return false;
}

function isUpperConstAccess(node) {
    if (!node) return false;
    if (node.type === "MemberExpression") {
        const obj = node.object;
        if (obj.type === "Identifier" && /^[A-Z_][A-Z0-9_]*$/.test(obj.name)) return true;
        return isUpperConstAccess(obj);
    }
    if (node.type === "ChainExpression") return isUpperConstAccess(node.expression);
    return false;
}

module.exports = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Bans `??`/`||` fallback chains where one branch references an UPPER_CASE static Record map. Forces registry-only resolution.",
        },
        schema: [],
    },
    create(context) {
        const rawPath = normalizePath(context.filename || context.getFilename());
        if (!fileMatches(rawPath)) return {};
        return {
            LogicalExpression(node) {
                if (node.operator !== "??" && node.operator !== "||") return;
                if (isUpperConstAccess(node.right) || isUpperConstAccess(node.left)) {
                    context.report({
                        node,
                        message:
                            "Fallback chain references a hardcoded UPPER_CASE Record map. " +
                            "Delete the static map and route the resolution through the corresponding registry " +
                            "(value-source-registry / capability-registry / field-operator-registry).",
                    });
                }
            },
        };
    },
};
