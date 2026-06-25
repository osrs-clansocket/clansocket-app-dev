/**
 * LVI/no-reexport-outside-index — a module that exports something but declares
 * NOTHING of its own is a pass-through shell. Only `index.*` is permitted to be
 * a pure barrel; every other file must own a declaration (function / class /
 * const / type / interface / enum / namespace), or a default export that IS a
 * function / class / arrow (real logic).
 *
 * The laziness this kills:
 *   - re-export barrels living under a feature name instead of index.ts
 *       export * from "./x.js";
 *       export { foo } from "./y.js";
 *   - forwarded default exports — the file picks one argument and hands the
 *     whole definition to an imported builder, owning nothing:
 *       import { defineRoleMutation } from "./role-mutation-builder.js";
 *       export default defineRoleMutation("add");
 *   - anonymous value exports that should be a named declaration:
 *       export default { color: "red" };
 *       export default 42;
 *
 * Caught (non-index, exports but no own declaration):
 *   export * from "./x.js";
 *   export { foo } from "./y.js";
 *   export default defineRoleMutation("add");
 *   export default { color: "red" };
 *
 * Allowed:
 *   index.ts                                  // the one sanctioned barrel
 *   export const X = 1;                        // owns a declaration
 *   export function f() { ... }                // owns a declaration
 *   export default function () { ... }          // default IS real logic
 *   export default (req, res) => { ... }        // default IS real logic
 *   import "./add-role.js";                     // side-effect barrel: no exports
 *
 * Self-skips on every file that has no exports (side-effect barrels, scripts)
 * and on every index.* file.
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, trace } = require("./report-builder.cjs");

// top-level statements that ARE a declaration the file owns
const OWN_DECLARATION = new Set([
    "FunctionDeclaration",
    "ClassDeclaration",
    "VariableDeclaration",
    "TSInterfaceDeclaration",
    "TSTypeAliasDeclaration",
    "TSEnumDeclaration",
    "TSModuleDeclaration",
    "TSDeclareFunction",
]);

// a default export whose value is one of these owns real logic, not a forward
const DEFAULT_SUBSTANCE = new Set([
    "FunctionDeclaration",
    "ClassDeclaration",
    "ArrowFunctionExpression",
    "FunctionExpression",
    "TSInterfaceDeclaration",
    "TSEnumDeclaration",
]);

function baseNameOf(normPath) {
    const file = normPath.split("/").pop() || normPath;
    return file.split(".")[0];
}

function scanBody(body) {
    let hasExport = false;
    let hasOwn = false;
    let firstExport = null;
    for (const node of body) {
        if (OWN_DECLARATION.has(node.type)) {
            hasOwn = true;
            continue;
        }
        if (node.type === "ExportNamedDeclaration") {
            // `export {}` with no declaration/source/specifiers is just a
            // module-scope marker — it exports nothing real.
            if (!node.declaration && !node.source && node.specifiers.length === 0) continue;
            hasExport = true;
            firstExport = firstExport || node;
            if (node.declaration && OWN_DECLARATION.has(node.declaration.type)) hasOwn = true;
            continue;
        }
        if (node.type === "ExportDefaultDeclaration") {
            hasExport = true;
            firstExport = firstExport || node;
            if (node.declaration && DEFAULT_SUBSTANCE.has(node.declaration.type)) hasOwn = true;
            continue;
        }
        if (node.type === "ExportAllDeclaration" || node.type === "TSExportAssignment") {
            hasExport = true;
            firstExport = firstExport || node;
        }
    }
    return { hasExport, hasOwn, firstExport };
}

function report(context, node, raw) {
    const t = trace(node, raw, getModuleForFile(raw));
    context.report({
        node,
        messageId: "report",
        data: {
            report: build4DReport({
                rule: "no-reexport-outside-index",
                narrative: `${t.file}:${t.line} exports but declares nothing of its own — a pass-through shell (re-export, forwarded default, or anonymous value). Only \`index.*\` may be a pure barrel; every other file must own what it exports.`,
                graph: {
                    X: `${t.file}:${t.line} — module has export(s) but zero own declarations; it forwards imported bindings or exports an anonymous value`,
                    Y: `the real definition lives in the imported module; this file adds a name-only hop that owns no logic, type, or value`,
                    Z: `Single-Concern / index-only-barrel — only \`index.*\` is a sanctioned re-export surface; a feature-named file must declare its own artifact`,
                    W: `every shell adds an indirection layer: rename tooling, dead-export detection, and onboarding all chase a chain of hollow files`,
                },
                remediation: `Give the file its own declaration, or remove it:\n  - re-export barrel → rename to index.ts (the only allowed barrel), or have consumers import the real module directly\n  - forwarded default (\`export default builder("x")\`) → inline the builder body here as a named declaration, or drop this file and pass its one argument at the builder's call site\n  - anonymous default (\`export default <literal>\`) → name it: \`export const NAME = <literal>\``,
                trace: t,
            }),
        },
    });
}

module.exports = {
    meta: {
        type: "problem",
        docs: { description: "A non-index module that exports but declares nothing of its own (pure re-export / forwarded default / anonymous value) is a pass-through shell." },
        schema: [],
        messages: { report: "{{ report }}" },
    },
    create(context) {
        const raw = (context.filename || context.getFilename()).split("\\").join("/");
        if (baseNameOf(raw) === "index") return {};
        return {
            Program(node) {
                const { hasExport, hasOwn, firstExport } = scanBody(node.body);
                if (hasExport && !hasOwn && firstExport) report(context, firstExport, raw);
            },
        };
    },
};
