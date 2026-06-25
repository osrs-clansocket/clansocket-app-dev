const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport } = require("./report-builder.cjs");
const { hashNode, hashNodeWithValues, getObjKeys } = require("./duplication-hash.cjs");
const ALLOWLIST = require("./no-cross-file-duplication.allowlist.cjs");
const EXCLUSIONS = require("./no-cross-file-duplication.exclusions.cjs");
const { collectCentralizedNames, containsCentralizedRef } = require("./dup-shared-roots.cjs");
const {
    isPrimitiveTypeofCompare,
    isBedrockExpression,
    isOptionBagOfFactoryCall,
    isInstanceMethodOptionBag,
    isNamedModuleConstant,
} = require("./bedrock-shapes.cjs");

function isExcludedFile(normPath) {
    for (const entry of EXCLUSIONS) {
        if (normPath.endsWith(entry.path)) return true;
    }
    return false;
}

const THRESHOLDS = {
    literal: 5,
    structural: 2,
    logical: 2,
    data: 2,
    behavioral: 2,
    validation: 2,
    temporal: 2,
};

const MIN_LITERAL_STRING_LEN = 8;
const MIN_FUNC_HASH_LEN = 15;
const MIN_COND_HASH_LEN = 5;
const MIN_OBJ_KEYS = 3;

const TYPEOF_TYPES = new Set(["string", "number", "boolean", "object", "function", "undefined", "symbol", "bigint", "u"]);
const TRIVIAL_NUMBERS = new Set([-1, 0, 1, 2]);
const TRIVIAL_STRINGS = new Set([", ", " | ", "/", ".", ":", "-", "_", " ", "\n", "\t", "?", "*", "(", ")"]);

const STATE = {
    literals: new Map(),
    funcs: new Map(),
    conditions: new Map(),
    shapes: new Map(),
    handlers: new Map(),
    validations: new Map(),
    timers: new Map(),
};

function bucket(map, key, entry) {
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(entry);
}

function distinctFiles(group) {
    const set = new Set();
    for (const e of group) set.add(e.file);
    return set.size;
}

// Self-registration mandate carve-out (CLAUDE.md "## Self-registration mandate").
// `registerX(literal-key, ..., {handler, ...})` calls at module scope are REQUIRED to share
// the same option-bag shape by contract — that's the registry's interface, not duplication.
// Without this guard the structural / data visitors flag every self-registering leaf as a dup.
function isRegistrationCalleeName(name) {
    // Matches `register` (bare method, e.g. `messageRegistry.register(...)`) and
    // `registerX` (free function, e.g. `registerPublisher(...)`).
    return /^register([A-Z]|$)/.test(name);
}

function calleeRegistrationName(callee) {
    if (!callee) return null;
    if (callee.type === "Identifier") return callee.name;
    // `<x>Registry.register(...)` — instance-method registration (e.g. messageRegistry.register).
    if (callee.type === "MemberExpression" && callee.property.type === "Identifier") return callee.property.name;
    return null;
}

function isOptionBagOfRegistrationCall(objectExpr) {
    if (!objectExpr || objectExpr.type !== "ObjectExpression") return false;
    const parent = objectExpr.parent;
    if (!parent || parent.type !== "CallExpression") return false;
    const name = calleeRegistrationName(parent.callee);
    if (!name || !isRegistrationCalleeName(name)) return false;
    return parent.arguments.includes(objectExpr);
}

function isFunctionInRegistrationOptionBag(fnNode) {
    const property = fnNode.parent;
    if (!property || property.type !== "Property") return false;
    return isOptionBagOfRegistrationCall(property.parent);
}

// Thin wrapper around a helper — mirror of no-duplication's carve-out. Multiple thin wrappers
// around the same helper are the DRY-compressed form, not duplication.
function isThinHelperCalleeCross(callee) {
    if (!callee) return false;
    if (callee.type === "Identifier") return true;
    if (callee.type === "MemberExpression") {
        // `this.X(...)` — instance-method delegate.
        if (callee.object.type === "ThisExpression") return true;
        // `singletonInst.X(...)` — singleton-method delegate. Wrapper binds args to the
        // singleton's API; independent files delegating to the same singleton centralize
        // through it, not duplicate.
        if (callee.object.type === "Identifier") return true;
    }
    return false;
}

function isThinHelperWrapperCross(body) {
    if (!body) return false;
    if (body.type === "CallExpression") return isThinHelperCalleeCross(body.callee);
    if (body.type === "BlockStatement" && body.body.length === 1) {
        const only = body.body[0];
        if (only.type === "ReturnStatement" && only.argument && only.argument.type === "CallExpression") {
            return isThinHelperCalleeCross(only.argument.callee);
        }
        if (only.type === "ExpressionStatement" && only.expression.type === "CallExpression") {
            return isThinHelperCalleeCross(only.expression.callee);
        }
    }
    return false;
}

