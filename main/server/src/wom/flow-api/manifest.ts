import type { CapabilityManifest } from "../../flows/registries/registry-types.js";

const CAPABILITY_NAME = "wom";
const CAPABILITY_COLOR = "leaf";

// WOM exposes read SDK handlers (group-details/hiscores/gained/name-changes, player-snapshot) at
// `wom/dispatcher/sdk-handlers.ts`. They are queue-driven; the flow engine's current handler shape
// expects synchronous `OperationResult` returns. Wrapping queue-driven reads as fire-and-forget
// ops yields a queueId not the data; that is not useful to a flow author who wants the resolved
// hiscore values. Round-1 surface is therefore the capability shell only; ops register once a
// read-with-result substrate lands.

export const manifest: CapabilityManifest = {
    name: CAPABILITY_NAME,
    version: "0.1.0",
    capability_color: CAPABILITY_COLOR,
    operations: {},
    triggers: {},
    data_sources: {},
};
