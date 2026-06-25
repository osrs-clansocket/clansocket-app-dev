/**
 * LVI/no-shared-this-after-await — `this.x = ...` (or this.method() that mutates) AFTER
 * an `await` in an async method. Another concurrent caller may have changed this.x during
 * the suspension; the post-await write races.
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

function findEnclosingAsyncMethod(node) {
    let p = node.parent;
    while (p) {
        if (
            (p.type === "FunctionDeclaration" || p.type === "FunctionExpression" || p.type === "ArrowFunctionExpression") &&
            p.async
        ) {
            // is it a method? Check if its parent is MethodDefinition or ObjectProperty (in class/object)
            const q = p.parent;
            if (q && (q.type === "MethodDefinition" || q.type === "Property")) return p;
            return null;
        }
        p = p.parent;
    }
    return null;
}

function findFirstAwaitBefore(node, fnBody) {
    // walk through statements in fnBody in document order; return the first AwaitExpression
    // whose .end < node.start
    const targetStart = node.range[0];
    let firstAwait = null;
    (function walk(n) {
        if (!n || typeof n !== "object" || firstAwait) return;
        if (Array.isArray(n)) { for (const c of n) walk(c); return; }
        if (n.type === "AwaitExpression" && n.range[1] < targetStart) {
            firstAwait = n;
            return;
        }
        for (const k of Object.keys(n)) {
            if (k === "parent" || k === "loc" || k === "range") continue;
            walk(n[k]);
        }
    })(fnBody);
    return firstAwait;
}

// Guard pattern between the await and the mutation — `if (<test referencing this.X>) return;`.
// Covers epoch guards (`if (epoch !== this.epoch) return;`), single-flight (`if (this.busy) return;`),
// and lifecycle (`if (this.disposed) return;`). When this pattern exists, the post-await mutation
// is conditional on the instance still being in the expected state.
function referencesThisMember(testNode) {
    if (!testNode || typeof testNode !== "object") return false;
    if (Array.isArray(testNode)) { for (const c of testNode) if (referencesThisMember(c)) return true; return false; }
    if (testNode.type === "MemberExpression" && testNode.object && testNode.object.type === "ThisExpression") return true;
    for (const k of Object.keys(testNode)) {
        if (k === "parent" || k === "loc" || k === "range") continue;
        if (referencesThisMember(testNode[k])) return true;
    }
    return false;
}

function statementReturnsOrThrows(stmt) {
    if (!stmt) return false;
    if (stmt.type === "ReturnStatement" || stmt.type === "ThrowStatement") return true;
    if (stmt.type === "BlockStatement") {
        for (const s of stmt.body) if (statementReturnsOrThrows(s)) return true;
    }
    return false;
}

function hasGuardBetween(awaitNode, mutationNode, fnBody) {
    if (!awaitNode) return false;
    const lo = awaitNode.range[1];
    const hi = mutationNode.range[0];
    let found = false;
    (function walk(n) {
        if (!n || typeof n !== "object" || found) return;
        if (Array.isArray(n)) { for (const c of n) walk(c); return; }
        if (n.type === "IfStatement" && n.range[0] >= lo && n.range[1] <= hi) {
            if (referencesThisMember(n.test) && statementReturnsOrThrows(n.consequent)) {
                found = true;
                return;
            }
        }
        for (const k of Object.keys(n)) {
            if (k === "parent" || k === "loc" || k === "range") continue;
            walk(n[k]);
        }
    })(fnBody);
    return found;
}

// Single-flight release: the post-await write IS to the same `this.<X>` checked by an entry guard
// `if (this.<X>) return;` OR `if (!this.<X>) return;`. The write is the lock release, not a stale-
// state mutation.
// Enclosed-by-same-member-check: the mutation lives inside an `if (this.<X>)` block where the
// test references the same member being written. The body only executes when the member is in
// the expected state, so concurrent mutations can't apply the write to a stale instance.
function isEnclosedByGuardOnSameMember(node) {
    if (!node || node.type !== "AssignmentExpression" || node.left.type !== "MemberExpression") return false;
    const memberName = node.left.property && node.left.property.name;
    if (!memberName) return false;
    let p = node.parent;
    while (p) {
        if (p.type === "IfStatement" && p.test) {
            let target = null;
            if (p.test.type === "MemberExpression") target = p.test;
            else if (p.test.type === "UnaryExpression" && p.test.operator === "!" && p.test.argument && p.test.argument.type === "MemberExpression") target = p.test.argument;
            if (target && target.object && target.object.type === "ThisExpression"
                && target.property && target.property.name === memberName) {
                return true;
            }
        }
        if (p.type === "FunctionDeclaration" || p.type === "FunctionExpression" || p.type === "ArrowFunctionExpression") break;
        p = p.parent;
    }
    return false;
}

function isGuardReleasePattern(node, fnBody) {
    if (!node || node.type !== "AssignmentExpression" || node.left.type !== "MemberExpression") return false;
    const memberName = node.left.property && node.left.property.name;
    if (!memberName) return false;
    let found = false;
    (function walk(n) {
        if (!n || typeof n !== "object" || found) return;
        if (Array.isArray(n)) { for (const c of n) walk(c); return; }
        if (n.type === "IfStatement" && n.range[1] < node.range[0]) {
            const test = n.test;
            if (!statementReturnsOrThrows(n.consequent)) return;
            let target = null;
            if (test && test.type === "MemberExpression") target = test;
            else if (test && test.type === "UnaryExpression" && test.operator === "!" && test.argument && test.argument.type === "MemberExpression") target = test.argument;
            if (target && target.object && target.object.type === "ThisExpression"
                && target.property && target.property.name === memberName) {
                found = true;
                return;
            }
        }
        for (const k of Object.keys(n)) {
            if (k === "parent" || k === "loc" || k === "range") continue;
            walk(n[k]);
        }
    })(fnBody);
    return found;
}

module.exports = {
    meta: { type: "problem", docs: { description: "this.x = ... after await — race risk" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        return {
            AssignmentExpression(node) {
                if (node.left.type !== "MemberExpression") return;
                if (node.left.object.type !== "ThisExpression") return;
                const fn = findEnclosingAsyncMethod(node);
                if (!fn) return;
                const fnBody = fn.body;
                if (!fnBody) return;
                const priorAwait = findFirstAwaitBefore(node, fnBody);
                if (!priorAwait) return;
                if (hasGuardBetween(priorAwait, node, fnBody)) return;
                if (isGuardReleasePattern(node, fnBody)) return;
                if (isEnclosedByGuardOnSameMember(node)) return;
                const t = trace(node, raw, mod);
                const ctx = getContext(node);
                context.report({ node, messageId: "report", data: { report: build4DReport({
                    rule: "no-shared-this-after-await",
                    narrative: `${file}:${node.loc.start.line} writes to this.${node.left.property.name || "?"} AFTER an await in ${ctx}. Between the await and this write, another caller may have modified the same instance — the post-await write may race or clobber.`,
                    graph: {
                        X: `${file}:${node.loc.start.line} — this.${node.left.property.name || "?"} = ... after await at line ${priorAwait.loc.start.line}`,
                        Y: `the instance is not exclusive during the suspension; concurrent callers can interleave reads/writes`,
                        Z: `Async Methods Are Not Atomic — \`this\` is shared state across all in-flight calls`,
                        W: `data loss on concurrent updates; subtle "last write wins" bugs that only repro under load`,
                    },
                    remediation: `One of: (1) move the mutation BEFORE the await (capture the value, await, then use it); (2) use a queue/mutex so only one caller mutates at a time; (3) refactor to not store on \`this\` — pass the value through return type and let the caller decide.`,
                    trace: t,
                }) } });
            },
        };
    },
};