// Trivial nullability guard — mirror of no-duplication's carve-out. See that rule for rationale.
function isTrivialGuard(test) {
    if (!test) return false;
    if (isBedrockExpression(test)) return true;
    if (test.type === "UnaryExpression" && test.operator === "!") {
        const a = test.argument;
        if (!a) return false;
        if (a.type === "Identifier" || a.type === "MemberExpression" || a.type === "CallExpression" || a.type === "AwaitExpression") return true;
    }
    if (test.type === "BinaryExpression" && (test.operator === "===" || test.operator === "!==")) {
        const sides = [test.left, test.right];
        const hasNullish = sides.some((s) =>
            (s && s.type === "Literal" && s.value === null)
            || (s && s.type === "Identifier" && s.name === "undefined")
        );
        if (hasNullish) return true;
    }
    if (test.type === "Identifier") return true;
    if (test.type === "MemberExpression") return true; // `if (this.x)` / `if (cfg.flag)` — bare member guard
    return false;
}

module.exports = {
    meta: {
        type: "problem",
        docs: { description: "Detect cross-file duplication within module boundaries" },
        schema: [],
        messages: { dup: "{{ report }}" },
    },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        if (!raw.includes("/src/")) return {};
        if (isExcludedFile(raw)) return {};
        const mod = getModuleForFile(raw);
        if (!mod) return {};
        const file = raw.split("/src/").pop() || raw;
        let centralizedNames = new Set();

        function reportCross(type, group, narrative, fix) {
            context.report({
                node: group[group.length - 1].node,
                messageId: "dup",
                data: {
                    report: build4DReport({
                        rule: `no-cross-file-duplication/${type}`,
                        narrative,
                        graph: {
                            X: `${file} — ${type} duplicate of ${distinctFiles(group) - 1} other file(s)`,
                            Y: `${group.length} call sites across ${distinctFiles(group)} files share the same value/shape`,
                            Z: `no_separation (EliminateDuplicationViaSharing) — cross-file duplication type: ${type}`,
                            W: `every duplicate is a divergence risk — one site changes, the rest drift`,
                        },
                        remediation: fix,
                        trace: { file, line: String(group[group.length - 1].node.loc.start.line), col: "0", context: "module", module: mod, related: group.slice(0, -1).map(e => e.file) },
                    }),
                },
            });
        }

        return {
            Program(node) {
                centralizedNames = collectCentralizedNames(node, raw);
            },
            Literal(node) {
                if (node.parent && node.parent.type === "ImportDeclaration") return;
                if (node.regex) return;
                if (typeof node.value === "boolean") return;
                if (node.value === null) return;
                if (typeof node.value === "string") {
                    if (node.value.length < MIN_LITERAL_STRING_LEN) return;
                    if (TYPEOF_TYPES.has(node.value)) return;
                    if (TRIVIAL_STRINGS.has(node.value)) return;
                }
                if (typeof node.value === "number" && TRIVIAL_NUMBERS.has(node.value)) return;
                // Module-scope named constant: `const NAME = value` at top level. Consumers refer
                // to the const by name; collisions of the same literal across unrelated named
                // constants are coincidental. Inline literals (magic numbers in call sites) ARE
                // still flagged — those are the real DRY signal.
                if (isNamedModuleConstant(node)) return;
                const key = `${mod}::${typeof node.value === "bigint" ? `${node.value.toString()}n` : JSON.stringify(node.value)}`;
                bucket(STATE.literals, key, { file, node });
            },
            "FunctionDeclaration, FunctionExpression, ArrowFunctionExpression"(node) {
                if (!node.body) return;
                if (isFunctionInRegistrationOptionBag(node)) return;
                if (isThinHelperWrapperCross(node.body)) return;
                const hash = hashNode(node.body, 0);
                if (hash.length < MIN_FUNC_HASH_LEN) return;
                const key = `${mod}::${hash}`;
                bucket(STATE.funcs, key, { file, node });
            },
            IfStatement(node) {
                if (isTrivialGuard(node.test)) return;
                if (containsCentralizedRef(node.test, centralizedNames)) return;
                const hash = hashNode(node.test, 0);
                if (hash.length < MIN_COND_HASH_LEN) return;
                const key = `${mod}::${hash}`;
                bucket(STATE.conditions, key, { file, node });
            },
            ObjectExpression(node) {
                if (!node.properties || node.properties.length < MIN_OBJ_KEYS) return;
                // Architectural necessity: option-bag passed as first OR second arg to a helper-
                // style call (e.g. `button({onClick, text, variant})`, `div({classes}, [...])`,
                // `glassConfirm({title, message, ...})`, `recordClanAudit(clanId, {actor, action,
                // payload, targetId})`, `register(name, {handler})`). Every consumer of a
                // centralized factory has the same call-shape by design — that IS DRY working.
                // The 2nd-arg form covers the common scope-then-options pattern where the first
                // argument is a positional context (id, name, route) and the second is the
                // option bag forming the actual contract.
                if (isOptionBagOfFactoryCall(node)) return;
                if (isOptionBagOfRegistrationCall(node)) return;
                // Instance-method option bag: `emitter.emit({opts})`, `registry.add({opts})`.
                // The {opts} bag IS the method's typed API contract — keyset alone is shared by
                // design across all consumers, so the standard keyset-only hash falsely groups
                // them. Degrade to value-aware hashing: variant-content sites get unique hashes
                // and don't group (API contract working as intended), but exact copy-paste of
                // the same call with identical values still groups and flags as real duplication.
                if (isInstanceMethodOptionBag(node)) {
                    const valueHash = hashNodeWithValues(node, 0);
                    bucket(STATE.shapes, `${mod}::valueHash:${valueHash}`, { file, node });
                    return;
                }
                const keys = getObjKeys(node);
                if (keys.length < MIN_OBJ_KEYS) return;
                const key = `${mod}::${keys.join(",")}`;
                bucket(STATE.shapes, key, { file, node });
            },
            "CallExpression[callee.property.name='addEventListener']"(node) {
                const eventArg = node.arguments[0];
                const handlerArg = node.arguments[1];
                if (!eventArg || !handlerArg) return;
                if (containsCentralizedRef(handlerArg, centralizedNames)) return;
                const event = eventArg.type === "Literal" ? String(eventArg.value) : "dynamic";
                const hash = `${event}:${hashNode(handlerArg, 0)}`;
                const key = `${mod}::${hash}`;
                bucket(STATE.handlers, key, { file, node });
            },
            "BinaryExpression[operator='==='], BinaryExpression[operator='!==']"(node) {
                if (node.left.type !== "UnaryExpression" || node.left.operator !== "typeof") return;
                if (isPrimitiveTypeofCompare(node)) return;
                if (containsCentralizedRef(node.left.argument, centralizedNames)) return;
                const hash = hashNode(node, 0);
                const key = `${mod}::${hash}`;
                bucket(STATE.validations, key, { file, node });
            },
            "CallExpression[callee.name='setTimeout'], CallExpression[callee.name='setInterval']"(node) {
                if (!node.arguments[1]) return;
                const hash = `${node.callee.name}:${hashNode(node.arguments[0], 0)}`;
                const key = `${mod}::${hash}`;
                bucket(STATE.timers, key, { file, node });
            },
            "Program:exit"() {
                emit("literal", STATE.literals, THRESHOLDS.literal, file, mod, reportCross);
                emit("structural", STATE.funcs, THRESHOLDS.structural, file, mod, reportCross);
                emit("logical", STATE.conditions, THRESHOLDS.logical, file, mod, reportCross);
                emit("data", STATE.shapes, THRESHOLDS.data, file, mod, reportCross);
                emit("behavioral", STATE.handlers, THRESHOLDS.behavioral, file, mod, reportCross);
                emit("validation", STATE.validations, THRESHOLDS.validation, file, mod, reportCross);
                emit("temporal", STATE.timers, THRESHOLDS.temporal, file, mod, reportCross);
            },
        };
    },
};

