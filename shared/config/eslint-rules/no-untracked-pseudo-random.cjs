/**
 * LVI/no-untracked-pseudo-random — Replaces sonarjs/pseudo-random with
 * function-level allowlisting.
 *
 * Fires on calls to `Math.random()` unless the enclosing function
 * (NamedFunctionDeclaration / MethodDefinition) is listed in
 * `no-untracked-pseudo-random.exclusions.cjs`.
 *
 * Why a custom rule: the upstream sonarjs/pseudo-random rule has no
 * allowlist options. Function-level exemption is the only acceptable
 * scope for reviewed non-security pseudorandom chokepoints.
 *
 * Adding an exemption requires an entry in the exclusions file with a
 * `reason` field documenting the review.
 */

const RAW_EXCLUSIONS = require("./no-untracked-pseudo-random.exclusions.cjs");
const ALLOWED_FUNCTIONS = new Set(RAW_EXCLUSIONS.map((entry) => entry.function));

function enclosingFunctionName(node) {
    let p = node.parent;
    while (p) {
        if (p.type === "FunctionDeclaration" && p.id) return p.id.name;
        if (p.type === "MethodDefinition" && p.key && p.key.type === "Identifier") return p.key.name;
        if (p.type === "ArrowFunctionExpression" || p.type === "FunctionExpression") {
            const fnParent = p.parent;
            if (fnParent) {
                if (fnParent.type === "VariableDeclarator" && fnParent.id && fnParent.id.type === "Identifier") return fnParent.id.name;
                if (fnParent.type === "Property" && fnParent.key && fnParent.key.type === "Identifier") return fnParent.key.name;
            }
            return null;
        }
        p = p.parent;
    }
    return null;
}

function isMathRandom(node) {
    if (node.type !== "CallExpression") return false;
    const callee = node.callee;
    if (callee.type !== "MemberExpression") return false;
    if (callee.property.type !== "Identifier" || callee.property.name !== "random") return false;
    if (callee.object.type !== "Identifier" || callee.object.name !== "Math") return false;
    return true;
}

module.exports = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Bans Math.random() outside the named chokepoint functions in no-untracked-pseudo-random.exclusions.cjs.",
        },
        schema: [],
        messages: {
            untracked:
                "Math.random() outside an allowlisted chokepoint function. Use nextFloat() / nextInt() from shared/random/non-crypto-random.ts, or add a `reason`-documented entry to no-untracked-pseudo-random.exclusions.cjs.",
        },
    },
    create(context) {
        return {
            CallExpression(node) {
                if (!isMathRandom(node)) return;
                const fnName = enclosingFunctionName(node);
                if (fnName !== null && ALLOWED_FUNCTIONS.has(fnName)) return;
                context.report({ node, messageId: "untracked" });
            },
        };
    },
};
