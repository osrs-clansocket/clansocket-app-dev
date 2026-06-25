/**
 * Bedrock AST shapes — JavaScript-atomic patterns with no shared truth to centralize.
 * Used by both no-duplication (in-file) and no-cross-file-duplication to skip false-positive
 * groupings of canonical language idioms.
 *
 * Each predicate matches a single, narrow shape. Anything outside the shape still flags.
 */

// Same 8-element set used by no-cross-file-duplication.cjs (TYPEOF_TYPES). Duplicated here to
// keep this helper standalone; the literal "u" entry in that file is a hash-normalizer artifact
// for `undefined` strings — not a valid typeof tag for our predicate.
const TYPEOF_PRIMITIVES = new Set(["string", "number", "boolean", "object", "function", "undefined", "symbol", "bigint"]);

const BEDROCK_BARE_CALLS = new Set([
    "String", "Number", "Boolean",
    "encodeURIComponent", "decodeURIComponent",
    "randomUUID", "randomBytes",
]);

const BEDROCK_MEMBER_CALLS = new Map([
    ["Array",  new Set(["isArray"])],
    ["Number", new Set(["isFinite", "isInteger", "isNaN", "isSafeInteger", "parseInt", "parseFloat"])],
    ["Object", new Set(["keys", "values", "entries", "hasOwn", "freeze", "fromEntries", "assign", "getPrototypeOf"])],
    ["JSON",   new Set(["parse", "stringify"])],
    ["Math",   new Set(["floor", "ceil", "round", "min", "max", "abs", "sign", "sqrt", "pow", "trunc"])],
    ["Date",   new Set(["now", "parse"])],
]);

const BEDROCK_STRING_METHODS = new Set(["toLowerCase", "toUpperCase", "trim", "toString", "trimStart", "trimEnd"]);

// Primitive `typeof X === "string"|"number"|...` checks.
function isPrimitiveTypeofCompare(node) {
    if (!node || node.type !== "BinaryExpression") return false;
    if (node.operator !== "===" && node.operator !== "!==") return false;
    const sides = [
        { side: node.left, other: node.right },
        { side: node.right, other: node.left },
    ];
    for (const { side, other } of sides) {
        if (side && side.type === "UnaryExpression" && side.operator === "typeof") {
            if (other && other.type === "Literal" && typeof other.value === "string" && TYPEOF_PRIMITIVES.has(other.value)) {
                return true;
            }
        }
    }
    return false;
}

// Length cardinality: `X.length === 0 | !== 0 | > 0 | >= 1 | ...` against literal 0 or 1.
function isLengthCardinality(node) {
    if (!node || node.type !== "BinaryExpression") return false;
    if (!["===", "!==", ">", ">=", "<", "<="].includes(node.operator)) return false;
    const sides = [
        { mem: node.left, lit: node.right },
        { mem: node.right, lit: node.left },
    ];
    for (const { mem, lit } of sides) {
        if (!mem || mem.type !== "MemberExpression") continue;
        if (!mem.property || mem.property.type !== "Identifier" || mem.property.name !== "length") continue;
        if (!lit || lit.type !== "Literal" || typeof lit.value !== "number") continue;
        if (lit.value === 0 || lit.value === 1) return true;
    }
    return false;
}

// Atomic JS global calls: Array.isArray, Number.isFinite, Object.keys, JSON.parse, Math.floor,
// String(x), randomUUID() etc. Domain-specific failure handling (try/catch around JSON.parse)
// IS legitimate to centralize — but the CALL itself is bedrock.
function isAtomicGlobalCall(node) {
    if (!node || node.type !== "CallExpression") return false;
    const c = node.callee;
    if (!c) return false;
    if (c.type === "Identifier") return BEDROCK_BARE_CALLS.has(c.name);
    if (c.type === "MemberExpression" && c.object && c.object.type === "Identifier" && c.property && c.property.type === "Identifier") {
        const methods = BEDROCK_MEMBER_CALLS.get(c.object.name);
        return !!(methods && methods.has(c.property.name));
    }
    return false;
}

// `parseInt(X, 10)` / `Number.parseInt(X, 10)` — decimal radix is universal. Non-decimal radix
// (16/2/8) is semantic and should stay flagged.
function isDecimalParseInt(node) {
    if (!node || node.type !== "CallExpression") return false;
    const c = node.callee;
    if (!c) return false;
    const isBare = c.type === "Identifier" && c.name === "parseInt";
    const isMember = c.type === "MemberExpression" && c.object && c.object.name === "Number" && c.property && c.property.name === "parseInt";
    if (!isBare && !isMember) return false;
    const radix = node.arguments[1];
    return !!(radix && radix.type === "Literal" && radix.value === 10);
}

