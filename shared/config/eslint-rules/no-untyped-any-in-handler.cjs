/**
 * LVI/no-untyped-any-in-handler — `: any` parameter or return type in a function that's
 * registered as a route handler / middleware / websocket handler. Type info loss in
 * the hot path means runtime cost (extra checks) + bug class (typos compile).
 *
 * Heuristic: any function with `Request` / `Response` / `Router` / `WebSocket` / `ws` in
 * its signature that also has a `: any` somewhere in its params or return.
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

const HANDLER_TYPE_HINTS = ["Request", "Response", "Router", "WebSocket", "NextFunction"];

function containsAny(typeNode) {
    if (!typeNode) return false;
    if (typeNode.type === "TSAnyKeyword") return true;
    for (const k of Object.keys(typeNode)) {
        if (k === "parent" || k === "loc" || k === "range") continue;
        const v = typeNode[k];
        if (v && typeof v === "object") {
            if (Array.isArray(v)) { for (const c of v) if (containsAny(c)) return true; }
            else if (containsAny(v)) return true;
        }
    }
    return false;
}

function isHandlerSignature(node) {
    for (const p of node.params || []) {
        if (p.typeAnnotation && p.typeAnnotation.typeAnnotation) {
            const t = p.typeAnnotation.typeAnnotation;
            if (t.type === "TSTypeReference" && t.typeName && t.typeName.type === "Identifier") {
                if (HANDLER_TYPE_HINTS.includes(t.typeName.name)) return true;
            }
        }
    }
    return false;
}

function findAnyParam(node) {
    for (const p of node.params || []) {
        if (p.typeAnnotation && containsAny(p.typeAnnotation.typeAnnotation)) return p;
    }
    if (node.returnType && containsAny(node.returnType.typeAnnotation)) return node;
    return null;
}

module.exports = {
    meta: { type: "problem", docs: { description: ": any in route handler" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        function check(node) {
            if (!isHandlerSignature(node)) return;
            const offender = findAnyParam(node);
            if (!offender) return;
            const t = trace(offender, raw, mod);
            const ctx = getContext(offender);
            context.report({ node: offender, messageId: "report", data: { report: build4DReport({
                rule: "no-untyped-any-in-handler",
                narrative: `${file}:${offender.loc.start.line} uses ': any' in a function whose signature looks like a route handler / middleware (${ctx}). Handlers are the hot path; losing types here means every typo compiles, every refactor risks runtime crashes, and the type checker can't catch class-of-bugs at boundaries.`,
                graph: {
                    X: `${file}:${offender.loc.start.line} — ': any' in handler signature`,
                    Y: `request/response shape is unchecked at the seam; downstream code reads .x where x might not exist`,
                    Z: `Type Safety Is Strongest At Boundaries — the cheapest place to validate shapes is where they enter`,
                    W: `runtime errors that should be compile-time errors; refactor blast radius grows because the type-checker can't see through any`,
                },
                remediation: `Replace any with the concrete shape: \`req: Request<{ slug: string }, ..., RequestBody>\`, \`res: Response<ResponseBody>\`. If the shape is genuinely dynamic, use \`unknown\` + a runtime validator (zod / custom guard) — never any.`,
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
