"use strict";

/**
 * LVI/max-name-words — ABSOLUTE 3-word cap on function / class / type / file names.
 *
 * The cap is on LOGICAL WORDS:
 *   - camelCase / PascalCase identifiers: count humps (runs of one capital + lowercase tail).
 *     consecutive capitals = one acronym word (HTMLParser = HTML + Parser = 2 words).
 *   - kebab-case file names: count `-` segments.
 *   - snake_case constants are NOT covered by this rule (constants are typically value
 *     tokens, not concept tokens — covered by other naming rules if needed).
 *
 * RATIONALE: over-saturated names HIDE duplication. Two semantically-identical things
 * look different because qualifier tokens accumulate (`createConfiguredAutoHooksStore` vs
 * `createPendingAutoHooksStore` — both are just `hooksStore` with different state). The
 * cap forces consolidation: if you can't fit it in 3 words, the file/function has too
 * many concerns — split it.
 *
 * Coverage:
 *   - FunctionDeclaration / FunctionExpression / ArrowFunctionExpression (named)
 *   - ClassDeclaration / ClassExpression
 *   - MethodDefinition (instance + static methods)
 *   - TSInterfaceDeclaration / TSTypeAliasDeclaration / TSEnumDeclaration
 *   - Filename (from context.filename, basename without extension)
 *
 * NOT covered (intentional):
 *   - variables / parameters / properties — too noisy at this cap; revisit if dup hides
 *   - imported names (consumer doesn't control these)
 *   - object property keys / destructured names
 *
 * Path-scoped exemptions (by design, not bypass-via-naming):
 *   - `database/migrations/<kind>/**` — migrations are append-only schema history;
 *     their descriptive names ARE the change record, not over-saturation.
 *
 * Brand tokens (single conceptual unit, not a multi-word qualifier):
 *   - `ClanSocket` — counts as 1 word even though it has an internal capital.
 *
 * Fix the names.
 */

const path = require("path");

const MAX_WORDS = 3;
const BRAND_TOKENS = [["ClanSocket", "Clansocket"]];
const EXEMPT_PATH_FRAGMENTS = ["database/migrations/", "database\\migrations\\"];

function isExemptPath(filename) {
    if (!filename) return false;
    const normalized = filename.replaceAll("\\", "/");
    return EXEMPT_PATH_FRAGMENTS.some((frag) => normalized.includes(frag.replaceAll("\\", "/")));
}

function normalizeBrands(name) {
    let out = name;
    for (const [from, to] of BRAND_TOKENS) {
        out = out.split(from).join(to);
    }
    return out;
}

function basenameNoExt(p) {
    const base = path.basename(p);
    const dot = base.indexOf(".");
    return dot === -1 ? base : base.slice(0, dot);
}

function countCamelWords(name) {
    if (!name) return 0;
    // Strip leading underscores (private convention) and trailing $/digit suffixes.
    let s = String(name).replace(/^_+/, "").replace(/\$+$/, "");
    if (s.length === 0) return 0;
    // Collapse brand tokens to single-hump form (ClanSocket → Clansocket) so the
    // brand is counted as 1 word rather than splitting on its internal capital.
    s = normalizeBrands(s);
    // Split on transitions:
    //   lower → Upper            (camelHump → camel|Hump)
    //   Upper run → Upper+lower  (HTMLParser → HTML|Parser)
    // Strategy: insert separator before each capital that follows a lowercase OR
    // before each capital that precedes a lowercase if preceded by a capital.
    s = s.replace(/([a-z0-9])([A-Z])/g, "$1|$2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1|$2");
    return s.split("|").filter(Boolean).length;
}

function countKebabWords(name) {
    if (!name) return 0;
    const trimmed = String(name).replace(/^-+|-+$/g, "");
    if (trimmed.length === 0) return 0;
    return trimmed.split("-").filter(Boolean).length;
}

function reportIfTooLong(context, node, kind, name, count) {
    if (count <= MAX_WORDS) return;
    context.report({
        node,
        messageId: "tooLong",
        data: { kind, name, count: String(count), max: String(MAX_WORDS) },
    });
}

function checkIdentifier(context, node, kind, name) {
    if (!name) return;
    reportIfTooLong(context, node, kind, name, countCamelWords(name));
}

module.exports = {
    meta: {
        type: "problem",
        docs: {
            description:
                "ABSOLUTE 3-word cap on function / class / type / file names. Over-saturated names hide duplication.",
        },
        schema: [],
        messages: {
            tooLong:
                "{{kind}} name `{{name}}` has {{count}} logical words; max is {{max}}. Over-saturated names hide duplication — consolidate the underlying code instead of inflating the name. Pick the most distinctive concept in 1-2 words.",
        },
    },
    create(context) {
        const filename = context.filename || (context.getFilename && context.getFilename()) || "";

        // Path-scoped exemption: migrations are append-only schema-change history;
        // their descriptive names ARE the change record, not bypass-via-naming.
        if (isExemptPath(filename)) return {};

        // File-level check (once per file, attach to Program node).
        const fileBase = basenameNoExt(filename);
        const fileWordCount = countKebabWords(fileBase);

        return {
            Program(node) {
                if (!fileBase) return;
                // Skip dotfiles / config files at workspace edge if extension was stripped
                // and what remains is empty.
                if (fileWordCount === 0) return;
                reportIfTooLong(context, node, "file", fileBase, fileWordCount);
            },

            FunctionDeclaration(node) {
                if (node.id) checkIdentifier(context, node.id, "function", node.id.name);
            },

            FunctionExpression(node) {
                if (node.id) checkIdentifier(context, node.id, "function", node.id.name);
            },

            "VariableDeclarator[init.type='ArrowFunctionExpression']"(node) {
                if (node.id && node.id.type === "Identifier") {
                    checkIdentifier(context, node.id, "function", node.id.name);
                }
            },

            "VariableDeclarator[init.type='FunctionExpression']"(node) {
                if (node.id && node.id.type === "Identifier") {
                    checkIdentifier(context, node.id, "function", node.id.name);
                }
            },

            ClassDeclaration(node) {
                if (node.id) checkIdentifier(context, node.id, "class", node.id.name);
            },

            ClassExpression(node) {
                if (node.id) checkIdentifier(context, node.id, "class", node.id.name);
            },

            MethodDefinition(node) {
                if (node.key && node.key.type === "Identifier") {
                    checkIdentifier(context, node.key, "method", node.key.name);
                }
            },

            TSInterfaceDeclaration(node) {
                if (node.id) checkIdentifier(context, node.id, "interface", node.id.name);
            },

            TSTypeAliasDeclaration(node) {
                if (node.id) checkIdentifier(context, node.id, "type", node.id.name);
            },

            TSEnumDeclaration(node) {
                if (node.id) checkIdentifier(context, node.id, "enum", node.id.name);
            },
        };
    },
};
