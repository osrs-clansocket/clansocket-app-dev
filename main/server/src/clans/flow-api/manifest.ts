import "./manifest-record-event.js";
import "./manifest-set-tag.js";
import { buildCapabilityFromRegistries } from "../../flows/registries/capability-builder.js";
import type { CapabilityManifest } from "../../flows/registries/registry-types.js";

export const manifest: CapabilityManifest = buildCapabilityFromRegistries({
    name: "clans",
    version: "0.3.0",
    capability_color: "indigo",
});
