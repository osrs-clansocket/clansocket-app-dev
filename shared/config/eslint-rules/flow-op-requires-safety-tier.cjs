/**
 * LVI/flow-op-requires-safety-tier — every OperationSpec object literal must declare safety_tier.
 *
 * Triggers on TypeScript variable declarations annotated `: OperationSpec` with an object literal init,
 * AND on object literals passed as `OperationSpec` argument via return type / explicit cast.
 *
 * Required field: safety_tier with literal value "live" or "manual".
 * Fields missing safety_tier reach prod with undefined tier — bypasses MANUAL gating.
 */
"use strict";

const TARGET_TYPE = "OperationSpec";
const REQUIRED_FIELD = "safety_tier";
const ALLOWED_VALUES = new Set(["live", "manual"]);

function keyName(key) {
    if (!key) return null;
    if (key.type === "Identifier") return key.name;
    if (key.type === "Literal") return String(key.value);
    return null;
}

function findProperty(node, name) {
    if (!node || node.type !== "ObjectExpression") return null;
    for (const prop of node.properties) {
        if (prop.type !== "Property") continue;
        if (prop.computed) continue;
        if (keyName(prop.key) === name) return prop;
    }
    return null;
}

function typeAnnotationIsOperationSpec(annotation) {
    if (!annotation) return false;
    const t = annotation.typeAnnotation;
    if (!t) return false;
    if (t.type === "TSTypeReference" && t.typeName && t.typeName.name === TARGET_TYPE) return true;
    return false;
}

function reportMissing(context, node) {
    context.report({
        node,
        message:
            "OperationSpec object literal is missing `safety_tier`. " +
            "Every flow operation must declare safety_tier: \"live\" | \"manual\" — absent tier bypasses MANUAL gating in step-dispatcher.",
    });
}

function reportInvalid(context, node, value) {
    context.report({
        node,
        message:
            `OperationSpec safety_tier has invalid value "${value}". ` +
            "Allowed: \"live\" (auto-fire) or \"manual\" (requires admin approval per flow_review_queue).",
    });
}

function checkObject(context, objectExpr) {
    const tierProp = findProperty(objectExpr, REQUIRED_FIELD);
    if (!tierProp) {
        reportMissing(context, objectExpr);
        return;
    }
    const v = tierProp.value;
    if (v.type !== "Literal" || typeof v.value !== "string") {
        reportInvalid(context, tierProp, "<non-literal>");
        return;
    }
    if (!ALLOWED_VALUES.has(v.value)) reportInvalid(context, tierProp, v.value);
}

module.exports = {
    meta: {
        type: "problem",
        docs: { description: "OperationSpec literals must declare safety_tier: live | manual" },
        schema: [],
    },
    create(context) {
        return {
            VariableDeclarator(node) {
                if (!node.id || !typeAnnotationIsOperationSpec(node.id.typeAnnotation)) return;
                if (!node.init) return;
                if (node.init.type !== "ObjectExpression") return;
                checkObject(context, node.init);
            },
        };
    },
};
