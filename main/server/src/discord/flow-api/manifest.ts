import "./manifest-triggers.js";
import "./manifest-messages.js";
import "./manifest-send.js";
import "./manifest-members.js";
import "./manifest-channels.js";
import "./manifest-roles.js";
import "./manifest-webhooks.js";
import "./manifest-guild-settings.js";
import { buildCapabilityFromRegistries } from "../../flows/registries/capability-builder.js";
import type { CapabilityManifest } from "../../flows/registries/registry-types.js";

export const manifest: CapabilityManifest = buildCapabilityFromRegistries({
    name: "discord",
    version: "0.4.0",
    capability_color: "blurple",
});
