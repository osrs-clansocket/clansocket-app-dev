/**
 * LVI/no-string-concat-in-loop — `s += x` or `s = s + x` accumulator in loop body.
 * String concat is O(N²) in many engines; use array.push + join.
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

const LOOP_TYPES = new Set(["ForStatement", "ForInStatement", "ForOfStatement", "WhileStatement", "DoWhileStatement"]);

function isInsideLoop(node) {
    let p = node.parent;
    while (p) {
        if (LOOP_TYPES.has(p.type)) return p;
        if (p.type === "FunctionDeclaration" || p.type === "FunctionExpression" || p.type === "ArrowFunctionExpression") return null;
        p = p.parent;
    }
    return null;
}

function isForLoopCounterPosition(node) {
    const p = node.parent;
    if (!p || p.type !== "ForStatement") return false;
    return p.init === node || p.update === node;
}

const FN_TYPES = new Set(["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"]);

function findEnclosingFn(node) {
    let p = node.parent;
    while (p) {
        if (FN_TYPES.has(p.type)) return p;
        if (p.type === "Program") return p;
        p = p.parent;
    }
    return null;
}

function findDeclaratorIn(node, name) {
    if (!node || typeof node !== "object") return null;
    if (node.type === "VariableDeclarator" && node.id && node.id.type === "Identifier" && node.id.name === name) {
        return node;
    }
    if (FN_TYPES.has(node.type) && node !== node.__rootMarker) return null;
    for (const key of Object.keys(node)) {
        if (key === "parent" || key === "loc" || key === "range" || key === "type") continue;
        const child = node[key];
        if (Array.isArray(child)) {
            for (const c of child) {
                const hit = findDeclaratorIn(c, name);
                if (hit) return hit;
            }
        } else if (child && typeof child === "object" && child.type) {
            const hit = findDeclaratorIn(child, name);
            if (hit) return hit;
        }
    }
    return null;
}

const NUMERIC_BINOP = new Set(["+", "-", "*", "/", "%", "**", "&", "|", "^", "<<", ">>", ">>>"]);
const NUMERIC_UNARY = new Set(["-", "+", "~"]);

function classifyInit(init, fn, seen) {
    if (!init) return "unknown";
    if (init.type === "Literal") {
        if (typeof init.value === "string") return "string";
        if (typeof init.value === "number") return "number";
        if (typeof init.value === "boolean") return "number";
        return "unknown";
    }
    if (init.type === "TemplateLiteral") return "string";
    if (init.type === "UnaryExpression" && NUMERIC_UNARY.has(init.operator)) return "number";
    if (init.type === "BinaryExpression" && NUMERIC_BINOP.has(init.operator)) return "number";
    if (init.type === "MemberExpression" && init.property && init.property.name === "length") return "number";
    if (init.type === "CallExpression" && init.callee.type === "MemberExpression") {
        const m = init.callee.property && init.callee.property.name;
        if (m === "indexOf" || m === "lastIndexOf" || m === "floor" || m === "round" || m === "ceil") return "number";
    }
    if (init.type === "Identifier") {
        if (seen.has(init.name)) return "unknown";
        seen.add(init.name);
        const body = fn.body || fn;
        const decl = findDeclaratorIn(body, init.name);
        if (!decl) return "unknown";
        return classifyInit(decl.init, fn, seen);
    }
    return "unknown";
}

function isStringAccumulator(node, target) {
    // Walk outward through enclosing functions until we find the declarator. Counters
    // declared in an outer scope used inside a callback (`let n = 0; arr.forEach(() => n += 1)`)
    // are still numeric — the search must follow closure semantics.
    let fn = findEnclosingFn(node);
    while (fn) {
        const body = fn.body || fn;
        const decl = findDeclaratorIn(body, target);
        if (decl && decl.init) {
            const cls = classifyInit(decl.init, fn, new Set([target]));
            if (cls === "number") return false;
            if (cls === "string") return true;
            // unknown → keep walking outward; may find a better init in outer scope
        }
        if (fn.type === "Program") return true;
        fn = findEnclosingFn(fn);
    }
    return true;
}

module.exports = {
    meta: { type: "problem", docs: { description: "String concat accumulator in loop" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        function reportIf(node, target) {
            const loop = isInsideLoop(node);
            if (!loop) return;
            const t = trace(node, raw, mod);
            const ctx = getContext(node);
            context.report({ node, messageId: "report", data: { report: build4DReport({
                rule: "no-string-concat-in-loop",
                narrative: `${file}:${node.loc.start.line} accumulates onto string '${target}' inside ${loop.type} in ${ctx}. Each concat may allocate a new string of length-N → O(N²) in the worst case.`,
                graph: {
                    X: `${file}:${node.loc.start.line} — string += inside ${loop.type}`,
                    Y: `per-iteration allocation grows with accumulator length; GC pressure compounds`,
                    Z: `Buffer Then Join — array.push + join is O(N) total for the same output`,
                    W: `template rendering, log message construction, CSV/JSON emission become silently quadratic for large N`,
                },
                remediation: `Replace with array accumulator: \`const parts: string[] = []; for (...) parts.push(x); const s = parts.join("");\`. For known-small bounds (e.g. 5-token paths) the rule is overkill — refactor or accept with a comment naming the bound.`,
                trace: t,
            }) } });
        }
        return {
            AssignmentExpression(node) {
                if (node.operator !== "+=" && node.operator !== "=") return;
                if (node.left.type !== "Identifier") return;
                if (isForLoopCounterPosition(node)) return;
                if (!isStringAccumulator(node, node.left.name)) return;
                if (node.operator === "+=") return reportIf(node, node.left.name);
                if (node.right.type === "BinaryExpression" && node.right.operator === "+") {
                    if (node.right.left.type === "Identifier" && node.right.left.name === node.left.name) return reportIf(node, node.left.name);
                }
            },
        };
    },
};
