/**
 * LVI/flow-excluded-op-rejected — manifest operations must not include any op_id listed in EXCLUDED.md.
 *
 * EXCLUDED.md at main/server/src/flows/EXCLUDED.md holds the roster of ops considered + rejected for
 * the flow engine (admin-only, credential, recursive, infrastructure). This rule parses the table and
 * fails the lint if any manifest's operations: { "<op_id>": ... } object literal key matches.
 *
 * The rule reads EXCLUDED.md once at module load. Promotion of an EXCLUDED op to LIVE/MANUAL requires
 * removing the row from EXCLUDED.md first (forcing explicit acknowledgement that the rejection
 * rationale is no longer applicable).
 */
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const EXCLUDED_PATH = path.resolve(__dirname, "..", "..", "..", "main", "server", "src", "flows", "EXCLUDED.md");
const TABLE_ROW_PREFIX = "|";
const TABLE_SEPARATOR_PATTERN = "---";
const COLUMN_OP_ID = 1;

function readExcludedSet() {
    const set = new Set();
    let text;
    try {
        text = fs.readFileSync(EXCLUDED_PATH, "utf-8");
    } catch {
        return set;
    }
    for (const rawLine of text.split("\n")) {
        const line = rawLine.trim();
        if (!line.startsWith(TABLE_ROW_PREFIX)) continue;
        if (line.includes(TABLE_SEPARATOR_PATTERN)) continue;
        const cells = line.split("|").map((c) => c.trim());
        if (cells.length < 3) continue;
        const opId = cells[COLUMN_OP_ID + 1];
        if (!opId || opId.length === 0) continue;
        if (opId === "op_id") continue;
        set.add(opId);
    }
    return set;
}

const EXCLUDED_OPS = readExcludedSet();

function keyName(key) {
    if (!key) return null;
    if (key.type === "Identifier") return key.name;
    if (key.type === "Literal") return String(key.value);
    return null;
}

function isManifestOperationsProperty(prop) {
    if (!prop || prop.type !== "Property") return false;
    if (prop.computed) return false;
    return keyName(prop.key) === "operations";
}

function checkOperationsObject(context, node) {
    if (!node || node.type !== "ObjectExpression") return;
    for (const prop of node.properties) {
        if (prop.type !== "Property") continue;
        if (prop.computed) continue;
        const opId = keyName(prop.key);
        if (!opId) continue;
        if (EXCLUDED_OPS.has(opId)) {
            context.report({
                node: prop,
                message:
                    `Operation "${opId}" is in flows/EXCLUDED.md. ` +
                    "Adding to a manifest contradicts the rejection rationale. " +
                    "Remove the row from EXCLUDED.md first if promoting to LIVE/MANUAL.",
            });
        }
    }
}

module.exports = {
    meta: {
        type: "problem",
        docs: { description: "Manifest operations must not include op_ids listed in flows/EXCLUDED.md" },
        schema: [],
    },
    create(context) {
        if (EXCLUDED_OPS.size === 0) return {};
        return {
            ObjectExpression(node) {
                for (const prop of node.properties) {
                    if (!isManifestOperationsProperty(prop)) continue;
                    if (prop.value.type !== "ObjectExpression") continue;
                    checkOperationsObject(context, prop.value);
                }
            },
        };
    },
};
