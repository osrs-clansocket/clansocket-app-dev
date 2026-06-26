/**
 * LVI/no-self-alias-export — Bans `export { X as Y }` where X is locally
 * declared in the same file. Also bans exporting the same local symbol under
 * two different names (`export { X }; export { X as Y };`).
 *
 * The smell this kills: dual-path / back-compat / legacy aliasing. If the
 * canonical consumer name is `build`, name the function `build`. Carrying a
 * verbose internal name AND a short alias creates two truths for the same
 * artifact — readers, tools, and future maintainers all have to figure out
 * which is canonical. The right move is to RENAME the declaration.
 *
 * Caught (local declaration + alias):
 *   function buildIdentityTab(...) { ... }
 *   export { buildIdentityTab as build };
 *
 *   export function buildIdentityTab(...) { ... }
 *   export { buildIdentityTab as build };
 *
 *   function buildDiscordTab(...) { ... }
 *   export { buildDiscordTab };
 *   export { buildDiscordTab as build };           // same symbol, two names
 *
 * Allowed:
 *   export function build(...) { ... }              // direct canonical name
 *
 *   import { foo } from "./x.js";
 *   export { foo as bar };                          // re-export alias (has source — caught by
 *                                                   // no-reexport-outside-index if file lacks own decls)
 *
 *   export { build } from "./impl.js";              // pure re-export with source
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, trace } = require("./report-builder.cjs");

function collectDeclaredNames(body) {
    const names = new Set();
    for (const node of body) {
        if (node.type === "FunctionDeclaration" && node.id) names.add(node.id.name);
        else if (node.type === "ClassDeclaration" && node.id) names.add(node.id.name);
        else if (node.type === "TSInterfaceDeclaration" && node.id) names.add(node.id.name);
        else if (node.type === "TSTypeAliasDeclaration" && node.id) names.add(node.id.name);
        else if (node.type === "TSEnumDeclaration" && node.id) names.add(node.id.name);
        else if (node.type === "VariableDeclaration") {
            for (const d of node.declarations) {
                if (d.id && d.id.type === "Identifier") names.add(d.id.name);
            }
        } else if (node.type === "ExportNamedDeclaration" && node.declaration) {
            const decl = node.declaration;
            if (decl.type === "FunctionDeclaration" && decl.id) names.add(decl.id.name);
            else if (decl.type === "ClassDeclaration" && decl.id) names.add(decl.id.name);
            else if (decl.type === "TSInterfaceDeclaration" && decl.id) names.add(decl.id.name);
            else if (decl.type === "TSTypeAliasDeclaration" && decl.id) names.add(decl.id.name);
            else if (decl.type === "TSEnumDeclaration" && decl.id) names.add(decl.id.name);
            else if (decl.type === "VariableDeclaration") {
                for (const d of decl.declarations) {
                    if (d.id && d.id.type === "Identifier") names.add(d.id.name);
                }
            }
        }
    }
    return names;
}

function reportAlias(context, specifier, raw, localName, exportedName) {
    const t = trace(specifier, raw, getModuleForFile(raw));
    context.report({
        node: specifier,
        messageId: "report",
        data: {
            report: build4DReport({
                rule: "no-self-alias-export",
                narrative: `${t.file}:${t.line} exports locally-declared \`${localName}\` aliased as \`${exportedName}\`. Two names for one artifact = dual truth. Rename the declaration to \`${exportedName}\` and drop the alias.`,
                graph: {
                    X: `\`export { ${localName} as ${exportedName} }\` where \`${localName}\` is a top-level declaration in this file`,
                    Y: `readers, refactor tools, IDE rename, and grep all see two names for one symbol — neither obviously canonical; the verbose internal name decays into "the real one" while consumers import the short one`,
                    Z: `single-name-per-symbol — every declaration owns one canonical name; the file's exports use that name verbatim`,
                    W: `every alias added "to preserve the old name" outlives its justification; back-compat layers accumulate; the codebase grows two parallel naming conventions`,
                },
                remediation: `Rename the local declaration to \`${exportedName}\` (the consumer-facing name). Drop the alias line. If \`${localName}\` is referenced inside the same file, update those refs in the same pass.`,
                trace: t,
            }),
        },
    });
}

function reportDoubleExport(context, specifier, raw, localName) {
    const t = trace(specifier, raw, getModuleForFile(raw));
    context.report({
        node: specifier,
        messageId: "report",
        data: {
            report: build4DReport({
                rule: "no-self-alias-export",
                narrative: `${t.file}:${t.line} exports the same local symbol \`${localName}\` more than once (under different exported names). Pick one canonical name.`,
                graph: {
                    X: `\`${localName}\` appears in multiple export specifiers in this file`,
                    Y: `every consumer chooses arbitrarily; some import one name, others the other; renames have to touch both forever`,
                    Z: `single-export-per-symbol — each top-level declaration exposes itself under exactly one name`,
                    W: `dual-name exports never get cleaned up; they read as "intentional" because both appear in the export list; future renames forget one of the two`,
                },
                remediation: `Pick the canonical name. Delete the other \`export { ${localName} ... }\` line. Update any consumers that referenced the dropped name.`,
                trace: t,
            }),
        },
    });
}

module.exports = {
    meta: {
        type: "problem",
        docs: { description: "Ban `export { X as Y }` when X is locally declared, and ban exporting the same symbol under two names." },
        schema: [],
        messages: { report: "{{ report }}" },
    },
    create(context) {
        const raw = (context.filename || context.getFilename()).split("\\").join("/");
        return {
            Program(node) {
                const declared = collectDeclaredNames(node.body);
                const localExportCount = new Map();
                for (const stmt of node.body) {
                    if (stmt.type !== "ExportNamedDeclaration") continue;
                    if (stmt.source) continue;
                    for (const spec of stmt.specifiers) {
                        if (spec.type !== "ExportSpecifier") continue;
                        if (!spec.local || spec.local.type !== "Identifier") continue;
                        const localName = spec.local.name;
                        const exportedName = spec.exported && spec.exported.type === "Identifier" ? spec.exported.name : localName;
                        localExportCount.set(localName, (localExportCount.get(localName) || 0) + 1);
                        if (localName !== exportedName && declared.has(localName)) {
                            reportAlias(context, spec, raw, localName, exportedName);
                        }
                    }
                }
                for (const stmt of node.body) {
                    if (stmt.type !== "ExportNamedDeclaration") continue;
                    if (stmt.source) continue;
                    for (const spec of stmt.specifiers) {
                        if (spec.type !== "ExportSpecifier") continue;
                        if (!spec.local || spec.local.type !== "Identifier") continue;
                        const localName = spec.local.name;
                        const exportedName = spec.exported && spec.exported.type === "Identifier" ? spec.exported.name : localName;
                        if (localName === exportedName && (localExportCount.get(localName) || 0) > 1) {
                            reportDoubleExport(context, spec, raw, localName);
                        }
                    }
                }
            },
        };
    },
};
