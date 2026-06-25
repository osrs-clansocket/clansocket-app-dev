/**
 * LVI/no-implicit-singleton-race — `let x; function getX() { if (!x) x = init(); return x; }`
 * Two concurrent callers can both see x as undefined and both call init() → double-init.
 *
 * Heuristic: function body matches:
 *   if (<simple test on outer let>) <simple assignment to outer let>;
 *   return <outer let>;
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

function isLazyInitFn(fn) {
    if (!fn.body || fn.body.type !== "BlockStatement") return null;
    if (fn.body.body.length < 2) return null;
    const firstStmt = fn.body.body[0];
    const lastStmt = fn.body.body[fn.body.body.length - 1];
    if (lastStmt.type !== "ReturnStatement" || !lastStmt.argument || lastStmt.argument.type !== "Identifier") return null;
    const returnedName = lastStmt.argument.name;
    if (firstStmt.type !== "IfStatement") return null;
    // detect `if (!x) x = init();` or `if (x === undefined) x = init();`
    const test = firstStmt.test;
    let matchesName = false;
    if (test.type === "UnaryExpression" && test.operator === "!" && test.argument.type === "Identifier" && test.argument.name === returnedName) matchesName = true;
    if (test.type === "BinaryExpression" && (test.operator === "===" || test.operator === "==") && test.left.type === "Identifier" && test.left.name === returnedName) matchesName = true;
    if (!matchesName) return null;
    const consequent = firstStmt.consequent;
    let assign = null;
    if (consequent.type === "BlockStatement" && consequent.body[0]) assign = consequent.body[0];
    else assign = consequent;
    if (!assign) return null;
    if (assign.type === "ExpressionStatement") assign = assign.expression;
    if (!assign || assign.type !== "AssignmentExpression") return null;
    if (assign.left.type !== "Identifier" || assign.left.name !== returnedName) return null;
    if (assign.right.type !== "CallExpression") return null;
    return { name: returnedName, initCall: assign.right };
}

module.exports = {
    meta: { type: "problem", docs: { description: "Lazy init pattern is racy under concurrent first-callers" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        function check(node) {
            // Sync function with sync init call: per the rule's own remediation note, this is fine —
            // JS is single-threaded between awaits, so a non-async lazy-init can't be raced.
            if (!node.async) return;
            const m = isLazyInitFn(node);
            if (!m) return;
            const t = trace(node, raw, mod);
            const ctx = getContext(node);
            context.report({ node, messageId: "report", data: { report: build4DReport({
                rule: "no-implicit-singleton-race",
                narrative: `${file}:${node.loc.start.line} uses the lazy-init-singleton pattern for '${m.name}' (${ctx}). Two concurrent first-callers both see '${m.name}' as undefined → both invoke init(). Result: two instances, one wins, the loser's side effects (resources opened, listeners attached) leak.`,
                graph: {
                    X: `${file}:${node.loc.start.line} — \`if (!${m.name}) ${m.name} = init();\` pattern`,
                    Y: `concurrent first-callers race; init() runs twice; second result overwrites the first but the first's side effects persist`,
                    Z: `Singletons Need Synchronization — JS is single-threaded ONLY between awaits; cross-await races are real`,
                    W: `resource leaks (extra connections, doubled subscriptions); silent because both 'work' until the leak compounds`,
                },
                remediation: `For sync init: this pattern is fine SYNCHRONOUSLY (no await between !x check and assignment). For async init (init returns Promise): either (1) cache the Promise itself: \`if (!xPromise) xPromise = init(); return xPromise;\` so concurrent callers share the same in-flight promise; (2) initialize eagerly at module load; (3) use a one-shot await-aware lazy helper.`,
                trace: t,
            }) } });
        }
        return {
            FunctionDeclaration: check,
            FunctionExpression: check,
            ArrowFunctionExpression: check,
        };
    },
};
