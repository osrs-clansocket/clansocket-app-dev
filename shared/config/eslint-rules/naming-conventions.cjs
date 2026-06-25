/**
 * LVI/naming-conventions — Enforces kebab-case filenames + path-encoded shrinkage.
 * no_location: brittleness → semantic addressing (meaning-based reference).
 * Predictable naming = deterministic resolution. FOLDER = ROLE; filename
 * shrinks as path encodes more context (never prefix with what the path says).
 *
 * Shrinkage applies to ACTION prefixes only. Foundational/contract files in
 * folders like base/ / abstract/ / interface/ use IDENTIFIER prefixes that are
 * load-bearing and exempt from shrinkage — `base/base-registry.ts` is correct;
 * the `base-` prefix declares meta-type, it is not a path-encoded redundancy.
 *
 * IMMEDIATE-PARENT RESTATEMENT — The doctrine in `.claude/rules/rules.md` says
 * `FILENAME = <prefix>-<parent-singular>.ts`. For singular feature folders
 * (e.g. `combat/`, `auth/`, `payment/`) the parent IS the parent-singular,
 * so the canonical filename pattern `<parent>-<role>.ts` (e.g.
 * `combat/combat-buckets.ts`) restates the parent as the semantic anchor.
 * That restatement is doctrine-compliant — exempt from redundancy detection.
 * Only tokens redundant with the GRANDPARENT or higher path segments are flagged.
 */
const path = require("path");
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, trace } = require("./report-builder.cjs");

// Optional leading underscore: framework files (auto-loaders, mount-registries) use `_`
// prefix as the workspace convention for "auto-loader skips this file". See the
// `skipPrefix = "_"` default in main/discord/src/base/auto-loader.ts — the framework
// itself depends on the prefix to avoid recursive self-import.
const KEBAB_RE = /^_?[a-z0-9]+(-[a-z0-9]+)*$/;

// Tooling conventions that require multi-dot filenames:
//   `*.worker.ts` — Vite's worker import expects this suffix to emit a worker bundle
//   `*.d.ts` — TypeScript ambient declaration files
// Both are framework-mandated; kebab-case applies to the base portion only.
const TOOLING_SUFFIX_RE = /^(.+?)\.(worker|d)$/;

const FOUNDATIONAL_IDENTIFIERS = new Set(["base", "abstract", "interface", "contract"]);

// Only consider path segments inside the source tree as semantic context. Segments above
// `<surface>/src/` (workspace folders like `clansocket-app/`, `BanesLab/`) describe project
// layout, not the file's role-folder context — they would otherwise leak tokens like `app`
// into the redundancy filter on legitimate filenames.
const SRC_MARKER_RE = /\/main\/(?:dashboard|server|discord)\/src\//;

function pathTokenSet(raw) {
    const dir = path.dirname(raw);
    const srcMatch = SRC_MARKER_RE.exec(dir + "/");
    const scoped = srcMatch ? dir.slice(srcMatch.index + srcMatch[0].length) : dir;
    const segments = scoped.split("/").filter(Boolean);
    const tokens = new Set();
    for (const seg of segments) {
        for (const t of seg.split("-")) tokens.add(t.toLowerCase());
    }
    return tokens;
}

function immediateParentTokens(raw) {
    const immediateParent = path.basename(path.dirname(raw)).toLowerCase();
    return new Set(immediateParent.split("-"));
}

// Per `.claude/rules/rules.md`: the canonical `<prefix>-<parent-singular>.ts` pattern allows
// the prefix to come from the GRANDPARENT (semantic-domain) folder when the immediate parent
// is a generic role folder (stores/, mappers/, registries/, etc.). Example from the doctrine:
// `state/identity/stores/identity-store.ts` — `identity-` prefix comes from the grandparent
// `identity/` folder, NOT the immediate parent `stores/`. The grandparent-token must be
// exempted alongside the immediate-parent token.
function grandparentTokens(raw) {
    const dir = path.dirname(raw);
    const grandparentDir = path.dirname(dir);
    if (grandparentDir === dir || grandparentDir === ".") return new Set();
    const grandparentName = path.basename(grandparentDir).toLowerCase();
    if (!grandparentName) return new Set();
    return new Set(grandparentName.split("-"));
}

