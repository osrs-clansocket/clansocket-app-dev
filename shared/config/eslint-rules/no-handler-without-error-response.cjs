/**
 * LVI/no-handler-without-error-response — async route handler (Request, Response) whose
 * top-level body is not wrapped in try/catch and is not invoked through handleAsync.
 * Without that, throws turn into UnhandledPromiseRejection + the client hangs.
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

function paramTypeName(p) {
    if (!p.typeAnnotation || !p.typeAnnotation.typeAnnotation) return null;
    const t = p.typeAnnotation.typeAnnotation;
    if (t.type !== "TSTypeReference" || !t.typeName || t.typeName.type !== "Identifier") return null;
    return t.typeName.name;
}

function isRouteHandler(fn) {
    if (!fn.async) return false;
    const names = (fn.params || []).map(paramTypeName);
    return names.includes("Request") && names.includes("Response");
}

function hasTryWrap(fn) {
    if (!fn.body || fn.body.type !== "BlockStatement") return true;
    for (const s of fn.body.body) {
        if (s.type === "TryStatement") return true;
    }
    return false;
}

function isWrappedByHandleAsync(node) {
    let p = node.parent;
    while (p) {
        if (p.type === "CallExpression") {
            const callee = p.callee;
            if (callee.type === "Identifier" && (callee.name === "handleAsync" || callee.name === "asyncHandler")) return true;
        }
        if (p.type === "ExpressionStatement") return false;
        p = p.parent;
    }
    return false;
}

module.exports = {
    meta: { type: "problem", docs: { description: "async handler without try/catch or handleAsync wrap" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        function check(node) {
            if (!isRouteHandler(node)) return;
            if (hasTryWrap(node)) return;
            if (isWrappedByHandleAsync(node)) return;
            const t = trace(node, raw, mod);
            const ctx = getContext(node);
            context.report({ node, messageId: "report", data: { report: build4DReport({
                rule: "no-handler-without-error-response",
                narrative: `${file}:${node.loc.start.line} is an async route handler (Request, Response) with no try/catch and not wrapped by handleAsync (${ctx}). If anything inside throws, Express does NOT serve a response — the client hangs until timeout, and Node emits 'UnhandledPromiseRejection'.`,
                graph: {
                    X: `${file}:${node.loc.start.line} — async (Request, Response) handler without try/catch`,
                    Y: `thrown errors escape the function; no res.send() happens; client times out; process logs UnhandledPromiseRejection`,
                    Z: `Every Request Gets A Response — handlers are responsible for either sending or being wrapped by something that will`,
                    W: `mystery timeouts in production; on-call sees client-side timeouts and no server-side error; debugging starts from the wrong end`,
                },
                remediation: `Wrap with handleAsync from api/middleware.js: \`router.get("/...", handleAsync(async (req, res) => { ... }))\`. handleAsync catches throws and serves a 500 with the error message. Or wrap the body in try/catch and explicitly res.status(500).json(...) in the catch.`,
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
