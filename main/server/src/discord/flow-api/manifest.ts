import type { CapabilityManifest } from "../../flows/registries/registry-types.js";
import { CAPABILITY_COLOR, CAPABILITY_NAME } from "./manifest-shared.js";
import { MESSAGE_OPS } from "./manifest-messages.js";
import { SEND_OPS } from "./manifest-send.js";
import { MEMBER_OPS } from "./manifest-members.js";
import { CHANNEL_STRUCTURAL_OPS } from "./manifest-channels.js";
import { ROLE_OPS } from "./manifest-roles.js";
import { WEBHOOK_OPS } from "./manifest-webhooks.js";
import { GUILD_SETTINGS_OPS } from "./manifest-guild-settings.js";
import { TRIGGERS } from "./manifest-triggers.js";
import { DATA_SOURCES } from "./manifest-data-sources.js";

export const manifest: CapabilityManifest = {
    name: CAPABILITY_NAME,
    version: "0.2.0",
    capability_color: CAPABILITY_COLOR,
    operations: {
        ...MESSAGE_OPS,
        ...SEND_OPS,
        ...MEMBER_OPS,
        ...CHANNEL_STRUCTURAL_OPS,
        ...ROLE_OPS,
        ...WEBHOOK_OPS,
        ...GUILD_SETTINGS_OPS,
    },
    triggers: TRIGGERS,
    data_sources: DATA_SOURCES,
};
