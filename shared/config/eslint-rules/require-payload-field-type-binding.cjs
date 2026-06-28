/**
 * LVI/require-payload-field-type-binding — every payloadFields/inputFields/outputFields entry
 * with a non-primitive FlowFieldType MUST declare a resolution path: either `valueSourceRef`
 * or `sqlTable + sqlColumn` (the DB-derived synth path).
 *
 * Primitives that don't need a value source: string, integer, number, boolean, object, timestamp.
 * Everything else (rsn, osrs-skill, discord-channel-id, region-id, …) needs registry resolution.
 */
"use strict";

const FIELD_LIST_KEYS = new Set(["payloadFields", "inputFields", "outputFields"]);
const PRIMITIVE_TYPES = new Set(["string", "integer", "number", "boolean", "object", "timestamp"]);

function readStringProp(prop, keyName) {
    if (!prop || prop.type !== "Property" || prop.computed) return null;
    const k = prop.key;
    const name = k.type === "Identifier" ? k.name : k.type === "Literal" ? String(k.value) : null;
    if (name !== keyName) return null;
    if (prop.value.type !== "Literal" || typeof prop.value.value !== "string") return null;
    return prop.value.value;
}

function hasProp(obj, keyName) {
    for (const p of obj.properties) {
        if (p.type !== "Property" || p.computed) continue;
        const k = p.key;
        const name = k.type === "Identifier" ? k.name : k.type === "Literal" ? String(k.value) : null;
        if (name === keyName) return true;
    }
    return false;
}

function checkField(obj, context) {
    const type = readStringProp(obj.properties.find((p) => p.type === "Property" && readStringProp(p, "type") !== null), "type")
        ?? (() => {
            for (const p of obj.properties) {
                const v = readStringProp(p, "type");
                if (v !== null) return v;
            }
            return null;
        })();
    if (type === null) return;
    if (PRIMITIVE_TYPES.has(type)) return;
    const hasValueSource = hasProp(obj, "valueSourceRef");
    const hasSqlTable = hasProp(obj, "sqlTable") && hasProp(obj, "sqlColumn");
    if (hasValueSource || hasSqlTable) return;
    context.report({
        node: obj,
        message:
            `Field type "${type}" is non-primitive and has no resolution path. ` +
            `Add either valueSourceRef: "<format>" (matching a registerValueSource) ` +
            `OR sqlTable + sqlColumn for DB-derived value sets.`,
    });
}

module.exports = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Non-primitive FlowFieldType fields must declare valueSourceRef or sqlTable+sqlColumn.",
        },
        schema: [],
    },
    create(context) {
        return {
            Property(node) {
                if (node.computed) return;
                const k = node.key;
                const name = k.type === "Identifier" ? k.name : k.type === "Literal" ? String(k.value) : null;
                if (!name || !FIELD_LIST_KEYS.has(name)) return;
                if (node.value.type !== "ArrayExpression") return;
                for (const el of node.value.elements) {
                    if (!el || el.type !== "ObjectExpression") continue;
                    checkField(el, context);
                }
            },
        };
    },
};
