/**
 * LVI/no-truthy-zero-check — `if (x)` where x is annotated as `number` or `number | undefined`.
 * `if (0)` is false → branch silently skipped for valid 0 values.
 *
 * Conservative: only flags VariableDeclarators or Parameters with explicit `number` / `number | null` /
 * `number | undefined` types, used in `if (x)` / `if (!x)` / `x && ...` / `x || ...` ternary.
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

function isNumberType(typeNode) {
    if (!typeNode) return false;
    if (typeNode.type === "TSNumberKeyword") return true;
    if (typeNode.type === "TSUnionType") {
        return typeNode.types.some((t) => t.type === "TSNumberKeyword");
    }
    return false;
}

module.exports = {
    meta: { type: "problem", docs: { description: "Truthy check on typed-number value — 0 is falsy" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        const numericIdents = new Map();

        function recordTypedNumber(idNode, typeAnnotation) {
            if (!idNode || idNode.type !== "Identifier") return;
            if (!typeAnnotation || !typeAnnotation.typeAnnotation) return;
            if (!isNumberType(typeAnnotation.typeAnnotation)) return;
            numericIdents.set(idNode.name, idNode);
        }

        function checkTruthy(testNode, statementNode) {
            let ident = null;
            if (testNode.type === "Identifier") ident = testNode;
            else if (testNode.type === "UnaryExpression" && testNode.operator === "!" && testNode.argument.type === "Identifier") ident = testNode.argument;
            if (!ident) return;
            if (!numericIdents.has(ident.name)) return;
            const t = trace(statementNode, raw, mod);
            const ctx = getContext(statementNode);
            context.report({ node: statementNode, messageId: "report", data: { report: build4DReport({
                rule: "no-truthy-zero-check",
                narrative: `${file}:${statementNode.loc.start.line} branches on truthiness of '${ident.name}' which is typed as number (possibly | undefined/null) in ${ctx}. \`if (0)\` is false — valid zero values silently skip the branch. Classic boundary bug.`,
                graph: {
                    X: `${file}:${statementNode.loc.start.line} — truthy test on numeric '${ident.name}'`,
                    Y: `value 0 is treated identically to undefined/null; the intended undefined check accidentally also matches 0`,
                    Z: `Distinguish 'No Value' From 'Zero Value' — use explicit \`x !== undefined\` or \`x != null\` for nullability checks`,
                    W: `subtle off-by-one and boundary bugs; 0-count, 0-offset, 0-timestamp inputs handled wrong; tests pass with N>0 fixtures`,
                },
                remediation: `Replace \`if (${ident.name})\` with \`if (${ident.name} !== undefined)\` (or \`!= null\` to also exclude null). For nullable booleans the same applies: explicit \`=== true\`. For nullable strings: \`x !== undefined && x !== ""\`.`,
                trace: t,
            }) } });
        }

        return {
            VariableDeclarator(node) { recordTypedNumber(node.id, node.id.typeAnnotation); },
            FunctionDeclaration(node) { for (const p of node.params) recordTypedNumber(p, p.typeAnnotation); },
            FunctionExpression(node) { for (const p of node.params) recordTypedNumber(p, p.typeAnnotation); },
            ArrowFunctionExpression(node) { for (const p of node.params) recordTypedNumber(p, p.typeAnnotation); },
            IfStatement(node) { checkTruthy(node.test, node); },
            ConditionalExpression(node) { checkTruthy(node.test, node); },
            LogicalExpression(node) {
                if (node.operator === "&&" || node.operator === "||") checkTruthy(node.left, node);
            },
        };
    },
};
