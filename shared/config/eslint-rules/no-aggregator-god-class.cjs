/**
 * LVI/no-aggregator-god-class — detects "god-class aggregator" pattern that should be self-registration.
 *
 * Deterministic signature (all 3 conditions required):
 *   1. File imports >=3 named/default identifiers from sibling files (same dir or descendants)
 *   2. Each imported sibling identifier appears EXACTLY ONCE as the first arg of the same call expression
 *      where the callee (receiver + method) is stable across the >=3 invocations
 *   3. The receiver is locally declared in this file (proving the file's sole job is to feed the registry)
 *
 * When this fires, the leaf files should self-register via a registry module + auto-loader,
 * eliminating the god-class import block + repeated registration calls.
 */
const path = require("node:path");
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

const MIN_CHILDREN = 3;

function isSiblingPath(spec) {
    if (!spec.startsWith("./") && !spec.startsWith("../")) return false;
    // siblings = same dir or descendants → no "../" at all
    return !spec.includes("../");
}

function callSignature(node) {
    if (node.callee.type !== "MemberExpression") return null;
    const obj = node.callee.object;
    const prop = node.callee.property;
    if (prop.type !== "Identifier") return null;
    if (obj.type === "Identifier") return `${obj.name}.${prop.name}`;
    return null;
}

function siblingArgIdent(node, siblingImports) {
    const matches = [];
    for (const a of node.arguments) {
        if (a.type !== "Identifier") continue;
        if (siblingImports.has(a.name)) matches.push(a.name);
    }
    if (matches.length !== 1) return null;
    return matches[0];
}

module.exports = {
    meta: {
        type: "problem",
        docs: { description: "Detect aggregator god-class pattern that should use self-registration instead" },
        schema: [],
        messages: { report: "{{ report }}" },
    },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        if (!raw.endsWith(".ts") && !raw.endsWith(".tsx")) return {};
        // Skip the rule infra itself
        if (raw.includes("/eslint-rules/")) return {};

        const siblingImports = new Map(); // local name → spec
        const localBindings = new Set(); // identifiers declared locally (var/let/const)
        const callsBySig = new Map(); // signature → [{ node, ident }]

        function record(node) {
            const sig = callSignature(node);
            if (!sig) return;
            const ident = siblingArgIdent(node, siblingImports);
            if (!ident) return;
            const receiver = sig.split(".")[0];
            if (!localBindings.has(receiver)) return;
            if (!callsBySig.has(sig)) callsBySig.set(sig, []);
            callsBySig.get(sig).push({ node, ident });
        }

        return {
            ImportDeclaration(node) {
                const spec = node.source.value;
                if (typeof spec !== "string") return;
                if (!isSiblingPath(spec)) return;
                for (const s of node.specifiers) {
                    siblingImports.set(s.local.name, spec);
                }
            },
            VariableDeclarator(node) {
                if (node.id && node.id.type === "Identifier") {
                    localBindings.add(node.id.name);
                }
            },
            FunctionDeclaration(node) {
                if (node.id) localBindings.add(node.id.name);
            },
            CallExpression(node) {
                record(node);
            },
            "Program:exit"() {
                for (const [sig, calls] of callsBySig) {
                    if (calls.length < MIN_CHILDREN) continue;
                    // Each ident must be unique (no double-registration)
                    const seen = new Set();
                    let unique = true;
                    for (const c of calls) {
                        if (seen.has(c.ident)) {
                            unique = false;
                            break;
                        }
                        seen.add(c.ident);
                    }
                    if (!unique) continue;
                    const firstNode = calls[0].node;
                    const lastNode = calls[calls.length - 1].node;
                    const file = shortFile(raw);
                    const mod = getModuleForFile(raw);
                    const ctx = getContext(firstNode);
                    const t = trace(firstNode, raw, mod);
                    const childList = calls.map((c) => `'${c.ident}'`).join(", ");
                    context.report({
                        node: firstNode,
                        messageId: "report",
                        data: {
                            report: build4DReport({
                                rule: "no-aggregator-god-class",
                                narrative: `${file} aggregates ${calls.length} sibling-imported identifiers via repeated '${sig}(...)' calls (lines ${firstNode.loc.start.line}-${lastNode.loc.start.line}). This is the god-class registration pattern: every new child requires editing this file. Self-registration eliminates the coupling — each leaf file registers itself at module load; this file becomes a fast-glob auto-loader + accessor.`,
                                graph: {
                                    X: `${file} statically imports ${calls.length} siblings just to feed '${sig}': ${childList}`,
                                    Y: `every new sibling file requires editing this file → coupling grows linearly with leaf count`,
                                    Z: `Open-Closed Principle + Locality of Behavior — registration should live where the behavior lives, not in a central manifest`,
                                    W: `cross-team merge conflicts on this file; missed registrations on new leaves; file-limits/folder-limits violations as the import block grows`,
                                },
                                remediation: `Replace with self-registration: (1) extract '${sig.split(".")[0]}' to a sibling '_registry.ts' that exports a factory (e.g. \`mountedRouter()\`); (2) each leaf calls the factory at module load; (3) add a '_loader.ts' that uses fast-glob + dynamic import to auto-discover leaves; (4) this file becomes ~7 lines: import the loader for side effects + iterate the registry. See discord/routes/{_mount-registry,_route-loader,index}.ts for the canonical pattern.`,
                                trace: t,
                            }),
                        },
                    });
                }
            },
        };
    },
};
