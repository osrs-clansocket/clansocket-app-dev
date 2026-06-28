/**
 * LVI/no-hardcoded-result-classes — bans inline `result_classes: [...]` array literals
 * in flow-api manifest files. Forces each operation to reference an imported constant from
 * a per-capability `result-classes.ts` so the set is enumerable / lintable / shareable.
 */
"use strict";

const PATH_MATCHER = /\/flow-api\/.*manifest-.*\.ts$/;

function normalizePath(raw) {
    return raw.split("\\").join("/");
}

module.exports = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Operations must reference result_classes via an imported constant, not inline an ArrayExpression.",
        },
        schema: [],
    },
    create(context) {
        const rawPath = normalizePath(context.filename || context.getFilename());
        if (!PATH_MATCHER.test(rawPath)) return {};
        return {
            Property(node) {
                if (node.computed) return;
                const key = node.key;
                const name = key.type === "Identifier" ? key.name : key.type === "Literal" ? String(key.value) : null;
                if (name !== "result_classes") return;
                if (node.value.type !== "ArrayExpression") return;
                context.report({
                    node,
                    message:
                        "Inline `result_classes: [...]` array banned in manifest files. " +
                        "Declare the array as an exported const in `<capability>/flow-api/result-classes.ts` " +
                        "and reference it by identifier here.",
                });
            },
        };
    },
};
