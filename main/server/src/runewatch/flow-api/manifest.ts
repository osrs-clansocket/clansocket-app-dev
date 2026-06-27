import type { CapabilityManifest, JSONSchema, TriggerSpec } from "../../flows/registries/registry-types.js";
import { TRIGGER_RUNEWATCH_HARD_ADDED } from "../flow-emit/emit-hard-added.js";
import { TRIGGER_RUNEWATCH_HARD_CLEARED } from "../flow-emit/emit-hard-cleared.js";
import { TRIGGER_RUNEWATCH_SOFT_ADDED } from "../flow-emit/emit-soft-added.js";
import { TRIGGER_RUNEWATCH_SOFT_CLEARED } from "../flow-emit/emit-soft-cleared.js";

const CAPABILITY_NAME = "runewatch";
const CAPABILITY_COLOR = "ember";

const HARD_ADDED_PAYLOAD: JSONSchema = {
    type: "object",
    required: ["clanId", "rsn", "hash", "reason", "evidence_rating", "source", "published_at"],
    properties: {
        clanId: { type: "string" },
        rsn: { type: "string" },
        hash: { type: "string" },
        reason: { type: "string" },
        evidence_rating: { type: "integer" },
        source: { type: "string" },
        published_at: { type: "integer" },
    },
};

const HARD_CLEARED_PAYLOAD: JSONSchema = {
    type: "object",
    required: ["clanId", "rsn", "hash"],
    properties: {
        clanId: { type: "string" },
        rsn: { type: "string" },
        hash: { type: "string" },
    },
};

const SOFT_ADDED_PAYLOAD: JSONSchema = {
    type: "object",
    required: ["clanId", "rsn", "reason", "source"],
    properties: {
        clanId: { type: "string" },
        rsn: { type: "string" },
        reason: { type: "string" },
        source: { type: "string" },
    },
};

const SOFT_CLEARED_PAYLOAD: JSONSchema = {
    type: "object",
    required: ["clanId", "rsn", "source"],
    properties: {
        clanId: { type: "string" },
        rsn: { type: "string" },
        source: { type: "string" },
    },
};

function trigger(eventSource: string, payloadSchema: JSONSchema): TriggerSpec {
    return {
        event_source: eventSource,
        payload_schema: payloadSchema,
        triggerable: true,
    };
}

export const manifest: CapabilityManifest = {
    name: CAPABILITY_NAME,
    version: "0.1.0",
    capability_color: CAPABILITY_COLOR,
    operations: {},
    triggers: {
        [TRIGGER_RUNEWATCH_HARD_ADDED]: trigger("runewatch.emit.hard-added", HARD_ADDED_PAYLOAD),
        [TRIGGER_RUNEWATCH_HARD_CLEARED]: trigger("runewatch.emit.hard-cleared", HARD_CLEARED_PAYLOAD),
        [TRIGGER_RUNEWATCH_SOFT_ADDED]: trigger("runewatch.emit.soft-added", SOFT_ADDED_PAYLOAD),
        [TRIGGER_RUNEWATCH_SOFT_CLEARED]: trigger("runewatch.emit.soft-cleared", SOFT_CLEARED_PAYLOAD),
    },
    data_sources: {},
};
