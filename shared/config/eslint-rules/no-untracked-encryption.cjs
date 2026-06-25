/**
 * LVI/no-untracked-encryption — Replaces sonarjs/encryption with
 * function-level allowlisting.
 *
 * Fires on calls to `crypto.subtle.encrypt(...)` and `crypto.subtle.decrypt(...)`
 * unless the enclosing function (NamedFunctionDeclaration / MethodDefinition)
 * is listed in `no-untracked-encryption.exclusions.cjs`.
 *
 * Why a custom rule: the upstream sonarjs/encryption rule has no allowlist
 * options. Function-level exemption is the only acceptable scope for
 * reviewed chokepoint operations — file/folder/path-level exemptions are
 * too coarse (a file may contain reviewed AND unreviewed encryption uses).
 *
 * Adding an exemption requires an entry in the exclusions file with a
 * `reason` field documenting the review.
 */

const RAW_EXCLUSIONS = require("./no-untracked-encryption.exclusions.cjs");
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

function isSubtleEncryptOrDecrypt(node) {
    if (node.type !== "CallExpression") return null;
    const callee = node.callee;
    if (callee.type !== "MemberExpression") return null;
    const prop = callee.property;
    if (prop.type !== "Identifier") return null;
    if (prop.name !== "encrypt" && prop.name !== "decrypt") return null;
    const obj = callee.object;
    if (obj.type !== "MemberExpression") return null;
    if (obj.property.type !== "Identifier" || obj.property.name !== "subtle") return null;
    if (obj.object.type !== "Identifier" || obj.object.name !== "crypto") return null;
    return prop.name;
}

module.exports = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Bans crypto.subtle.encrypt/decrypt outside the named chokepoint functions in no-untracked-encryption.exclusions.cjs.",
        },
        schema: [],
        messages: {
            untracked:
                "crypto.subtle.{{op}} outside an allowlisted chokepoint function. Either route through the existing chokepoint (vault/crypto.ts) or add a `reason`-documented entry to no-untracked-encryption.exclusions.cjs.",
        },
    },
    create(context) {
        return {
            CallExpression(node) {
                const op = isSubtleEncryptOrDecrypt(node);
                if (!op) return;
                const fnName = enclosingFunctionName(node);
                if (fnName !== null && ALLOWED_FUNCTIONS.has(fnName)) return;
                context.report({ node, messageId: "untracked", data: { op } });
            },
        };
    },
};
