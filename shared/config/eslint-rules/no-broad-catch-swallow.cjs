/**
 * LVI/no-broad-catch-swallow — `catch` blocks that silently drop errors hide regressions.
 *
 * Detects: CatchClause whose body has no logger/throw/return/error-reporter call.
 * The body may have comments but those don't count as handling.
 *
 * Allowed (skipped):
 *   - body calls a member like logger.X / log.X / console.X / report.X / capture.X
 *   - body has a throw statement
 *   - body has an explicit return (decision to abort)
 *   - body assigns to a captured error variable / accumulator
 *   - the file is under .lint-reports/ or scripts/ (one-shot)
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

const HANDLER_OBJECTS = new Set([
    "logger", "log", "console", "report", "capture", "sentry", "tracer", "metrics",
    "modalservice", "modal", "toast", "notify", "notifier", "alerts",
]);

// Member-method names that surface the failure to the user (UI feedback) — treat as handling.
const HANDLER_METHOD_NAMES = new Set([
    "alert", "notify", "toast", "warn", "error", "report",
    "settext", "sethtml", "setattr", "setstatus", "showerror", "showmessage", "show",
]);

function isHandlerCallee(callExpr) {
    if (callExpr.callee.type === "MemberExpression") {
        if (callExpr.callee.object.type === "Identifier" && HANDLER_OBJECTS.has(callExpr.callee.object.name.toLowerCase())) return true;
        const prop = callExpr.callee.property;
        if (prop && prop.type === "Identifier" && HANDLER_METHOD_NAMES.has(prop.name.toLowerCase())) return true;
    }
    if (callExpr.callee.type === "Identifier") {
        const n = callExpr.callee.name.toLowerCase();
        if (n.startsWith("log") || n.startsWith("report") || n.startsWith("fail") || n.startsWith("handle")) return true;
        if (n.startsWith("set") || n.startsWith("show") || n.startsWith("alert") || n.startsWith("notify")) return true;
        if (n.includes("error") || n.includes("track")) return true;
    }
    return false;
}

// Best-effort by-design: enclosing function named `try*` declares fallible intent in its name.
// The caller already opted into "this may fail silently" by reaching for the try-prefixed call.
const TRY_FN_RE = /^try[A-Z_]/;

function fnDisplayName(fn) {
    if (!fn) return null;
    if (fn.id && fn.id.name) return fn.id.name;
    const parent = fn.parent;
    if (!parent) return null;
    if (parent.type === "VariableDeclarator" && parent.id.type === "Identifier") return parent.id.name;
    if (parent.type === "Property" && parent.key.type === "Identifier") return parent.key.name;
    if (parent.type === "MethodDefinition" && parent.key.type === "Identifier") return parent.key.name;
    if (parent.type === "AssignmentExpression" && parent.left.type === "Identifier") return parent.left.name;
    return null;
}

function isInsideTryFn(node) {
    let p = node.parent;
    while (p) {
        if (p.type === "FunctionDeclaration" || p.type === "FunctionExpression" || p.type === "ArrowFunctionExpression") {
            const name = fnDisplayName(p);
            return name !== null && TRY_FN_RE.test(name);
        }
        p = p.parent;
    }
    return false;
}

function isHandlingExpression(expr) {
    if (!expr) return false;
    if (expr.type === "AwaitExpression") return isHandlingExpression(expr.argument);
    if (expr.type === "CallExpression") return isHandlerCallee(expr);
    if (expr.type === "AssignmentExpression") return true; // recording the error somewhere
    return false;
}

function nodeReferencesName(node, name) {
    if (!node || typeof node !== "object") return false;
    if (Array.isArray(node)) { for (const c of node) if (nodeReferencesName(c, name)) return true; return false; }
    if (node.type === "Identifier" && node.name === name) return true;
    for (const k of Object.keys(node)) {
        if (k === "parent" || k === "loc" || k === "range") continue;
        if (nodeReferencesName(node[k], name)) return true;
    }
    return false;
}

function catchParamName(catchNode) {
    const p = catchNode.param;
    if (p && p.type === "Identifier") return p.name;
    return null;
}

function isExplicitSuppressMarker(stmt) {
    // `void 0;` / `void someExpr;` / `undefined;` as ExpressionStatement. Verbose enough to
    // be deliberate — nobody types `void 0;` accidentally. Signals "I am choosing to no-op
    // on this exception class" in lieu of a comment.
    if (stmt.type !== "ExpressionStatement") return false;
    const e = stmt.expression;
    if (e.type === "UnaryExpression" && e.operator === "void") return true;
    if (e.type === "Identifier" && e.name === "undefined") return true;
    return false;
}

function isHandledBody(body, paramName) {
    if (body.type !== "BlockStatement") return true; // can't reason
    if (body.body.length === 0) return false; // empty catch — definitely swallowed
    for (const stmt of body.body) {
        if (stmt.type === "ThrowStatement") return true;
        if (stmt.type === "ReturnStatement") return true;
        if (stmt.type === "ExpressionStatement" && isHandlingExpression(stmt.expression)) return true;
        if (stmt.type === "VariableDeclaration") {
            for (const d of stmt.declarations) if (isHandlingExpression(d.init)) return true;
        }
        if (stmt.type === "IfStatement" || stmt.type === "TryStatement") return true; // non-trivial handling
        // Any statement that REFERENCES the caught error param is handling — e.g.
        // `setStatus(host, (err as Error).message, true)` / `showError(err.message)`.
        // Empty catch (no body OR untyped `catch {}`) doesn't pass — paramName is null.
        if (paramName !== null && nodeReferencesName(stmt, paramName)) return true;
        if (isExplicitSuppressMarker(stmt)) return true;
    }
    return false;
}

module.exports = {
    meta: {
        type: "problem",
        docs: { description: "catch blocks must not silently swallow errors" },
        schema: [],
        messages: { report: "{{ report }}" },
    },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        if (raw.includes("/.lint-reports/") || raw.includes("/scripts/")) return {};
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        return {
            CatchClause(node) {
                if (isHandledBody(node.body, catchParamName(node))) return;
                if (isInsideTryFn(node)) return;
                const t = trace(node, raw, mod);
                const ctx = getContext(node);
                context.report({
                    node,
                    messageId: "report",
                    data: {
                        report: build4DReport({
                            rule: "no-broad-catch-swallow",
                            narrative: `${file}:${node.loc.start.line} has a catch block in ${ctx} that does not log, report, throw, or return. Silent error swallowing hides regressions: when the underlying call starts failing in production, no signal surfaces until downstream symptoms appear.`,
                            graph: {
                                X: `${file}:${node.loc.start.line} — catch with empty/passive body`,
                                Y: `whatever throws here vanishes from logs + metrics; observability dies at this seam`,
                                Z: `Errors Are Signals, Not Noise — catching must do one of: report, retry, rethrow, or explicit-suppress-with-comment`,
                                W: `silent failures rot into hot paths as error rates climb; on-call notices the downstream timeout, not the root cause`,
                            },
                            remediation: `Choose one: (1) \`logger.warn(\\\`<context>: \${(err as Error).message}\\\`)\` if recoverable; (2) \`throw err\` if not your problem to handle; (3) explicit suppress with a comment naming the specific exception type that's expected and why ignoring it is correct. Empty catch is never the answer.`,
                            trace: t,
                        }),
                    },
                });
            },
        };
    },
};
