/**
 * LVI/no-listener-without-cleanup — `emitter.on(event, fn)` without a matching
 * `.off`/`.removeListener` in the same function scope. EventEmitter leak.
 *
 * Heuristic: per function, count .on calls and .off/.removeListener calls on identifiers.
 * If on-count > off-count for a given (emitter, event) pair, flag the .on site.
 * Also allow `req.on("close", ...)` pattern when paired with the same `req` (per-request,
 * GC'd with the request). Skip when the emitter is `req` or `res` (Express handles cleanup).
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

const PER_REQUEST_EMITTERS = new Set(["req", "res", "request", "response", "socket", "ws"]);

// Boot-time wiring carve-out. Setup functions register listeners for the lifetime of a
// long-lived emitter (e.g. discord.js Client whose cleanup happens via .destroy() in a
// separate lifecycle phase). Looking for .off() in the same scope is the wrong test for
// these. Function-name convention covers the workspace pattern: registerX / wireX / setupX
// / initX / bindX / attachX / mountX / configureX.
const SETUP_FN_RE = /^(register|wire|setup|init|bind|attach|mount|configure)[A-Z_]/;

function setupNameForFn(fn) {
    if (!fn) return null;
    if (fn.id && fn.id.name) return fn.id.name;
    const parent = fn.parent;
    if (!parent) return null;
    if (parent.type === "VariableDeclarator" && parent.id.type === "Identifier") return parent.id.name;
    if (parent.type === "Property" && parent.key.type === "Identifier") return parent.key.name;
    if (parent.type === "AssignmentExpression" && parent.left.type === "Identifier") return parent.left.name;
    return null;
}

function isSetupFunction(fn) {
    const name = setupNameForFn(fn);
    return name !== null && SETUP_FN_RE.test(name);
}

function isOnCall(node) {
    if (node.callee.type !== "MemberExpression") return false;
    if (node.callee.property.type !== "Identifier") return false;
    if (node.callee.property.name !== "on" && node.callee.property.name !== "addListener") return false;
    if (node.callee.object.type !== "Identifier") return false;
    return true;
}

function isOffCall(node) {
    if (node.callee.type !== "MemberExpression") return false;
    if (node.callee.property.type !== "Identifier") return false;
    const name = node.callee.property.name;
    return name === "off" || name === "removeListener" || name === "removeAllListeners";
}

module.exports = {
    meta: { type: "problem", docs: { description: ".on() without matching .off() — listener leak" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        const fnStack = [];
        function enter(node) { fnStack.push({ node, ons: [], offs: new Set() }); }
        function exit() {
            const fn = fnStack.pop();
            if (isSetupFunction(fn.node)) return;
            for (const on of fn.ons) {
                if (PER_REQUEST_EMITTERS.has(on.emitter.toLowerCase())) continue;
                if (fn.offs.has(on.emitter)) continue;
                const t = trace(on.node, raw, mod);
                const ctx = getContext(on.node);
                context.report({ node: on.node, messageId: "report", data: { report: build4DReport({
                    rule: "no-listener-without-cleanup",
                    narrative: `${file}:${on.node.loc.start.line} calls ${on.emitter}.on("${on.event}", ...) in ${ctx} with no matching .off/.removeListener in the same function scope. Every call adds a listener; EventEmitter holds them forever. Over server uptime this leaks memory and re-invokes the same handler more times per event.`,
                    graph: {
                        X: `${file}:${on.node.loc.start.line} — .on("${on.event}") with no scoped cleanup on '${on.emitter}'`,
                        Y: `listener count grows monotonically; each event invokes all accumulated listeners`,
                        Z: `Subscribe/Unsubscribe Pair — every subscription must declare its lifecycle`,
                        W: `silent listener accumulation: events trigger O(N²) handler runs over time; warning fires only at default 10 then is silently suppressed`,
                    },
                    remediation: `One of: (1) save the handler ref and call \`${on.emitter}.off("${on.event}", handler)\` at the end of the function (or in a finally / shutdown hook); (2) use \`${on.emitter}.once("${on.event}", ...)\` if you only need the first event; (3) attach to a per-request emitter (req/res/socket) where Express GC handles cleanup. Module-scope .on() registrations are correct only when they're truly one-shot at boot.`,
                    trace: t,
                }) } });
            }
        }
        return {
            FunctionDeclaration(node) { enter(node); },
            FunctionExpression(node) { enter(node); },
            ArrowFunctionExpression(node) { enter(node); },
            "FunctionDeclaration:exit": exit,
            "FunctionExpression:exit": exit,
            "ArrowFunctionExpression:exit": exit,
            CallExpression(node) {
                if (fnStack.length === 0) return;
                const fn = fnStack[fnStack.length - 1];
                if (isOnCall(node)) {
                    const emitter = node.callee.object.name;
                    const eventArg = node.arguments[0];
                    const event = eventArg && eventArg.type === "Literal" ? String(eventArg.value) : "?";
                    fn.ons.push({ node, emitter, event });
                    return;
                }
                if (isOffCall(node)) {
                    if (node.callee.object.type === "Identifier") fn.offs.add(node.callee.object.name);
                }
            },
        };
    },
};
