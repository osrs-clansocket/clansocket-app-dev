/**
 * LVI/no-hardcoded-flow-select — inline enum/enumLabels arrays in flow-api / schema-form are banned.
 *
 * Any value set the flow builder offers as a picker must be a registerValueSource declaration. Inline
 * `enum: [...]` AND parallel `enumLabels: [...]` arrays inside files matching any flow-api,
 * schema-form, or flow-builder path are violations. The fix is:
 *  1. Move the values to a small dedicated file calling registerValueSource({ format, staticValues }).
 *  2. Replace the inline schema with `valueSourceRef: "<format>"` on the FlowField.
 *
 * Allowed exceptions (hardcoded enum is the source of truth):
 *  - `field-operator-defaults.ts` — operator/field-type definitions ARE the source.
 *  - `payload-field-types.ts` — the FlowFieldType union IS the source.
 *  - `flow-op-requires-safety-tier.cjs` — only the {"live", "manual"} safety_tier enum.
 *  - File named `*-allowed-values.ts` — explicit declaration that this file holds an enum source.
 *
 * Detection: any ObjectExpression property `enum: ArrayExpression` inside in-scope files. The rule
 * doesn't currently differentiate safety_tier enums — sister rule flow-op-requires-safety-tier
 * already constrains that specific enum, so we accept the rare overlap.
 */
"use strict";

const SCOPED_PATH_FRAGMENTS = ["/flow-api/", "/schema-form/", "/flow-builder/"];
const EXEMPT_FILENAMES = [
    "field-operator-defaults.ts",
    "payload-field-types.ts",
    "registry-types.ts",
    "schema-enums.ts",
];
const SAFETY_TIER_VALUES = new Set(["live", "manual"]);

function isScopedFile(filename) {
    const normalized = filename.replace(/\\/g, "/");
    for (const fragment of SCOPED_PATH_FRAGMENTS) {
        if (normalized.includes(fragment)) return true;
    }
    return false;
}

function isExemptFile(filename) {
    const normalized = filename.replace(/\\/g, "/");
    for (const exempt of EXEMPT_FILENAMES) {
        if (normalized.endsWith("/" + exempt)) return true;
    }
    return false;
}

function isSafetyTierLiteralArray(arrayExpr) {
    if (!arrayExpr || arrayExpr.type !== "ArrayExpression") return false;
    if (arrayExpr.elements.length === 0 || arrayExpr.elements.length > 2) return false;
    for (const el of arrayExpr.elements) {
        if (!el || el.type !== "Literal") return false;
        if (typeof el.value !== "string") return false;
        if (!SAFETY_TIER_VALUES.has(el.value)) return false;
    }
    return true;
}

module.exports = {
    meta: {
        type: "problem",
        docs: { description: "Inline enum/enumLabels arrays in flow-api/schema-form are banned — declare a registerValueSource and reference via valueSourceRef." },
        schema: [],
    },
    create(context) {
        const filename = context.filename;
        if (!isScopedFile(filename)) return {};
        if (isExemptFile(filename)) return {};
        return {
            Property(node) {
                if (node.computed) return;
                const key = node.key;
                const keyName = key.type === "Identifier" ? key.name : key.type === "Literal" ? String(key.value) : null;
                if (keyName !== "enum" && keyName !== "enumLabels") return;
                if (node.value.type !== "ArrayExpression") return;
                if (isSafetyTierLiteralArray(node.value)) return;
                context.report({
                    node,
                    message:
                        `Inline "${keyName}" array in flow-api/schema-form/flow-builder file is banned. ` +
                        `Declare the value set in a registerValueSource({ format: "<name>", staticValues: [...] }) ` +
                        `file under shared/flow-value-sources/ or <capability>/flow-api/value-sources/, ` +
                        `then reference via valueSourceRef: "<name>" on the FlowField. ` +
                        `Schema-form picker resolves all value sources through /api/flows/value-sources.`,
                });
            },
        };
    },
};
