/**
 * LVI/no-coerce-flow-type-without-xflow — capability-builder.ts:fieldToProperty() must preserve
 * the original FlowFieldType as `x-flow-type` on the emitted JSON schema property.
 *
 * Without this extension, the dashboard receives only the coerced JSON-standard type (string /
 * integer / boolean / object) and `format` (valueSourceRef). Original FlowFieldType ("rsn",
 * "osrs-skill", "discord-channel-id", etc.) is lost, breaking operator filtering.
 */
"use strict";

const FILE_BASENAME = "capability-builder.ts";
const FUNCTION_NAME = "fieldToProperty";

function normalizePath(raw) {
    return raw.split("\\").join("/");
}

function objectHasXFlowType(node) {
    if (!node || node.type !== "ObjectExpression") return false;
    for (const p of node.properties) {
        if (p.type !== "Property") continue;
        const k = p.key;
        const name = k.type === "Identifier" ? k.name : k.type === "Literal" ? String(k.value) : null;
        if (name === "x-flow-type") return true;
    }
    return false;
}

function walk(node, visit) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
        for (const item of node) walk(item, visit);
        return;
    }
    if (visit(node) === true) return;
    for (const key of Object.keys(node)) {
        if (key === "parent" || key === "loc" || key === "range") continue;
        walk(node[key], visit);
    }
}

function bodyMentionsXFlowType(body) {
    let found = false;
    walk(body, (n) => {
        if (n.type === "Literal" && n.value === "x-flow-type") {
            found = true;
            return true;
        }
        return false;
    });
    return found;
}

module.exports = {
    meta: {
        type: "problem",
        docs: {
            description:
                "fieldToProperty must emit x-flow-type to preserve FlowFieldType across the capability API.",
        },
        schema: [],
    },
    create(context) {
        const rawPath = normalizePath(context.filename || context.getFilename());
        if (!rawPath.endsWith(`/${FILE_BASENAME}`)) return {};
        return {
            FunctionDeclaration(node) {
                if (!node.id || node.id.name !== FUNCTION_NAME) return;
                if (bodyMentionsXFlowType(node.body)) return;
                context.report({
                    node,
                    message:
                        `fieldToProperty() must set "x-flow-type": field.type on the emitted JSON schema property. ` +
                        `Without it the dashboard loses the original FlowFieldType after schemaTypeFor coercion.`,
                });
            },
        };
    },
};
