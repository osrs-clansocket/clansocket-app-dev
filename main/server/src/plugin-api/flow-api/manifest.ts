import type { CapabilityManifest, JSONSchema, TriggerSpec } from "../../flows/registries/registry-types.js";
import { STANDARD_TELEMETRY_EVENTS } from "../handlers/telemetry/standard-telemetry.js";

const CAPABILITY_NAME = "plugin";
const CAPABILITY_COLOR = "amber";

// Plugin push operations (broadcastClan, broadcastMember) entangle config-push + chatbox-message and
// are admin-triggered, not flow-callable. Standalone flow-targeted push handlers (chat to single rsn,
// chat to clan) are greenfield and out of scope this round. Triggers below cover the 34 telemetry
// event types the auto-hook dispatcher already routes.

const PLUGIN_CHAT_TRIGGER = "clan_chat";

const PERMISSIVE_PAYLOAD: JSONSchema = {
    type: "object",
    additionalProperties: true,
};

function trigger(eventName: string): TriggerSpec {
    return {
        event_source: `plugin.telemetry.${eventName}`,
        payload_schema: PERMISSIVE_PAYLOAD,
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
    version: "0.1.0",
    capability_color: CAPABILITY_COLOR,
    operations: {},
    triggers: buildTriggers(),
    data_sources: {},
};
