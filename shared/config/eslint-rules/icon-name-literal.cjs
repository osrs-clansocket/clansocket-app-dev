/**
 * LVI/icon-name-literal — Banned `iconName:` field misnaming.
 *
 * The sprite builder at scripts/build-scripts/build-icon-sprites-script.mjs scans
 * source for `\bname\s*:\s*"literal"` patterns to derive which icons land in the
 * production sprite. The regex requires a `\b` word-boundary before `name`, which
 * `iconName` doesn't provide — so any icon stored under `iconName: "X"` is
 * invisible to the scanner and renders as a blank `<i>` tag in production.
 *
 * Always use the `name:` field for icon identifiers:
 *
 * Allowed:
 *   { name: "palette-fill", label: "Color" }
 *   icon({ name: "trash" })
 *   const TOOLS = [{ name: "type" }, { name: "fonts" }];
 *
 * Banned:
 *   { iconName: "palette-fill" }        // field name wrong — invisible to sprite scanner
 *   interface Tool { iconName: string } // type/interface field misnamed
 *
 * Variable indirection (`icon({ name: opts.name })`) is allowed as long as the
 * literal exists somewhere in source under a `name:` property — typically in
 * a const registry. This rule does NOT enforce literal-at-call-site because that
 * over-fires on legitimate dispatcher helpers like `toolButton({name, ...})`.
 *
 * The single banned anti-pattern is the FIELD MISNAMING that silently breaks
 * auto-derivation. The fix is mechanical: rename `iconName` → `name`.
 */
"use strict";

const BANNED_FIELD = "iconName";

function reportFieldRename(context, node) {
    context.report({
        node,
        message:
            "Use `name:` not `iconName:` for icon identifiers. " +
            "The sprite builder regex (\\bname\\s*:\\s*\"...\") can't match `iconName` because there's no word boundary before `name`. " +
            "Icons stored under `iconName:` render blank in production.",
    });
}

function keyName(key) {
    if (!key) return null;
    if (key.type === "Identifier") return key.name;
    if (key.type === "Literal") return key.value;
    return null;
}

function checkObjectExpression(context, node) {
    for (const prop of node.properties) {
        if (prop.type !== "Property") continue;
        if (prop.computed) continue;
        if (keyName(prop.key) === BANNED_FIELD) reportFieldRename(context, prop);
    }
}

function checkInterfaceOrTypeBody(context, body) {
    if (!body || !Array.isArray(body.body)) return;
    for (const member of body.body) {
        if (member.type !== "TSPropertySignature") continue;
        if (member.computed) continue;
        if (keyName(member.key) === BANNED_FIELD) reportFieldRename(context, member);
    }
}

module.exports = {
    meta: {
        type: "problem",
        docs: { description: "Icon identifier field must be `name:`, not `iconName:`" },
        schema: [],
    },
    create(context) {
        return {
            ObjectExpression(node) {
                checkObjectExpression(context, node);
            },
            TSInterfaceDeclaration(node) {
                checkInterfaceOrTypeBody(context, node.body);
            },
            TSTypeLiteral(node) {
                checkInterfaceOrTypeBody(context, node);
            },
        };
    },
};
