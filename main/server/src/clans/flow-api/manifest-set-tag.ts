import { getClanDb } from "../../database/index.js";
import { registerOperation } from "../../flows/registries/operation-registry.js";
import type { OperationContext, OperationResult } from "../../flows/registries/registry-types.js";
import { SET_TAG_RESULT_CLASSES } from "./result-classes.js";

const UPSERT_TAG_SQL = `INSERT INTO clan_member_tags (rsn, tag_key, tag_value, set_at, set_by_flow_id)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT (rsn, tag_key) DO UPDATE SET tag_value = excluded.tag_value, set_at = excluded.set_at, set_by_flow_id = excluded.set_by_flow_id`;

function readString(input: Readonly<Record<string, unknown>>, key: string, required: boolean): string {
    const v = input[key];
    if (typeof v === "string") return v;
    if (required) throw new Error(`clans:set-member-tag missing required string "${key}"`);
    return "";
}

async function setMemberTag(
    input: Readonly<Record<string, unknown>>,
    ctx: OperationContext,
): Promise<OperationResult> {
    const rsn = readString(input, "rsn", true);
    const tagKey = readString(input, "tag_key", true);
    const tagValue = readString(input, "tag_value", false);
    try {
        getClanDb(ctx.clanId)
            .prepare(UPSERT_TAG_SQL)
            .run(rsn, tagKey, tagValue.length > 0 ? tagValue : null, Date.now(), ctx.flowId);
        return { result_class: "set", outputs: { rsn, tag_key: tagKey } };
    } catch (err) {
        return { result_class: "error", outputs: { error: (err as Error).message } };
    }
}

registerOperation({
    capability: "clans",
    opId: "clans:set-member-tag",
    safety_tier: "live",
    inputFields: [
        { name: "rsn", type: "rsn", valueSourceRef: "rsn", required: true, minLength: 1, maxLength: 12 },
        { name: "tag_key", type: "string", required: true, minLength: 1, maxLength: 64 },
        { name: "tag_value", type: "string", maxLength: 512 },
    ],
    outputFields: [
        { name: "rsn", type: "string" },
        { name: "tag_key", type: "string" },
    ],
    result_classes: SET_TAG_RESULT_CLASSES,
    side_effects: { writes_audit: true },
    validation: {},
    handler: setMemberTag,
});
