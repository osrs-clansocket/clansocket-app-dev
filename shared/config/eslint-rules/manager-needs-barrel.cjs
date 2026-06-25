/**
 * LVI/manager-needs-barrel — files that read from a self-registration
 * registry (call any `xxxDefs()` function imported from a `./registry`
 * module) MUST also have at least one side-effect-only import from a
 * sibling barrel file. This is what populates the registry.
 *
 * The plugin pattern:
 *   import "./tabs";                            // ← side-effect barrel
 *   import { manageTabDefs } from "./registry"; // ← registry accessor
 *   ...manageTabDefs().forEach(t => ...)
 *
 * Without the side-effect barrel, manageTabDefs() returns an empty array
 * because no feature module ran its defineX(...) call. Every "manager"
 * file across the dashboard now follows this contract:
 *   - manage/index.ts        → import "./tabs"
 *   - ai-settings/index.ts   → import "./tabs"
 *   - auth/account/index.ts  → import "./panels"
 *   - discord/mode-registry  → import "./modes"
 *   - rail-left.ts           → import "../modes"
 *   - icons/glyph-paths.ts   → import "./families"
 *   - icons/providers.ts     → import "./families"
 *
 * If you import xxxDefs and forget the barrel, the registry is empty at
 * read time and your manager renders nothing — a silent failure that's
 * hard to diagnose without this rule.
 *
 * Caught:
 *   import { manageTabDefs } from "./registry";
 *   manageTabDefs().forEach(...);          // ← no side-effect barrel above
 *
 * Allowed:
 *   import "./tabs";
 *   import { manageTabDefs } from "./registry";
 *   manageTabDefs().forEach(...);
 *
 *   import { defineXxx } from "./registry";    // ← only USES define, doesn't read defs
 *
 * Exempt files:
 *   src/managers/router/registry.ts  — the registry definition itself
 *   src/dom/factory/**               — factory internals
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, trace } = require("./report-builder.cjs");

const EXEMPT_PATH_SEGMENTS = [
    "/dom/factory/",
    "/managers/router/registry.ts",
    "/managers/router/types.ts",
];

function isExemptPath(normPath) {
    for (const seg of EXEMPT_PATH_SEGMENTS) {
        if (normPath.includes(seg)) return true;
    }
    return false;
}

function isRegistryImport(node) {
    if (node.type !== "ImportDeclaration") return false;
    const src = node.source && node.source.value;
    if (typeof src !== "string") return false;
    if (!src.endsWith("/registry") && src !== "./registry" && src !== "../registry") return false;
    return true;
}

function importedNames(node) {
    const out = [];
    for (const spec of node.specifiers) {
        if (spec.type === "ImportSpecifier" && spec.imported && spec.imported.name) {
            out.push(spec.imported.name);
        }
    }
    return out;
}

function isSideEffectImport(node) {
    return node.type === "ImportDeclaration"
        && node.specifiers.length === 0
        && node.source && typeof node.source.value === "string"
        && (node.source.value.startsWith("./") || node.source.value.startsWith("../"));
}

function reportMissing(context, node, accessorName, registrySrc) {
    const raw = (context.filename || context.getFilename()).split("\\").join("/");
    const t = trace(node, raw, getModuleForFile(raw));
    context.report({
        node,
        messageId: "report",
        data: {
            report: build4DReport({
                rule: "manager-needs-barrel",
                narrative: `${t.file}:${t.line} imports \`${accessorName}\` from \`${registrySrc}\` but has no side-effect import that populates the registry. ${accessorName}() returns an empty array because no feature module ran its defineX(...) call — your manager silently renders nothing.`,
                graph: {
                    X: `${t.file}:${t.line} — imports registry accessor \`${accessorName}\` without a sibling \`import "./<barrel>"\` side-effect import`,
                    Y: `defineX(...) calls live in feature modules; they only execute when imported. No barrel → no executions → registry is empty when accessor reads it`,
                    Z: `Subscribe/Bind Pair — every registry-read manager must also declare which barrel populates the registry it reads`,
                    W: `silent empty-render failure: no console error, no lint failure today; the page renders empty because the registry was queried before any defineX ran`,
                },
                remediation: `Add a side-effect import to the file that populates this registry. Convention:\n  - tabs:        import "./tabs";\n  - panels:      import "./panels";\n  - modes:       import "./modes";\n  - families:    import "./families";\n  - routes:      import "./routes";\n\nThe barrel itself is a one-line file of side-effect imports per feature. See \`dom/pages/clans/manage/tabs.ts\` or \`icons/families.ts\` for canonical examples.`,
                trace: t,
            }),
        },
    });
}

module.exports = {
    meta: {
        type: "problem",
        docs: { description: "Manager files that read a self-registration registry must side-effect-import the barrel that populates it." },
        schema: [],
        messages: { report: "{{ report }}" },
    },
    create(context) {
        const raw = (context.filename || context.getFilename()).split("\\").join("/");
        if (isExemptPath(raw)) return {};
        const registryAccessors = []; // [{node, accessorName, src}]
        let hasSideEffectImport = false;
        return {
            ImportDeclaration(node) {
                if (isSideEffectImport(node)) {
                    hasSideEffectImport = true;
                    return;
                }
                if (!isRegistryImport(node)) return;
                const names = importedNames(node);
                for (const n of names) {
                    // Heuristic: accessor names end in "Defs" or "Family" (e.g.,
                    // manageTabDefs, aiSettingsTabDefs, iconFamilyDefs, iconFamily).
                    if (/Defs$/.test(n) || /^iconFamily$/.test(n)) {
                        registryAccessors.push({ node, accessorName: n, src: node.source.value });
                    }
                }
            },
            "Program:exit"() {
                if (hasSideEffectImport) return;
                for (const entry of registryAccessors) {
                    reportMissing(context, entry.node, entry.accessorName, entry.src);
                }
            },
        };
    },
};
