/**
 * LVI/route-needs-auth-middleware — every Express route handler that reads `req.siteAccountId`
 * (or any auth-derived property) MUST include an auth middleware identifier
 * (requireSiteAccount / requireBoundAccount / authenticate) in the handler chain BEFORE the
 * handler function in the route registration call.
 *
 * Why: req.siteAccountId is set ONLY by requireSiteAccount middleware reading the session cookie.
 * Without it the handler always sees `undefined` → 403. The dashboard pickers and any other
 * UI consumer silently fail.
 *
 * Detects:
 *   router.get("/foo", (req, res) => { req.siteAccountId; ... })  // FAILS
 *   router.get("/foo", requireSiteAccount, (req, res) => { req.siteAccountId; ... })  // OK
 *   router.post("/foo", authenticate, (req, res) => { req.siteAccountId; ... })  // OK
 *
 * Walks each handler's body for the auth-derived property access; if found, the route
 * registration must include one of the AUTH_MIDDLEWARE_NAMES as a preceding argument.
 */
"use strict";

const ROUTE_VERBS = new Set(["get", "post", "put", "patch", "delete", "all", "head", "options"]);
const AUTH_MIDDLEWARE_NAMES = new Set([
    "requireSiteAccount",
    "requireBoundAccount",
    "authenticate",
]);
const AUTH_DERIVED_PROPERTIES = new Set([
    "siteAccountId",
]);

function walk(node, visit) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
        for (const item of node) walk(item, visit);
        return;
    }
    if (visit(node) === true) return;
    for (const key of Object.keys(node)) {
        if (key === "parent" || key === "loc" || key === "range") continue;
        walk(node[key], visit);
    }
}

function bodyReadsAuthProperty(fnNode) {
    let found = false;
    walk(fnNode.body, (n) => {
        if (n.type !== "MemberExpression") return false;
        if (n.computed) return false;
        const obj = n.object;
        const prop = n.property;
        if (obj.type !== "Identifier" || obj.name !== "req") return false;
        if (prop.type !== "Identifier") return false;
        if (AUTH_DERIVED_PROPERTIES.has(prop.name)) {
            found = true;
            return true;
        }
        return false;
    });
    return found;
}

function isRouterVerbCall(node) {
    if (node.type !== "CallExpression") return false;
    const callee = node.callee;
    if (callee.type !== "MemberExpression") return false;
    if (callee.computed) return false;
    if (callee.property.type !== "Identifier") return false;
    if (!ROUTE_VERBS.has(callee.property.name)) return false;
    return true;
}

function argsHaveAuthMiddleware(args, handlerIndex) {
    for (let i = 0; i < handlerIndex; i++) {
        const arg = args[i];
        if (!arg) continue;
        if (arg.type === "Identifier" && AUTH_MIDDLEWARE_NAMES.has(arg.name)) return true;
    }
    return false;
}

module.exports = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Express routes that read req.siteAccountId must include requireSiteAccount / requireBoundAccount / authenticate middleware before the handler.",
        },
        schema: [],
    },
    create(context) {
        return {
            CallExpression(node) {
                if (!isRouterVerbCall(node)) return;
                const args = node.arguments;
                for (let i = 1; i < args.length; i++) {
                    const arg = args[i];
                    if (!arg) continue;
                    if (arg.type !== "FunctionExpression" && arg.type !== "ArrowFunctionExpression") continue;
                    if (!bodyReadsAuthProperty(arg)) continue;
                    if (argsHaveAuthMiddleware(args, i)) continue;
                    context.report({
                        node,
                        message:
                            `Route handler reads req.siteAccountId but no auth middleware ` +
                            `(requireSiteAccount / requireBoundAccount / authenticate) precedes it in the registration. ` +
                            `Without the middleware, req.siteAccountId is always undefined → handler 403s every request. ` +
                            `Add the middleware: router.<verb>(path, requireSiteAccount, handler).`,
                    });
                    return;
                }
            },
        };
    },
};
