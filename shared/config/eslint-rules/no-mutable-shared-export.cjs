/**
 * LVI/no-mutable-shared-export — `export const x = []` (or new Map/Set) where the exported
 * name is later mutated by importers. Hides coupling, creates race-y shared state.
 *
 * Detects the EXPORT side: any `export const x = ArrayLiteral | new Map() | new Set()`
 * (without `as const` or `Object.freeze` wrap). The mutation side is harder to check
 * statically without cross-file scope analysis; this rule warns at the export so consumers
 * are forced to choose a different shape (a registry function or frozen literal).
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

function isMutableInit(init) {
    if (!init) return null;
    if (init.type === "ArrayExpression") return "Array";
    if (init.type === "ObjectExpression") return null; // const objects are common config; skip
    if (init.type === "NewExpression" && init.callee.type === "Identifier") {
        if (["Map", "Set", "WeakMap", "WeakSet"].includes(init.callee.name)) return init.callee.name;
    }
    return null;
}

function isFrozenOrConst(init) {
    if (!init) return false;
    if (init.type === "CallExpression" && init.callee.type === "MemberExpression") {
        const obj = init.callee.object;
        const prop = init.callee.property;
        if (obj.type === "Identifier" && obj.name === "Object" && prop.type === "Identifier" && prop.name === "freeze") return true;
    }
    // `[...] as const`
    if (init.type === "TSAsExpression" && init.typeAnnotation && init.typeAnnotation.type === "TSTypeReference") {
        const id = init.typeAnnotation.typeName;
        if (id && id.type === "Identifier" && id.name === "const") return true;
    }
    return false;
}

const MUTABLE_BUILTIN_TYPE_NAMES = new Set(["Array", "Set", "Map", "WeakMap", "WeakSet"]);

function hasReadonlyTypeAnnotation(idNode) {
    const ann = idNode.typeAnnotation;
    if (!ann || !ann.typeAnnotation) return false;
    const t = ann.typeAnnotation;
    // `readonly T[]`
    if (t.type === "TSTypeOperator" && t.operator === "readonly") return true;
    if (t.type === "TSTypeReference" && t.typeName.type === "Identifier") {
        const n = t.typeName.name;
        // `ReadonlyArray<T>` / `ReadonlySet<T>` / `ReadonlyMap<T>`
        if (n === "ReadonlyArray" || n === "ReadonlySet" || n === "ReadonlyMap") return true;
        // User-defined type alias — the developer reached for a named type instead of the
        // mutable builtin. Convention here is type aliases encode readonly intent
        // (`type QuipSet = readonly Quip[]`). Mutable builtins (Array/Set/Map) still fire.
        if (!MUTABLE_BUILTIN_TYPE_NAMES.has(n)) return true;
    }
    return false;
}

module.exports = {
    meta: { type: "problem", docs: { description: "Exported const that's a mutable collection" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        return {
            ExportNamedDeclaration(node) {
                if (!node.declaration) return;
                if (node.declaration.type !== "VariableDeclaration") return;
                if (node.declaration.kind !== "const") return;
                for (const decl of node.declaration.declarations) {
                    if (decl.id.type !== "Identifier") continue;
                    if (isFrozenOrConst(decl.init)) continue;
                    if (hasReadonlyTypeAnnotation(decl.id)) continue;
                    const kind = isMutableInit(decl.init);
                    if (!kind) continue;
                    const t = trace(decl, raw, mod);
                    const ctx = getContext(decl);
                    context.report({ node: decl, messageId: "report", data: { report: build4DReport({
                        rule: "no-mutable-shared-export",
                        narrative: `${file}:${decl.loc.start.line} exports '${decl.id.name}' as a mutable ${kind} in ${ctx}. Any importer can .push/.set/.delete on it — coupling becomes invisible: a single grep doesn't tell you who mutates the shared state, and concurrent handlers race on it.`,
                        graph: {
                            X: `${file}:${decl.loc.start.line} — exported mutable '${decl.id.name}: ${kind}'`,
                            Y: `every importer can mutate; ownership of the data lifecycle becomes ambient`,
                            Z: `Encapsulated Mutability — mutation should go through a function that owns the invariants`,
                            W: `race conditions across handlers (in-process), insertion-order bugs, hard-to-diagnose state corruption that only repros under load`,
                        },
                        remediation: `Choose one: (1) wrap in a registry module that exports add/get/list functions instead of the raw collection; (2) freeze it: \`export const ${decl.id.name} = Object.freeze(...)\` if read-only is intent; (3) keep mutable but rename to \`_${decl.id.name}\` and add explicit accessor functions next to it.`,
                        trace: t,
                    }) } });
                }
            },
        };
    },
};
