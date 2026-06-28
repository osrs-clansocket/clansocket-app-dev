/**
 * LVI/require-envelope-fields-not-redeclared — bans per-event `payloadFields` from re-declaring
 * universal envelope field names. Envelope is merged ONCE in capability-builder; per-event
 * redeclaration creates drift / shadowing.
 */
"use strict";

const ENVELOPE_FIELD_NAMES = new Set([
    "rsn",
    "account_hash",
    "accountHash",
    "session_id",
    "sessionId",
    "region_id",
    "regionId",
    "region_name",
    "regionName",
    "area",
    "world",
    "x",
    "y",
    "plane",
    "event_received_at",
    "eventReceivedAt",
    "plugin_version",
    "pluginVersion",
]);

const REGISTER_FN_NAMES = new Set(["registerPluginEvent"]);

function readStringProp(props, keyName) {
    for (const p of props) {
        if (!p || p.type !== "Property" || p.computed) continue;
        const k = p.key;
        const name = k.type === "Identifier" ? k.name : k.type === "Literal" ? String(k.value) : null;
        if (name !== keyName) continue;
        if (p.value.type !== "Literal" || typeof p.value.value !== "string") return null;
        return p.value.value;
    }
    return null;
}

function findArrayProp(props, keyName) {
    for (const p of props) {
        if (!p || p.type !== "Property" || p.computed) continue;
        const k = p.key;
        const name = k.type === "Identifier" ? k.name : k.type === "Literal" ? String(k.value) : null;
        if (name !== keyName) continue;
        if (p.value.type === "ArrayExpression") return p.value;
    }
    return null;
}

module.exports = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Plugin event payloadFields must not redeclare universal envelope field names.",
        },
        schema: [],
    },
    create(context) {
        return {
            CallExpression(node) {
                const callee = node.callee;
                const calleeName = callee.type === "Identifier" ? callee.name : null;
                if (!calleeName || !REGISTER_FN_NAMES.has(calleeName)) return;
                for (const arg of node.arguments) {
                    if (arg.type !== "ObjectExpression") continue;
                    const fieldsArr = findArrayProp(arg.properties, "payloadFields");
                    if (!fieldsArr) continue;
                    for (const el of fieldsArr.elements) {
                        if (!el || el.type !== "ObjectExpression") continue;
                        const fieldName = readStringProp(el.properties, "name");
                        if (fieldName === null) continue;
                        if (ENVELOPE_FIELD_NAMES.has(fieldName)) {
                            context.report({
                                node: el,
                                message:
                                    `Envelope field "${fieldName}" must not be redeclared in payloadFields. ` +
                                    `The envelope (rsn, account_hash, session_id, region_*, area, world, x/y/plane, event_received_at, plugin_version) ` +
                                    `is merged once in capability-builder. Remove this declaration.`,
                            });
                        }
                    }
                }
            },
        };
    },
};
