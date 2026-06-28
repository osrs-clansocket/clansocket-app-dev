import { registerTrigger } from "../../flows/registries/trigger-registry.js";
import { buildCapabilityFromRegistries } from "../../flows/registries/capability-builder.js";
import { TRIGGER_RUNEWATCH_HARD_ADDED } from "../flow-emit/emit-hard-added.js";
import { TRIGGER_RUNEWATCH_HARD_CLEARED } from "../flow-emit/emit-hard-cleared.js";
import { TRIGGER_RUNEWATCH_SOFT_ADDED } from "../flow-emit/emit-soft-added.js";
import { TRIGGER_RUNEWATCH_SOFT_CLEARED } from "../flow-emit/emit-soft-cleared.js";
import type { CapabilityManifest } from "../../flows/registries/registry-types.js";

const CAPABILITY_NAME = "runewatch";

registerTrigger({
    capability: CAPABILITY_NAME,
    triggerId: TRIGGER_RUNEWATCH_HARD_ADDED,
    eventSource: "runewatch.emit.hard-added",
    routing: "synthetic",
    payloadFields: [
        { name: "clanId", type: "string", required: true },
        { name: "rsn", type: "rsn", valueSourceRef: "rsn", required: true },
        { name: "hash", type: "string", required: true },
        { name: "reason", type: "string", required: true },
        { name: "evidence_rating", type: "integer", required: true },
        { name: "source", type: "string", required: true },
        { name: "published_at", type: "timestamp", required: true },
    ],
});

registerTrigger({
    capability: CAPABILITY_NAME,
    triggerId: TRIGGER_RUNEWATCH_HARD_CLEARED,
    eventSource: "runewatch.emit.hard-cleared",
    routing: "synthetic",
    payloadFields: [
        { name: "clanId", type: "string", required: true },
        { name: "rsn", type: "rsn", valueSourceRef: "rsn", required: true },
        { name: "hash", type: "string", required: true },
    ],
});

registerTrigger({
    capability: CAPABILITY_NAME,
    triggerId: TRIGGER_RUNEWATCH_SOFT_ADDED,
    eventSource: "runewatch.emit.soft-added",
    routing: "synthetic",
    payloadFields: [
        { name: "clanId", type: "string", required: true },
        { name: "rsn", type: "rsn", valueSourceRef: "rsn", required: true },
        { name: "reason", type: "string", required: true },
        { name: "source", type: "string", required: true },
    ],
});

registerTrigger({
    capability: CAPABILITY_NAME,
    triggerId: TRIGGER_RUNEWATCH_SOFT_CLEARED,
    eventSource: "runewatch.emit.soft-cleared",
    routing: "synthetic",
    payloadFields: [
        { name: "clanId", type: "string", required: true },
        { name: "rsn", type: "rsn", valueSourceRef: "rsn", required: true },
        { name: "source", type: "string", required: true },
    ],
});

export const manifest: CapabilityManifest = buildCapabilityFromRegistries({
    name: CAPABILITY_NAME,
    version: "0.2.0",
    capability_color: "ember",
});