// Argless atomic string methods on any receiver.
function isAtomicStringMethod(node) {
    if (!node || node.type !== "CallExpression") return false;
    if (node.arguments.length !== 0) return false;
    const c = node.callee;
    if (!c || c.type !== "MemberExpression" || !c.property || c.property.type !== "Identifier") return false;
    return BEDROCK_STRING_METHODS.has(c.property.name);
}

// Composite: any expression whose top-level shape is bedrock. Handles `!bedrock(...)` so
// `if (!Array.isArray(x))` and `if (Number.isFinite(n))` are skipped from condition-hash
// grouping consistently.
function isBedrockExpression(node) {
    if (!node) return false;
    if (isLengthCardinality(node)) return true;
    if (isAtomicGlobalCall(node)) return true;
    if (isAtomicStringMethod(node)) return true;
    if (isDecimalParseInt(node)) return true;
    if (isPrimitiveTypeofCompare(node)) return true;
    if (node.type === "UnaryExpression" && node.operator === "!") return isBedrockExpression(node.argument);
    return false;
}

// ObjectExpression carve-out: option-bag passed as first OR second arg to identifier-callee.
// Covers `button({onClick, text})`, `recordClanAudit(clanId, {actor, action, payload, targetId})`,
// `register(name, {handler})` — every consumer of a centralized factory/registry has the same
// call-shape by design. The 2nd-arg form catches the common scope-then-options pattern.
function isOptionBagOfFactoryCall(objectNode) {
    if (!objectNode || objectNode.type !== "ObjectExpression") return false;
    const parent = objectNode.parent;
    if (!parent || parent.type !== "CallExpression") return false;
    if (!parent.callee || parent.callee.type !== "Identifier") return false;
    return parent.arguments[0] === objectNode || parent.arguments[1] === objectNode;
}

// Module-scope named constant: `const NAME = N` at the top level of a file (optionally exported).
// When a literal value appears as the init of a module-scope const declarator, it has ALREADY
// been named — the consumer refers to the const by name, not the literal. Collisions of the same
// literal value across unrelated named constants (e.g., `const PLUGIN_RL_AUTHED_PER_SEC = 200`
// in one file, `const HTTP_OK = 200` in another) are coincidental, not duplicated truth.
// Inline literals (`setTimeout(fn, 100)`, `parts.slice(0, 10)`) ARE still flagged — those are
// real magic-number signals that should be named.
function isNamedModuleConstant(literalNode) {
    const parent = literalNode.parent;
    if (!parent || parent.type !== "VariableDeclarator") return false;
    if (parent.init !== literalNode) return false;
    if (!parent.id || parent.id.type !== "Identifier") return false;
    const decl = parent.parent;
    if (!decl || decl.type !== "VariableDeclaration") return false;
    if (decl.kind !== "const") return false;
    const declParent = decl.parent;
    if (!declParent) return false;
    if (declParent.type === "Program") return true;
    if (declParent.type === "ExportNamedDeclaration" && declParent.parent && declParent.parent.type === "Program") return true;
    return false;
}

// Single-level instance-method option bag: `emitter.emit({opts})`, `registry.add({opts})`,
// `eventBus.publish({opts})`. The {opts} bag is the method's typed API contract; identical
// keyset across consumers is by design. Distinct from `isOptionBagOfFactoryCall` because
// the callee is MemberExpression(Identifier.method) not Identifier. Does NOT match chained
// calls like `db.prepare(sql).run({bindings})` — the chain's `db.prepare(sql)` is a
// CallExpression, so its `.run` parent's object is a CallExpression, not an Identifier.
function isInstanceMethodOptionBag(objectNode) {
    if (!objectNode || objectNode.type !== "ObjectExpression") return false;
    const parent = objectNode.parent;
    if (!parent || parent.type !== "CallExpression") return false;
    const callee = parent.callee;
    if (!callee || callee.type !== "MemberExpression") return false;
    if (!callee.object || callee.object.type !== "Identifier") return false;
    if (!callee.property || callee.property.type !== "Identifier") return false;
    return parent.arguments[0] === objectNode || parent.arguments[1] === objectNode;
}

module.exports = {
    isPrimitiveTypeofCompare,
    isLengthCardinality,
    isAtomicGlobalCall,
    isDecimalParseInt,
    isAtomicStringMethod,
    isBedrockExpression,
    isOptionBagOfFactoryCall,
    isInstanceMethodOptionBag,
    isNamedModuleConstant,
    TYPEOF_PRIMITIVES,
};
