/**
 * LVI/require-operation-self-register — every OperationSpec literal must reach registerOperation.
 *
 * Detects variable declarations annotated `: OperationSpec` (or object literals returned from helpers
 * that return `OperationSpec`) and asserts the same module calls `registerOperation({ ... })` with the
 * spec. The capability manifest's hand-listed operation records become impossible — each op declares
 * itself at its handler file.
 *
 * Scope: files under any flow-api directory that declare or build OperationSpec objects.
 */
"use strict";

const SPEC_TYPE = "OperationSpec";
const REGISTER_FN = "registerOperation";

function isOperationSpecAnnotation(annotation) {
    if (!annotation) return false;
    const t = annotation.typeAnnotation;
    if (!t || t.type !== "TSTypeReference" || !t.typeName) return false;
    return t.typeName.name === SPEC_TYPE;
}

module.exports = {
    meta: {
        type: "problem",
        docs: { description: "OperationSpec literals must be passed to registerOperation in the same module." },
        schema: [],
    },
    create(context) {
        const filename = context.filename.replace(/\\/g, "/");
        if (!filename.includes("/flow-api/")) return {};
        const specs = new Map();
        let registeredAny = false;
        return {
            VariableDeclarator(node) {
                if (!node.id || node.id.type !== "Identifier") return;
                if (!isOperationSpecAnnotation(node.id.typeAnnotation)) return;
                if (!node.init || node.init.type !== "ObjectExpression") return;
                specs.set(node.id.name, node);
            },
            CallExpression(node) {
                if (node.callee.type !== "Identifier" || node.callee.name !== REGISTER_FN) return;
                registeredAny = true;
            },
            "Program:exit"() {
                if (specs.size === 0) return;
                if (registeredAny && specs.size <= 1) return;
                if (registeredAny) return;
                for (const [name, node] of specs) {
                    context.report({
                        node,
                        message:
                            `OperationSpec "${name}" declared but never passed to registerOperation. ` +
                            `Replace the literal with a registerOperation({ capability, opId, ...spec, handler }) ` +
                            `call so the flow builder picks up this op automatically.`,
                    });
                }
            },
        };
    },
};