function isIdentifierPrefixFile(raw, firstToken) {
    const lowerFirst = firstToken.toLowerCase();
    if (!FOUNDATIONAL_IDENTIFIERS.has(lowerFirst)) return false;
    const immediateParent = path.basename(path.dirname(raw)).toLowerCase();
    return immediateParent === lowerFirst;
}

function reportKebabViolation(context, node, raw, mod, filename, ext, base) {
    const suggestion =
        base
            .replace(/([a-z])([A-Z])/g, "$1-$2")
            .replace(/[_\s]+/g, "-")
            .replace(/[^a-z0-9-]/gi, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "")
            .toLowerCase() + ext;
    const t = trace(node, raw, mod);
    context.report({
        node,
        messageId: "report",
        data: {
            report: build4DReport({
                rule: "naming-conventions",
                narrative: `Filename "${filename}" violates kebab-case convention. This codebase uses kebab-case for all source files — lowercase, hyphens only, no underscores, no spaces, no uppercase. Consistent naming enables deterministic file resolution.`,
                graph: {
                    X: `${t.file} — filename "${filename}" in [${mod}]`,
                    Y: `every import/require referencing this file uses the current name — rename propagates`,
                    Z: `no_location (SegregateByMeaning) — files addressed by convention, not arbitrary names`,
                    W: `case-sensitive filesystems will break imports if naming is inconsistent across environments`,
                },
                remediation: `Rename "${filename}" to "${suggestion}". Update all imports/requires referencing the old name. Run lint:fix to verify no broken references remain.`,
                trace: t,
            }),
        },
    });
}

function reportRedundancyViolation(context, node, raw, mod, filename, base, redundant, ext) {
    const remainingTokens = base.split("-").filter((tok) => !redundant.includes(tok));
    const suggestion = remainingTokens.join("-") + ext;
    const t = trace(node, raw, mod);
    context.report({
        node,
        messageId: "report",
        data: {
            report: build4DReport({
                rule: "naming-conventions",
                narrative: `Filename "${filename}" contains token(s) [${redundant.join(", ")}] that the parent path already encodes. FOLDER = ROLE; filename's action-prefix discriminates ONLY within the role-folder and shrinks as path encodes more context. Deep path means shorter filename — never prefix the filename with anything the path already says.`,
                graph: {
                    X: `${t.file} — redundant filename token(s): [${redundant.join(", ")}]`,
                    Y: `every import referencing this file uses the redundant name — rename propagates`,
                    Z: `path-encoded context — folder = role; filename's action-prefix discriminates ONLY within the role-folder`,
                    W: `redundant prefixes break the role-folder mental model; consumers read the filename instead of the path`,
                },
                remediation: `Rename "${filename}" to "${suggestion}". Drop the path-encoded token(s). Update all imports/requires referencing the old name.`,
                trace: t,
            }),
        },
    });
}

module.exports = {
    meta: {
        type: "problem",
        docs: { description: "Enforce kebab-case filenames + path-encoded shrinkage (no redundant prefix)" },
        schema: [],
        messages: { report: "{{ report }}" },
    },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        if (!mod) return {};
        return {
            Program(node) {
                const filename = path.basename(raw);
                const ext = path.extname(filename);
                let base = filename.slice(0, filename.length - ext.length);
                const toolingMatch = TOOLING_SUFFIX_RE.exec(base);
                if (toolingMatch) base = toolingMatch[1];
                if (!KEBAB_RE.test(base)) {
                    reportKebabViolation(context, node, raw, mod, filename, ext, base);
                    return;
                }
                const segments = base.split("-");
                if (segments.length < 2) return;
                const actionTokens = segments.slice(0, -1);
                const pathTokens = pathTokenSet(raw);
                const parentTokens = immediateParentTokens(raw);
                const grandparentTok = grandparentTokens(raw);
                let redundant = actionTokens.filter((t) => pathTokens.has(t));
                if (isIdentifierPrefixFile(raw, segments[0])) {
                    redundant = redundant.filter((t) => t.toLowerCase() !== segments[0].toLowerCase());
                }
                redundant = redundant.filter((t) => !parentTokens.has(t.toLowerCase()));
                redundant = redundant.filter((t) => !grandparentTok.has(t.toLowerCase()));
                if (redundant.length > 0) {
                    reportRedundancyViolation(context, node, raw, mod, filename, base, redundant, ext);
                }
            },
        };
    },
};
