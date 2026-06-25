/**
 * LVI/no-recursive-async-without-cap — async function that calls itself without a depth/cap
 * parameter. Risks unbounded async stack / runaway retries / pathological data structures.
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

const CAP_PARAM_RE = /(depth|limit|max|cap|remaining|attempts?|tries|level)/i;

function paramHasCap(params) {
    for (const p of params) {
        const ident = p.type === "Identifier" ? p : (p.type === "AssignmentPattern" && p.left.type === "Identifier" ? p.left : null);
        if (ident && CAP_PARAM_RE.test(ident.name)) return true;
    }
    return false;
}

const FN_TYPES = new Set(["FunctionDeclaration", "FunctionExpression", "ArrowFunctionExpression"]);

// Direct self-call only: skip nested function bodies. A `void self(args)` inside an
// arrow callback fires LATER, after the outer call returns — that's event-driven
// re-entry, not a growing async stack. The cap-parameter prescription doesn't apply.
function bodyCallsSelf(body, name) {
    let found = false;
    (function walk(n) {
        if (found || !n || typeof n !== "object") return;
        if (Array.isArray(n)) { for (const c of n) walk(c); return; }
        if (FN_TYPES.has(n.type)) return; // don't descend — nested fn body has its own scope
        if (n.type === "CallExpression" && n.callee.type === "Identifier" && n.callee.name === name) {
            found = true;
            return;
        }
        for (const k of Object.keys(n)) {
            if (k === "parent" || k === "loc" || k === "range") continue;
            walk(n[k]);
        }
    })(body);
    return found;
}

module.exports = {
    meta: { type: "problem", docs: { description: "Async recursive fn without depth cap" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        return {
            FunctionDeclaration(node) {
                if (!node.async || !node.id) return;
                if (paramHasCap(node.params)) return;
                if (!bodyCallsSelf(node.body, node.id.name)) return;
                const t = trace(node, raw, mod);
                const ctx = getContext(node);
                context.report({ node, messageId: "report", data: { report: build4DReport({
                    rule: "no-recursive-async-without-cap",
                    narrative: `${file}:${node.loc.start.line} declares async function '${node.id.name}' that calls itself, with no depth/cap parameter visible in ${ctx}. If the recursion terminator depends on external data (DB rows, file system, response), a malformed input can produce unbounded recursion → memory blowup or infinite retry.`,
                    graph: {
                        X: `${file}:${node.loc.start.line} — async '${node.id.name}' recurses with no cap parameter`,
                        Y: `termination depends on data shape; one bad input = runaway recursion → memory growth, then crash`,
                        Z: `Recursion Must Be Bounded — a cap parameter is the cheapest defensive guarantee`,
                        W: `retry storms when an upstream is flaky; cascade failures when one recursion step depends on a flaky resource`,
                    },
                    remediation: `Add a cap parameter with a default: \`async function ${node.id.name}(args, depth = 10) { if (depth <= 0) throw new Error(...); ...; return ${node.id.name}(args, depth - 1); }\`. For retry loops use \`attempts\` / \`tries\` semantic.`,
                    trace: t,
                }) } });
            },
        };
    },
};
