import { getClanDb } from "../../database/index.js";
import type {
    JSONSchema,
    OperationContext,
    OperationResult,
    OperationSpec,
} from "../../flows/registries/registry-types.js";

const SET_MEMBER_TAG_INPUT: JSONSchema = {
    type: "object",
    required: ["rsn", "tag_key"],
    additionalProperties: false,
    properties: {
        rsn: { type: "string", format: "rsn", minLength: 1, maxLength: 12 },
        tag_key: { type: "string", minLength: 1, maxLength: 64 },
        tag_value: { type: "string", maxLength: 512 },
    },
};

const SET_MEMBER_TAG_OUTPUT: JSONSchema = {
    type: "object",
    properties: { rsn: { type: "string" }, tag_key: { type: "string" } },
};

const UPSERT_TAG_SQL = `INSERT INTO clan_member_tags (rsn, tag_key, tag_value, set_at, set_by_flow_id)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT (rsn, tag_key) DO UPDATE SET tag_value = excluded.tag_value, set_at = excluded.set_at, set_by_flow_id = excluded.set_by_flow_id`;

function readString(input: Readonly<Record<string, unknown>>, key: string, required: boolean): string {
    const v = input[key];
    if (typeof v === "string") return v;
    if (required) throw new Error(`clans:set-member-tag missing required string "${key}"`);
    return "";
}

async function setMemberTagHandler(
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

export const setMemberTagOp: OperationSpec = {
    safety_tier: "live",
    input_schema: SET_MEMBER_TAG_INPUT,
    output_schema: SET_MEMBER_TAG_OUTPUT,
    side_effects: { writes_audit: true },
    validation: {},
    result_classes: ["set", "error"],
    handler: setMemberTagHandler,
};
