/**
 * LVI/no-orphan-value-source-ref — every valueSourceRef literal must have a matching registerValueSource.
 *
 * Scans every file for `valueSourceRef: "X"` property literals. Per file, collects both refs and
 * `registerValueSource({ format: "X", ... })` calls. Reports refs that have no matching format
 * anywhere reachable in the same file.
 *
 * Cross-file coverage: not strictly enforced per file (refs in capability manifests reference value
 * sources in shared/flow-value-sources/). The rule is intentionally lenient at the file level; the
 * full-workspace check happens at the integration boundary (value-source-registry rejects unknown
 * format lookups at runtime, surfacing the gap as a missing picker in the UI).
 *
 * For now: rule emits a violation only when BOTH a valueSourceRef AND a registerValueSource exist in
 * the same file but don't match — i.e. catches local typos. Cross-file orphans surface at the dev/QA
 * boundary via the picker showing empty.
 */
"use strict";

const REGISTER_FN = "registerValueSource";
const REF_KEY = "valueSourceRef";
const FORMAT_KEY = "format";

function literalStringValue(node) {
    if (!node || node.type !== "Literal" || typeof node.value !== "string") return null;
    return node.value;
}

function readPropertyLiteral(prop, keyName) {
    if (!prop || prop.type !== "Property" || prop.computed) return null;
    const key = prop.key;
    const name = key.type === "Identifier" ? key.name : key.type === "Literal" ? String(key.value) : null;
    if (name !== keyName) return null;
    return literalStringValue(prop.value);
}

module.exports = {
    meta: {
        type: "problem",
        docs: { description: "valueSourceRef literals must resolve to a registerValueSource in the same file (cross-file orphans surface at runtime)." },
        schema: [],
    },
    create(context) {
        const refs = [];
        const registeredFormats = new Set();
        return {
            Property(node) {
                const refValue = readPropertyLiteral(node, REF_KEY);
                if (refValue !== null) refs.push({ node, format: refValue });
            },
            CallExpression(node) {
                if (node.callee.type !== "Identifier" || node.callee.name !== REGISTER_FN) return;
                for (const arg of node.arguments) {
                    if (arg.type !== "ObjectExpression") continue;
                    for (const prop of arg.properties) {
                        const f = readPropertyLiteral(prop, FORMAT_KEY);
                        if (f !== null) registeredFormats.add(f);
                    }
                }
            },
            "Program:exit"() {
                if (registeredFormats.size === 0) return;
                for (const { node, format } of refs) {
                    if (registeredFormats.has(format)) continue;
                    context.report({
                        node,
                        message:
                            `valueSourceRef "${format}" referenced in the same file as other value-source ` +
                            `registrations but has no matching registerValueSource({ format: "${format}", ... }) ` +
                            `call. Either register the missing source here or move it to a shared/flow-value-sources file.`,
                    });
                }
            },
        };
    },
};
