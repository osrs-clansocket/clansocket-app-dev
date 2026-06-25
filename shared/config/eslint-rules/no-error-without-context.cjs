/**
 * LVI/no-error-without-context — `throw new Error("short")` or `throw new Error()` with
 * no template interpolation / no concatenation / no helper. Debugging incidents loses
 * 10× more time when error messages don't include the offending input.
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

// UPPER_SNAKE token (≥3 chars after leading caps) — a literal containing one is naming the
// specific failing input (env var, constant, config key). The string itself IS the context.
const UPPER_SNAKE_RE = /[A-Z][A-Z0-9_]{2,}/;

// User-facing prose: multi-sentence string OR contains class-method reference (`ClassName.method`).
// The message is targeting end-users or names the operation; structured input-context isn't applicable.
const SENTENCE_BOUNDARY_RE = /[.!?]\s+[A-Z]/;
const CLASS_METHOD_RE = /[A-Z][A-Za-z0-9]+\.[a-z][A-Za-z0-9]+/;

function isFunctionParamIdentifier(arg, paramNames) {
    return arg && arg.type === "Identifier" && paramNames.has(arg.name);
}

function literalNamesInput(arg) {
    if (!arg || arg.type !== "Literal") return false;
    if (typeof arg.value !== "string") return false;
    return UPPER_SNAKE_RE.test(arg.value);
}

function literalIsUserProse(arg) {
    if (!arg || arg.type !== "Literal") return false;
    if (typeof arg.value !== "string") return false;
    if (SENTENCE_BOUNDARY_RE.test(arg.value)) return true;
    if (CLASS_METHOD_RE.test(arg.value)) return true;
    return false;
}

function hasContext(arg, paramNames) {
    if (!arg) return false;
    if (arg.type === "TemplateLiteral") return arg.expressions.length > 0; // template with interpolation
    if (arg.type === "BinaryExpression" && arg.operator === "+") return true;
    if (arg.type === "CallExpression") return true; // string builder
    // `result.reason ?? "fallback"` / `error || "fallback"` — LHS is the input context.
    if (arg.type === "LogicalExpression" && (arg.operator === "??" || arg.operator === "||")) {
        if (arg.left.type !== "Literal") return true;
    }
    if (isFunctionParamIdentifier(arg, paramNames)) return true; // passthrough — caller supplies
    if (literalNamesInput(arg)) return true; // string itself names the failing input
    if (literalIsUserProse(arg)) return true; // user-facing instruction OR class-method state assertion
    return false;
}

function collectParamNames(fnNode) {
    const out = new Set();
    if (!fnNode || !fnNode.params) return out;
    for (const p of fnNode.params) {
        if (p.type === "Identifier") out.add(p.name);
        else if (p.type === "AssignmentPattern" && p.left.type === "Identifier") out.add(p.left.name);
        else if (p.type === "RestElement" && p.argument.type === "Identifier") out.add(p.argument.name);
    }
    return out;
}

const GENERIC_ERROR_NAMES = new Set([
    "Error",
    "TypeError",
    "RangeError",
    "SyntaxError",
    "ReferenceError",
    "EvalError",
    "URIError",
    "Exception",
]);

function isGenericErrorClass(name) {
    return GENERIC_ERROR_NAMES.has(name);
}

module.exports = {
    meta: { type: "problem", docs: { description: "Error thrown without contextual info" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        const fnStack = [];
        function enter(node) { fnStack.push(collectParamNames(node)); }
        function exit() { fnStack.pop(); }
        function paramNamesInScope() {
            const merged = new Set();
            for (const s of fnStack) for (const n of s) merged.add(n);
            return merged;
        }
        return {
            FunctionDeclaration(node) { enter(node); },
            FunctionExpression(node) { enter(node); },
            ArrowFunctionExpression(node) { enter(node); },
            "FunctionDeclaration:exit": exit,
            "FunctionExpression:exit": exit,
            "ArrowFunctionExpression:exit": exit,
            ThrowStatement(node) {
                if (node.argument.type !== "NewExpression") return;
                if (node.argument.callee.type !== "Identifier") return;
                const name = node.argument.callee.name;
                if (!isGenericErrorClass(name)) return;
                const msgArg = node.argument.arguments[0];
                if (hasContext(msgArg, paramNamesInScope())) return;
                const t = trace(node, raw, mod);
                const ctx = getContext(node);
                context.report({ node, messageId: "report", data: { report: build4DReport({
                    rule: "no-error-without-context",
                    narrative: `${file}:${node.loc.start.line} throws ${name} with no contextual info (no template interpolation, no concat, no message builder) in ${ctx}. During an incident the error reaches the log saying just '${msgArg && msgArg.type === "Literal" ? msgArg.value : "<empty>"}'. On-call wastes 10× more time finding the offending input.`,
                    graph: {
                        X: `${file}:${node.loc.start.line} — throw without input context`,
                        Y: `incident debugging looks at error message → message has no input → must reproduce locally to find which call failed`,
                        Z: `Errors Must Carry Context — message should include the inputs that caused the failure`,
                        W: `MTTR on incidents climbs; stack traces alone insufficient because the failing code path is reachable from many call sites`,
                    },
                    remediation: `Add interpolation: \`throw new ${name}(\\\`<operation> failed: \${JSON.stringify({ inputName: value })}\\\`)\`. For complex contexts use a builder: \`throw new ${name}(buildErrorMessage(op, inputs))\`. Empty/static error messages are never the right answer.`,
                    trace: t,
                }) } });
            },
        };
    },
};
