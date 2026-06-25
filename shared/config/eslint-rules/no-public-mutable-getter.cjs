/**
 * LVI/no-public-mutable-getter — class or object that exposes a `get x()` returning a
 * mutable internal collection (this._x where _x is an array / Map / Set). Callers can
 * mutate the internal state without going through any accessor.
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

function isMutableReturn(body) {
    if (!body || body.type !== "BlockStatement") return false;
    const ret = body.body.find((s) => s.type === "ReturnStatement");
    if (!ret || !ret.argument) return false;
    const arg = ret.argument;
    if (arg.type !== "MemberExpression") return false;
    if (arg.object.type !== "ThisExpression") return false;
    if (arg.property.type !== "Identifier") return false;
    return arg.property.name.startsWith("_");
}

module.exports = {
    meta: { type: "problem", docs: { description: "Public getter returns internal mutable" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        return {
            MethodDefinition(node) {
                if (node.kind !== "get") return;
                if (!node.value || !node.value.body) return;
                if (!isMutableReturn(node.value.body)) return;
                const t = trace(node, raw, mod);
                const ctx = getContext(node);
                context.report({ node, messageId: "report", data: { report: build4DReport({
                    rule: "no-public-mutable-getter",
                    narrative: `${file}:${node.loc.start.line} declares getter '${node.key.name || "?"}' that returns the internal '_*' field directly in ${ctx}. Callers can mutate the returned reference — invariants the class maintains are bypassed.`,
                    graph: {
                        X: `${file}:${node.loc.start.line} — getter returns internal mutable reference`,
                        Y: `the encapsulation seal is broken; class invariants depend on no-one mutating the internal collection`,
                        Z: `Expose Operations, Not Containers — return a readonly view or an iterator, never the raw mutable`,
                        W: `subtle bugs when callers .push / .delete on what they think is "a copy"; tests pass because tests don't mutate; production code does`,
                    },
                    remediation: `Return a defensive copy: \`return [...this._x]\` for arrays, \`new Map(this._x)\` for Maps, \`new Set(this._x)\` for Sets. Better: return a Readonly type / Iterator: \`return this._x[Symbol.iterator]()\`. Or expose explicit accessors: \`get(key)\`, \`list()\` that return single values.`,
                    trace: t,
                }) } });
            },
        };
    },
};
