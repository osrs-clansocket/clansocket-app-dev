/**
 * LVI/no-cross-layer-import — declared architectural layers must not be bypassed.
 *
 * Layer definitions (in main/server/src):
 *   - routes/handlers/plugin-api → cannot import schemas/ or migrations/ directly (use database/)
 *   - any non-database/ → cannot import from database/<kind>/migrations/ or database/<kind>/schemas/
 *   - shared/ → cannot import from anything except other shared/ or node builtins
 *
 * The layer rules surface architecture violations early.
 */
const path = require("node:path");
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

const FORBIDDEN_PATTERNS = [
    // Routes/handlers/plugin-api → must not import schemas/migrations directly
    { fromMatch: /\/(routes|handlers)\//, toMatch: /\/database\/migrations\//, reason: "route/handler layer must not touch migrations directly" },
    { fromMatch: /\/(routes|handlers)\//, toMatch: /\/database\/schemas\//, reason: "route/handler layer must not import schema SQL files directly" },
    { fromMatch: /\/plugin-api\//, toMatch: /\/database\/migrations\//, reason: "plugin-api must not touch migrations directly" },
    // shared/ → must not import from feature surfaces
    { fromMatch: /\/shared\//, toMatch: /\/(discord|wom|runewatch|ai|clans|data-rights|auth|plugin-api|site|notifications|legacy-rsn|map-assets|seo)\//, reason: "shared/ must not depend on feature folders — dependency direction is feature → shared, never shared → feature" },
];

module.exports = {
    meta: { type: "problem", docs: { description: "Cross-layer import — architecture violation" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        return {
            ImportDeclaration(node) {
                const spec = node.source.value;
                if (typeof spec !== "string") return;
                if (!spec.startsWith(".")) return; // only check relative imports
                // Type-only imports are erased at compile time — no runtime layer dependency.
                if (node.importKind === "type") return;
                const fromDir = path.dirname(raw);
                const resolved = path.resolve(fromDir, spec).replace(/\\/g, "/");
                for (const rule of FORBIDDEN_PATTERNS) {
                    if (!rule.fromMatch.test(raw)) continue;
                    if (!rule.toMatch.test(resolved)) continue;
                    const t = trace(node, raw, mod);
                    const ctx = getContext(node);
                    context.report({ node, messageId: "report", data: { report: build4DReport({
                        rule: "no-cross-layer-import",
                        narrative: `${file}:${node.loc.start.line} imports across architectural layers (${ctx}). ${rule.reason}.`,
                        graph: {
                            X: `${file}:${node.loc.start.line} — imports from forbidden layer: ${spec}`,
                            Y: `architectural boundary is breached; downstream refactors of the inner layer leak to the outer caller`,
                            Z: `Dependency Direction Is One-Way — outer layers may depend on inner, never reverse or peer-to-peer across siblings`,
                            W: `circular dependencies appear; refactoring one folder requires touching consumers across the codebase`,
                        },
                        remediation: `Route the access through the appropriate adapter: routes should use database/ (which wraps schemas/migrations); features should use shared/ utilities, never the other way around. If the function genuinely needs to live across the boundary, move it to the lower layer or to shared/.`,
                        trace: t,
                    }) } });
                    return; // one violation per import
                }
            },
        };
    },
};
