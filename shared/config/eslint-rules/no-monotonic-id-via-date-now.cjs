/**
 * LVI/no-monotonic-id-via-date-now — Using Date.now() / Date.now().toString() as an ID.
 * Collision risk: two concurrent calls within the same ms produce the same ID.
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

const ID_HINT_RE = /[Ii]d$|Identifier$|Key$|Hash$|Token$|Slug$/;

function isDateNow(node) {
    if (node.type !== "CallExpression") return false;
    if (node.callee.type !== "MemberExpression") return false;
    if (node.callee.object.type !== "Identifier" || node.callee.object.name !== "Date") return false;
    if (node.callee.property.type !== "Identifier" || node.callee.property.name !== "now") return false;
    return true;
}

function isDateNowToString(node) {
    if (node.type !== "CallExpression") return false;
    if (node.callee.type !== "MemberExpression") return false;
    if (node.callee.property.type !== "Identifier" || node.callee.property.name !== "toString") return false;
    return isDateNow(node.callee.object);
}

module.exports = {
    meta: { type: "problem", docs: { description: "Date.now() used as an ID" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        return {
            VariableDeclarator(node) {
                if (node.id.type !== "Identifier" || !ID_HINT_RE.test(node.id.name)) return;
                if (!node.init) return;
                if (!isDateNow(node.init) && !isDateNowToString(node.init)) return;
                const t = trace(node, raw, mod);
                const ctx = getContext(node);
                context.report({ node, messageId: "report", data: { report: build4DReport({
                    rule: "no-monotonic-id-via-date-now",
                    narrative: `${file}:${node.loc.start.line} uses Date.now() as the value for '${node.id.name}' in ${ctx}. Date.now() returns milliseconds — two concurrent requests within the same ms produce the same ID. Under load this WILL collide.`,
                    graph: {
                        X: `${file}:${node.loc.start.line} — Date.now() assigned to '${node.id.name}'`,
                        Y: `under N concurrent calls, collision probability scales with 1/(ms window); for hot endpoints the window is sub-ms`,
                        Z: `IDs Must Be Unique — uniqueness should not depend on temporal spacing`,
                        W: `dedup tables get violated; race-y replacements; mysterious "this row updated itself" bugs during peak load`,
                    },
                    remediation: `Use randomUUID() from node:crypto: \`import { randomUUID } from "node:crypto"; const ${node.id.name} = randomUUID();\`. If you need a time-sortable ID, use ULID/KSUID. Date.now() is fine for timestamps; never for identity.`,
                    trace: t,
                }) } });
            },
        };
    },
};
