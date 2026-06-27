import type {
    CapabilityManifest,
    JSONSchema,
    OperationContext,
    OperationResult,
    OperationSpec,
    TriggerSpec,
} from "../../flows/registries/registry-types.js";
import { STANDARD_TELEMETRY_EVENTS } from "../handlers/telemetry/standard-telemetry.js";
import { pushChatboxToClan, pushChatboxToMember } from "../handlers/flow-push.js";

const CAPABILITY_NAME = "plugin";
const CAPABILITY_COLOR = "amber";
const PLUGIN_CHAT_TRIGGER = "clan_chat";

const PERMISSIVE_PAYLOAD: JSONSchema = {
    type: "object",
    additionalProperties: true,
};

function payload(properties: Readonly<Record<string, JSONSchema>>): JSONSchema {
    return { type: "object", additionalProperties: true, properties };
}

const PLUGIN_PAYLOAD_SCHEMAS: Readonly<Record<string, JSONSchema>> = {
    xp_gained: payload({
        rsn: { type: "string" },
        skill: { type: "string" },
        xp_total: { type: "integer" },
        delta_xp: { type: "integer" },
    }),
    level_up: payload({
        rsn: { type: "string" },
        skill: { type: "string" },
        level: { type: "integer" },
        prior_level: { type: "integer" },
        xp_total: { type: "integer" },
    }),
    death: payload({
        rsn: { type: "string" },
        cause_name: { type: "string" },
        cause_category: { type: "string" },
        cause_kind: { type: "string" },
        region_name: { type: "string" },
        area: { type: "string" },
        value_lost: { type: "integer" },
        in_wilderness: { type: "boolean" },
    }),
    loot: payload({
        rsn: { type: "string" },
        cause_name: { type: "string" },
        cause_kind: { type: "string" },
        item_name: { type: "string" },
        item_id: { type: "integer" },
        quantity: { type: "integer" },
        value: { type: "integer" },
        region_name: { type: "string" },
    }),
    pet_drop: payload({
        rsn: { type: "string" },
        pet_item_name: { type: "string" },
        trigger: { type: "string" },
        source_name: { type: "string" },
        source_kind: { type: "string" },
        region_name: { type: "string" },
    }),
    slayer: payload({
        rsn: { type: "string" },
        target_name: { type: "string" },
        master_name: { type: "string" },
        boss_name: { type: "string" },
        area_name: { type: "string" },
        count: { type: "integer" },
        count_original: { type: "integer" },
    }),
    quest_completed: payload({
        rsn: { type: "string" },
        quest_name: { type: "string" },
        state: { type: "string" },
    }),
    diary_completed: payload({
        rsn: { type: "string" },
        diary_region: { type: "string" },
        diary_name: { type: "string" },
        tier: { type: "string" },
    }),
    clue_completed: payload({
        rsn: { type: "string" },
        tier: { type: "string" },
        total: { type: "integer" },
    }),
    collection_log_entry: payload({
        rsn: { type: "string" },
        item_name: { type: "string" },
        category: { type: "string" },
        slots_filled: { type: "integer" },
        slots_total: { type: "integer" },
    }),
    combat_achievement_completed: payload({
        rsn: { type: "string" },
        task_name: { type: "string" },
        boss_name: { type: "string" },
        task_type: { type: "string" },
        tier: { type: "string" },
        points: { type: "integer" },
    }),
    farming_patch: payload({
        rsn: { type: "string" },
        patch_region_name: { type: "string" },
        crop_name: { type: "string" },
        state: { type: "string" },
    }),
    clan_chat: payload({
        rsn: { type: "string" },
        rank: { type: "string" },
        account_type: { type: "string" },
        message: { type: "string" },
    }),
    world_hop: payload({
        rsn: { type: "string" },
        world: { type: "integer" },
        region_name: { type: "string" },
    }),
};

const CHAT_RESULT_SCHEMA: JSONSchema = {
    type: "object",
    properties: { recipientCount: { type: "integer" } },
};

const CHATBOX_CLAN_INPUT: JSONSchema = {
    type: "object",
    required: ["message"],
    additionalProperties: false,
    properties: {
        message: { type: "string", minLength: 1, maxLength: 200 },
        color: { type: "string", maxLength: 6 },
    },
};

const CHATBOX_MEMBER_INPUT: JSONSchema = {
    type: "object",
    required: ["rsn", "message"],
    additionalProperties: false,
    properties: {
        rsn: { type: "string", format: "rsn", minLength: 1, maxLength: 12 },
        message: { type: "string", minLength: 1, maxLength: 200 },
        color: { type: "string", maxLength: 6 },
    },
};

function readString(input: Readonly<Record<string, unknown>>, key: string, required: boolean): string {
    const v = input[key];
    if (typeof v === "string") return v;
    if (required) throw new Error(`plugin operation: missing required string "${key}"`);
    return "";
}

function readOptionalString(input: Readonly<Record<string, unknown>>, key: string): string | undefined {
    const v = input[key];
    return typeof v === "string" ? v : undefined;
}

async function chatboxClanHandler(
    input: Readonly<Record<string, unknown>>,
    ctx: OperationContext,
): Promise<OperationResult> {
    const out = pushChatboxToClan({
        clanId: ctx.clanId,
        message: readString(input, "message", true),
        color: readOptionalString(input, "color"),
    });
    return { result_class: "delivered", outputs: { recipientCount: out.recipientCount } };
}

async function chatboxMemberHandler(
    input: Readonly<Record<string, unknown>>,
    ctx: OperationContext,
): Promise<OperationResult> {
    const out = pushChatboxToMember({
        clanId: ctx.clanId,
        rsn: readString(input, "rsn", true),
        message: readString(input, "message", true),
        color: readOptionalString(input, "color"),
    });
    if (out.recipientCount === 0) return { result_class: "no_recipient", outputs: { recipientCount: 0 } };
    return { result_class: "delivered", outputs: { recipientCount: out.recipientCount } };
}

const chatboxClanOp: OperationSpec = {
    safety_tier: "live",
    input_schema: CHATBOX_CLAN_INPUT,
    output_schema: CHAT_RESULT_SCHEMA,
    side_effects: { writes_audit: false },
    validation: {},
    result_classes: ["delivered"],
    handler: chatboxClanHandler,
};

const chatboxMemberOp: OperationSpec = {
    safety_tier: "live",
    input_schema: CHATBOX_MEMBER_INPUT,
    output_schema: CHAT_RESULT_SCHEMA,
    side_effects: { writes_audit: false },
    validation: {},
    result_classes: ["delivered", "no_recipient"],
    handler: chatboxMemberHandler,
};

function trigger(eventName: string): TriggerSpec {
    return {
        event_source: `plugin.telemetry.${eventName}`,
        payload_schema: PLUGIN_PAYLOAD_SCHEMAS[eventName] ?? PERMISSIVE_PAYLOAD,
        triggerable: true,
    };
}

function buildTriggers(): Readonly<Record<string, TriggerSpec>> {
    const out: Record<string, TriggerSpec> = {};
    for (const eventName of STANDARD_TELEMETRY_EVENTS) out[eventName] = trigger(eventName);
    out[PLUGIN_CHAT_TRIGGER] = trigger(PLUGIN_CHAT_TRIGGER);
    return out;
}

export const manifest: CapabilityManifest = {
    name: CAPABILITY_NAME,
    version: "0.2.0",
    capability_color: CAPABILITY_COLOR,
    operations: {
        "plugin:chatbox.clan": chatboxClanOp,
        "plugin:chatbox.member": chatboxMemberOp,
    },
    triggers: buildTriggers(),
    data_sources: {},
};
