/**
 * LVI/no-magic-numbers — Bans unnamed numeric literals.
 * Options: ignore[], ignoreArrayIndexes, ignoreDefaultValues.
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, trace } = require("./report-builder.cjs");

function resolveValue(node) {
    if (node.parent && node.parent.type === "UnaryExpression" && node.parent.operator === "-") {
        return { value: -node.value, target: node.parent };
    }
    return { value: node.value, target: node };
}

function isArrayIndex(target) {
    const p = target.parent;
    return p && p.type === "MemberExpression" && p.computed && p.property === target;
}

function isDefaultValue(target) {
    const p = target.parent;
    return p && p.type === "AssignmentPattern" && p.right === target;
}

function isInConstDeclarator(target) {
    let p = target.parent;
    while (p) {
        if (p.type === "VariableDeclarator") {
            const decl = p.parent;
            return decl && decl.type === "VariableDeclaration" && decl.kind === "const";
        }
        if (p.type === "PropertyDefinition" && p.value === target) return true;
        if (p.type === "FunctionDeclaration" || p.type === "FunctionExpression" || p.type === "ArrowFunctionExpression") return false;
        if (p.type === "BlockStatement") return false;
        p = p.parent;
    }
    return false;
}

// Data-literal pattern: literal sits inside an Object/Array literal that is the direct subject
// of a ReturnStatement, a const declarator, or an assignment to a MemberExpression
// (e.g. `parts.rimLight = { intensity: 0.8 }` in schema migrations). The literal IS the data —
// extracting it to a name strips the structural context that already documents it. e.g.
// `function migrate8to9(raw) { return { schemaVersion: 9, parts }; }` — the `9` is the migration
// target, embedded in both the function name and the property key. Same applies to deferred
// property assignment: `parts.X = { ... }` is structurally equivalent to `return { X: {...} }`.
function isInReturnedObjectLiteral(target) {
    let p = target.parent;
    while (p) {
        if (p.type === "ObjectExpression" || p.type === "ArrayExpression") {
            let gp = p.parent;
            while (gp) {
                if (gp.type === "ReturnStatement") return true;
                if (gp.type === "AssignmentExpression" && gp.right && gp.left && gp.left.type === "MemberExpression") return true;
                if (gp.type === "CallExpression" || gp.type === "NewExpression") return true;
                if (gp.type === "Property" || gp.type === "ArrayExpression") { gp = gp.parent; continue; }
                if (gp.type === "ObjectExpression") { gp = gp.parent; continue; }
                if (gp.type === "SpreadElement") { gp = gp.parent; continue; }
                break;
            }
        }
        if (p.type === "FunctionDeclaration" || p.type === "FunctionExpression" || p.type === "ArrowFunctionExpression") return false;
        if (p.type === "BlockStatement") return false;
        p = p.parent;
    }
    return false;
}

// Data-with-behavior pattern: `const X = { method: () => { ...N... } }` and any nested
// callbacks/expressions within that method body. The function value of an Object Property
// inside a const-declared object IS part of the data definition — numeric literals in the
// function body (and in any nested callbacks it spawns) are intrinsic to that preset/config
// record. Walks past FunctionExpression/ArrowFunctionExpression provided the eventual root
// IS a const-declared ObjectExpression's Property value chain. Top-level FunctionDeclaration
// still terminates the walk (declared functions are behavior code, not data).
function isInConstObjectMethod(target) {
    let p = target.parent;
    let crossedFn = false;
    while (p) {
        if (p.type === "VariableDeclarator") {
            const decl = p.parent;
            if (!crossedFn) return false;
            return decl && decl.type === "VariableDeclaration" && decl.kind === "const";
        }
        if (p.type === "FunctionDeclaration") return false;
        if (p.type === "MethodDefinition") return false;
        if (p.type === "FunctionExpression" || p.type === "ArrowFunctionExpression") {
            const fnParent = p.parent;
            // Walk past when the function is data: either a Property value of an object literal,
            // or the direct init of a const VariableDeclarator (`const ease = (t) => N`).
            if (fnParent && fnParent.type === "Property" && fnParent.value === p) {
                crossedFn = true;
            } else if (fnParent && fnParent.type === "VariableDeclarator" && fnParent.init === p) {
                crossedFn = true;
            } else if (fnParent && fnParent.type === "ArrayExpression") {
                crossedFn = true;
            }
        }
        p = p.parent;
    }
    return false;
}

module.exports = {
    meta: {
        type: "problem",
        docs: { description: "No unnamed numeric literals" },
        schema: [{
            type: "object",
            properties: {
                ignore: { type: "array", items: { type: "number" } },
                ignoreArrayIndexes: { type: "boolean" },
                ignoreDefaultValues: { type: "boolean" },
            },
            additionalProperties: false,
        }],
        messages: { report: "{{ report }}" },
    },
    create(context) {
        const opts = context.options[0] || {};
        const ignore = new Set(opts.ignore || [-1, 0, 1, 2]);
        const ignoreArrayIndexes = opts.ignoreArrayIndexes !== false;
        const ignoreDefaultValues = opts.ignoreDefaultValues !== false;
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw) || "unknown";
        return {
            Literal(node) {
                if (typeof node.value !== "number") return;
                const { value, target } = resolveValue(node);
                if (ignore.has(value)) return;
                if (ignoreArrayIndexes && isArrayIndex(target)) return;
                if (ignoreDefaultValues && isDefaultValue(target)) return;
                if (isInConstDeclarator(target)) return;
                if (isInConstObjectMethod(target)) return;
                if (isInReturnedObjectLiteral(target)) return;
                const t = trace(node, raw, mod);
                context.report({ node, messageId: "report", data: { report: build4DReport({
                    rule: "no-magic-numbers",
                    narrative: `Numeric literal ${value} appears inline. Violates named-constant principle — magic numbers carry no documentation and resist refactor.`,
                    graph: {
                        X: `literal ${value} at ${t.file}:${t.line}`,
                        Y: `consumers reading the call site cannot infer the meaning; refactors miss all sibling occurrences`,
                        Z: `named_constant (PrincipleSelfDocumenting) — every magic number is a missing identifier`,
                        W: `duplicated unnamed numbers breed inconsistency when one site updates and others dont`,
                    },
                    remediation: `Extract to a named const at the top of the file (or in shared/constants/ if used 2+ files). Allowed defaults: \`-1\` / \`0\` / \`1\` / \`2\`, array indexes, and parameter defaults.`,
                    trace: t,
                }) } });
            },
        };
    },
};
