/**
 * LVI/require-field-operators-binding — dashboard auto-hooks files must not declare static
 * operator-list constants. The operator picker derives from the server's /api/flows/field-operators
 * registry response via state/flows/field-operators-store.ts.
 */
"use strict";

const PATH_MATCHER = /\/dashboard\/src\/dom\/pages\/clans\/manage\/discord\/modes\/auto-hooks\//;
const BANNED_NAMES = new Set(["OP_OPTIONS", "OPERATORS", "FILTER_OPS", "FILTER_OPERATORS", "OP_LIST"]);

function normalizePath(raw) {
    return raw.split("\\").join("/");
}

module.exports = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Auto-hooks condition editor must consume field-operators-store, not hardcode an operator list.",
        },
        schema: [],
    },
    create(context) {
        const rawPath = normalizePath(context.filename || context.getFilename());
        if (!PATH_MATCHER.test(rawPath)) return {};
        return {
            VariableDeclarator(node) {
                if (node.id.type !== "Identifier") return;
                if (!BANNED_NAMES.has(node.id.name)) return;
                if (!node.init) return;
                if (node.init.type !== "ArrayExpression") return;
                context.report({
                    node,
                    message:
                        `Hardcoded operator list "${node.id.name}" banned in auto-hooks. ` +
                        `Read operators from state/flows/field-operators-store.ts which fetches /api/flows/field-operators.`,
                });
            },
        };
    },
};
