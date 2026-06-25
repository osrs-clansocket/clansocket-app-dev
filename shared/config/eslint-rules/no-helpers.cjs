"use strict";

/**
 * LVI/no-helpers — BANS the word `helper` anywhere it can hide an unnamed concern.
 *
 * Coverage:
 *   - file basename contains `helper` / `helpers`
 *   - folder segment contains `helpers`
 *   - identifier names contain `helper`: FunctionDeclaration / FunctionExpression /
 *     ArrowFunctionExpression / ClassDeclaration / ClassExpression / MethodDefinition /
 *     TSInterfaceDeclaration / TSTypeAliasDeclaration / TSEnumDeclaration /
 *     VariableDeclarator whose init is a function (named function bound to a const).
 *
 * RATIONALE: `helper` fails meta-pattern tests 1 + 2 (no agent-noun, no concrete action).
 * Every "helper" file or function is a bucket — it aggregates whatever the author needed
 * the parent to look shorter, and the second-concern collapses into the first file
 * (lvi/no-mixed-concerns fires later as a downstream symptom).
 *
 * Match is case-insensitive on the substring `helper`. Singular and plural caught.
 *
 * REMEDIATION (canonical, per CLAUDE.md):
 *   1. Name the concrete action the code performs (one verb).
 *   2. Agent-noun it (verb-stem + -er/-or/-izer): parser, validator, formatter, builder,
 *      mapper, composer, resolver, etc. (open registry, see rules.md axis 2 meta-pattern.)
 *   3. Place the role-folder file at `{feature}/{role}s/{action}-{role}.ts`. If the new
 *      function genuinely lives in the same axis 1 stable file, rename it to the action
 *      it performs — not "help" / "helper".
 *   4. NEVER bundle multiple concerns into a single helper file. Split per concrete action.
 *
 * NO inline-disable. NO exemptions. The word is banned.
 */

const path = require("path");

const BANNED_TOKEN = "helper";

function containsBanned(str) {
    if (!str) return false;
    return String(str).toLowerCase().includes(BANNED_TOKEN);
}

function basenameNoExt(p) {
    const base = path.basename(p);
    const dot = base.indexOf(".");
    return dot === -1 ? base : base.slice(0, dot);
}

function folderSegments(filename) {
    const normalized = String(filename || "").replaceAll("\\", "/");
    return normalized.split("/").slice(0, -1);
}

function reportIdentifier(context, node, kind, name) {
    if (!containsBanned(name)) return;
    context.report({
        node,
        messageId: "bannedIdentifier",
        data: { kind, name },
    });
}

module.exports = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Bans the token `helper` in filenames, folder paths, and identifiers. " +
                "Helpers aggregate concerns; the remediation is concrete-action axis 2 decomposition.",
        },
        schema: [],
        messages: {
            bannedFile:
                "File basename `{{name}}` contains the banned token `helper`. " +
                "REMEDIATE: rename to {action}-{role}.ts. Name the concrete action the file performs " +
                "(parse / validate / format / build / map / compose / resolve / ...). " +
                "If two concerns live here, split per concrete action — each gets its own role-folder file. " +
                "NEVER aggregate concerns under `helper`. See .claude/rules/rules.md axis 2 meta-pattern.",
            bannedFolder:
                "Folder segment `{{segment}}` contains the banned token `helpers`. " +
                "REMEDIATE: rename the folder to a role-plural (parsers/ / validators/ / formatters/ / builders/ / mappers/ / composers/ / resolvers/). " +
                "One role per folder; one concrete action per file. " +
                "NEVER bundle unrelated concerns under helpers/.",
            bannedIdentifier:
                "{{kind}} name `{{name}}` contains the banned token `helper`. " +
                "REMEDIATE: rename to the concrete action it performs (verb-stem + -er/-or/-izer). " +
                "If the function does two things, SPLIT — each action gets its own named function aligned to one concrete verb. " +
                "Helpers are buckets; renaming them does not fix the architecture — decompose per concern.",
        },
    },
    create(context) {
        const filename = context.filename || (context.getFilename && context.getFilename()) || "";

        return {
            Program(node) {
                if (!filename) return;
                const base = basenameNoExt(filename);
                if (containsBanned(base)) {
                    context.report({
                        node,
                        messageId: "bannedFile",
                        data: { name: base },
                    });
                }
                for (const seg of folderSegments(filename)) {
                    if (containsBanned(seg)) {
                        context.report({
                            node,
                            messageId: "bannedFolder",
                            data: { segment: seg },
                        });
                        break;
                    }
                }
            },

            FunctionDeclaration(node) {
                if (node.id) reportIdentifier(context, node.id, "function", node.id.name);
            },

            FunctionExpression(node) {
                if (node.id) reportIdentifier(context, node.id, "function", node.id.name);
            },

            "VariableDeclarator[init.type='ArrowFunctionExpression']"(node) {
                if (node.id && node.id.type === "Identifier") {
                    reportIdentifier(context, node.id, "function", node.id.name);
                }
            },

            "VariableDeclarator[init.type='FunctionExpression']"(node) {
                if (node.id && node.id.type === "Identifier") {
                    reportIdentifier(context, node.id, "function", node.id.name);
                }
            },

            ClassDeclaration(node) {
                if (node.id) reportIdentifier(context, node.id, "class", node.id.name);
            },

            ClassExpression(node) {
                if (node.id) reportIdentifier(context, node.id, "class", node.id.name);
            },

            MethodDefinition(node) {
                if (node.key && node.key.type === "Identifier") {
                    reportIdentifier(context, node.key, "method", node.key.name);
                }
            },

            TSInterfaceDeclaration(node) {
                if (node.id) reportIdentifier(context, node.id, "interface", node.id.name);
            },

            TSTypeAliasDeclaration(node) {
                if (node.id) reportIdentifier(context, node.id, "type", node.id.name);
            },

            TSEnumDeclaration(node) {
                if (node.id) reportIdentifier(context, node.id, "enum", node.id.name);
            },
        };
    },
};
