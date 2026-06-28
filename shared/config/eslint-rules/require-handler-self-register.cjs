/**
 * LVI/require-handler-self-register — every plugin projection handler must self-register.
 *
 * Files under `main/server/src/database/plugin/projection/**` that EXPORT a function whose name
 * starts with `handle` must contain a `registerPluginEvent({ ... handler: <fn>, ... })` call
 * with that function in the `handler` field. Forces the co-location pattern — handler and
 * registration live in the same file.
 *
 * Exempts:
 * - shared utility files that export non-handler functions
 * - files whose path includes `/routing/` (router files, not handlers)
 * - files whose path includes `/projection-utils.ts`, `/envelope.ts`, `/handler-ctx.ts` (substrate)
 */
"use strict";

const PROJECTION_PATH_FRAGMENT = "/database/plugin/projection/";
const EXEMPT_FRAGMENTS = ["/routing/", "/projection-utils.ts", "/envelope.ts", "/handler-ctx.ts", "/_loader.ts", "/snapshot-dedup.ts"];

function isProjectionHandler(filename) {
    const normalized = filename.replace(/\\/g, "/");
    if (!normalized.includes(PROJECTION_PATH_FRAGMENT)) return false;
    for (const fragment of EXEMPT_FRAGMENTS) {
        if (normalized.includes(fragment)) return false;
    }
    return true;
}

function isExportedHandlerName(name) {
    return name.startsWith("handle") && name.length > "handle".length;
}

module.exports = {
    meta: {
        type: "problem",
        docs: { description: "Plugin projection handlers must self-register via registerPluginEvent." },
        schema: [],
    },
    create(context) {
        const filename = context.filename;
        if (!isProjectionHandler(filename)) return {};
        const exportedHandlers = new Map();
        const registeredHandlers = new Set();
        return {
            ExportNamedDeclaration(node) {
                if (!node.declaration) return;
                if (node.declaration.type === "FunctionDeclaration" && node.declaration.id) {
                    const name = node.declaration.id.name;
                    if (isExportedHandlerName(name)) exportedHandlers.set(name, node);
                    return;
                }
                if (node.declaration.type === "VariableDeclaration") {
                    for (const decl of node.declaration.declarations) {
                        if (decl.id.type !== "Identifier") continue;
                        if (!isExportedHandlerName(decl.id.name)) continue;
                        if (!decl.init) continue;
                        if (decl.init.type === "ArrowFunctionExpression" || decl.init.type === "FunctionExpression") {
                            exportedHandlers.set(decl.id.name, node);
                        }
                    }
                }
            },
            CallExpression(node) {
                if (node.callee.type !== "Identifier" || node.callee.name !== "registerPluginEvent") return;
                for (const arg of node.arguments) {
                    if (arg.type !== "ObjectExpression") continue;
                    for (const prop of arg.properties) {
                        if (prop.type !== "Property" || prop.computed) continue;
                        const keyName = prop.key.type === "Identifier" ? prop.key.name : null;
                        if (keyName !== "handler") continue;
                        if (prop.value.type === "Identifier") registeredHandlers.add(prop.value.name);
                    }
                }
            },
            "Program:exit"() {
                for (const [name, node] of exportedHandlers) {
                    if (registeredHandlers.has(name)) continue;
                    context.report({
                        node,
                        message:
                            `Exported handler "${name}" in plugin projection file has no registerPluginEvent call. ` +
                            `Add registerPluginEvent({ eventType, handler: ${name}, routing, payloadFields }) ` +
                            `at module top — handler must be co-located with its registration so the flow builder ` +
                            `surfaces the trigger automatically.`,
                    });
                }
            },
        };
    },
};
