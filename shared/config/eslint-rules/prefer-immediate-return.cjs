/**
 * LVI/prefer-immediate-return — Replaces sonarjs/prefer-immediate-return
 * with function-level allowlisting.
 *
 * Fires on the pattern:
 *     function fn(...): T {
 *         ...
 *         const x = expr;
 *         return x;
 *     }
 * UNLESS the enclosing function name is listed in
 * `prefer-immediate-return.exclusions.cjs`.
 *
 * Why a custom rule: the upstream sonarjs/prefer-immediate-return conflicts
 * with lvi/no-untracked-observer, which REQUIRES the assignment + return
 * pattern so the walker can verify a `.disconnect()` reaches the same scope.
 * Function-level allowlisting is the only acceptable scope for these
 * cross-rule reconciliations — file/folder/path-level exemptions are too
 * coarse.
 *
 * Adding an exemption requires an entry in the exclusions file with a
 * `reason` field documenting the cross-rule dependency.
 */

const RAW_EXCLUSIONS = require("./prefer-immediate-return.exclusions.cjs");
const ALLOWED_FUNCTIONS = new Set(RAW_EXCLUSIONS.map((entry) => entry.function));

function functionName(node) {
    if (node.type === "FunctionDeclaration" && node.id) return node.id.name;
    if (node.type === "FunctionExpression" || node.type === "ArrowFunctionExpression") {
        const p = node.parent;
        if (p) {
            if (p.type === "VariableDeclarator" && p.id && p.id.type === "Identifier") return p.id.name;
            if (p.type === "Property" && p.key && p.key.type === "Identifier") return p.key.name;
        }
    }
    return null;
}

function countIdentifierRefs(node, name, excludeNode) {
    if (node === excludeNode) return 0;
    if (node.type === "Identifier" && node.name === name) {
        const parent = node.parent;
        if (parent && parent.type === "Property" && parent.key === node && !parent.computed) return 0;
        if (parent && parent.type === "MemberExpression" && parent.property === node && !parent.computed) return 0;
        return 1;
    }
    let total = 0;
    for (const key in node) {
        if (key === "parent" || key === "loc" || key === "range") continue;
        const child = node[key];
        if (!child) continue;
        if (Array.isArray(child)) {
            for (const c of child) {
                if (c && typeof c === "object" && c.type) total += countIdentifierRefs(c, name, excludeNode);
            }
        } else if (typeof child === "object" && child.type) {
            total += countIdentifierRefs(child, name, excludeNode);
        }
    }
    return total;
}

function checkBody(context, fnNode, body) {
    if (!body || body.type !== "BlockStatement") return;
    const stmts = body.body;
    if (stmts.length < 2) return;
    const last = stmts[stmts.length - 1];
    const prev = stmts[stmts.length - 2];
    if (last.type !== "ReturnStatement" || !last.argument) return;
    if (last.argument.type !== "Identifier") return;
    if (prev.type !== "VariableDeclaration" || prev.declarations.length !== 1) return;
    const decl = prev.declarations[0];
    if (!decl.id || decl.id.type !== "Identifier") return;
    if (decl.id.name !== last.argument.name) return;
    // Only fire if the variable is used ONLY in the return — count refs to its
    // name in the function body, excluding the declarator itself; expect 1
    // (the return identifier).
    const refs = countIdentifierRefs(body, decl.id.name, decl.id);
    if (refs !== 1) return;
    const name = functionName(fnNode);
    if (name !== null && ALLOWED_FUNCTIONS.has(name)) return;
    context.report({
        node: prev,
        messageId: "immediateReturn",
        data: { name: decl.id.name },
    });
}

module.exports = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Replaces sonarjs/prefer-immediate-return with function-name allowlist for cross-rule reconciliation.",
        },
        schema: [],
        messages: {
            immediateReturn:
                'Immediately return this expression instead of assigning it to the temporary variable "{{name}}". Either inline the return, or add a `reason`-documented entry to prefer-immediate-return.exclusions.cjs explaining the cross-rule need.',
        },
    },
    create(context) {
        return {
            FunctionDeclaration(node) {
                checkBody(context, node, node.body);
            },
            FunctionExpression(node) {
                checkBody(context, node, node.body);
            },
            ArrowFunctionExpression(node) {
                if (node.body && node.body.type === "BlockStatement") checkBody(context, node, node.body);
            },
        };
    },
};
