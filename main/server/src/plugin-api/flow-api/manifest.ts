import "./manifest-chatbox.js";
import { buildCapabilityFromRegistries } from "../../flows/registries/capability-builder.js";
import type { CapabilityManifest } from "../../flows/registries/registry-types.js";

export const manifest: CapabilityManifest = buildCapabilityFromRegistries({
    name: "plugin",
    version: "0.4.0",
    capability_color: "amber",
});
