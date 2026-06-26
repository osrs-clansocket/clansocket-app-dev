"use strict";

const path = require("path");

// All icon family prefixes managed by the icon system. Any string literal matching
// `^(prefix)-[a-z][a-z0-9-]*$` is treated as a per-glyph class name that bypasses the
// factory chokepoint. Use icon({ name, provider }) instead so the renderer (font / svg /
// raster) is selected from the IconFamilyConfig, not hardcoded at the call site.
const ICON_PREFIXES = ["bi", "ti", "mdi", "ph", "gi"];
const ICON_CLASS_RE = new RegExp(`^(${ICON_PREFIXES.join("|")})-[a-z][a-z0-9-]*$`);

// Files that are EXEMPT from the rule because they ARE the icon chokepoint or its supporting
// infrastructure. Inside these paths, raw icon class strings are the canonical representation.
// Exemption is by POSIX path suffix-match — works regardless of OS path separator.
const EXEMPT_PATH_FRAGMENTS = [
    "/dom/factory/",
    "/icons/",
    "/styles/auto-gen/",
    "/shared/config/eslint-rules/",
    "/shared/config/universal-rules.cjs",
];

function toPosix(p) {
    return p.split(path.sep).join("/");
}

function isExempt(filename) {
    if (!filename) return true;
    const norm = toPosix(filename);
    for (const frag of EXEMPT_PATH_FRAGMENTS) {
        if (norm.includes(frag)) return true;
    }
    return false;
}

function checkLiteral(context, node, value) {
    if (typeof value !== "string") return;
    if (!ICON_CLASS_RE.test(value)) return;
    const match = value.match(/^([a-z]+)-/);
    const prefix = match ? match[1] : "";
    const name = prefix ? value.slice(prefix.length + 1) : value;
    context.report({
        node,
        messageId: "rawIconClass",
        data: { raw: value, prefix, name },
    });
}

module.exports = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Disallow raw icon-prefix class strings (bi-*, ti-*, mdi-*, ph-*, gi-*) outside the icon() factory and family registers. Forces every consumer through icon({ name, provider }) so the renderer (font/svg/raster) is selected via the family config — required for the font→SVG migration to be enforceable and reversible per family.",
            url: "https://github.com/osrs-clansocket/clansocket/blob/main/CLAUDE.md",
        },
        schema: [],
        messages: {
            rawIconClass:
                'Raw icon class "{{raw}}" — replace with icon({ name: "{{name}}", provider: "{{prefix}}" }). Direct class strings bypass the factory chokepoint and force the renderer choice (font vs svg) at the call site instead of the family config.',
        },
    },
    create(context) {
        const filename = context.filename || (context.getFilename && context.getFilename());
        if (isExempt(filename)) return {};
        return {
            Literal(node) {
                checkLiteral(context, node, node.value);
            },
            TemplateLiteral(node) {
                if (node.quasis.length === 1) {
                    checkLiteral(context, node, node.quasis[0].value.cooked);
                    return;
                }
                for (const quasi of node.quasis) {
                    const cooked = quasi.value.cooked;
                    if (typeof cooked !== "string") continue;
                    for (const prefix of ICON_PREFIXES) {
                        if (cooked.endsWith(prefix + "-")) {
                            context.report({
                                node: quasi,
                                messageId: "rawIconClass",
                                data: { raw: `${prefix}-\${...}`, prefix, name: "..." },
                            });
                            break;
                        }
                    }
                }
            },
        };
    },
};