function emit(type, map, threshold, currentFile, mod, reportCross) {
    const allowed = ALLOWLIST[type] || {};
    const modPrefix = `${mod}::`;
    for (const [key, group] of map) {
        if (group.length < threshold) continue;
        if (distinctFiles(group) < 2) continue;
        const myEntries = group.filter(e => e.file === currentFile);
        if (myEntries.length === 0) continue;
        const fingerprint = key.startsWith(modPrefix) ? key.slice(modPrefix.length) : key;
        if (Object.prototype.hasOwnProperty.call(allowed, fingerprint)) continue;
        const otherFiles = [...new Set(group.filter(e => e.file !== currentFile).map(e => e.file))];
        const narrative = `Cross-file ${type} duplication. This file participates in a group of ${group.length} occurrences across ${distinctFiles(group)} files. Same value/shape appears in: ${otherFiles.slice(0, 5).join(", ")}${otherFiles.length > 5 ? ` (+${otherFiles.length - 5} more)` : ""}.`;
        const fix = `Extract to a shared *-constants.ts / *-messages.ts / helper module. All files in the group must import from one source of truth.\n\nAllowlist key: ${type}:${fingerprint}\n(paste into shared/config/eslint-rules/no-cross-file-duplication.allowlist.cjs under "${type}" with a one-line reason to silence)`;
        reportCross(type, myEntries, narrative, fix);
    }
}
