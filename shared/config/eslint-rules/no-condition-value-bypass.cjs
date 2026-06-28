/**
 * LVI/no-condition-value-bypass — condition-editor-value.ts buildValueControl() function must
 * consult the field's fieldType/format BEFORE branching on operator. Fires when the function
 * body's first decision is on `row.op` without a prior reference to `row.fieldType` or `row.format`.
 *
 * Narrow file-targeted rule: gates by exact basename.
 */
"use strict";

const FILE_BASENAME = "condition-editor-value.ts";
const FUNCTION_NAME = "buildValueControl";

function normalizePath(raw) {
    return raw.split("\\").join("/");
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

function bodyMentionsIdentifier(body, names) {
    const set = new Set(names);
    let found = false;
    walk(body, (n) => {
        if (n.type === "Identifier" && set.has(n.name)) {
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
                "buildValueControl must route by field type/format, not by operator alone.",
        },
        schema: [],
    },
    create(context) {
        const rawPath = normalizePath(context.filename || context.getFilename());
        if (!rawPath.endsWith(`/${FILE_BASENAME}`)) return {};
        return {
            FunctionDeclaration(node) {
                if (!node.id || node.id.name !== FUNCTION_NAME) return;
                const mentionsType = bodyMentionsIdentifier(node.body, ["fieldType", "format"]);
                if (mentionsType) return;
                context.report({
                    node,
                    message:
                        `buildValueControl() never references fieldType or format. ` +
                        `Route the picker decision by field type (select for typed fields like rsn, ` +
                        `numeric input for integer-typed fields) BEFORE branching on operator.`,
                });
            },
        };
    },
};
