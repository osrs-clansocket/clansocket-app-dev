import type { SelectOption } from "../../../../../../../forms/glass/inputs/select/index.js";
import type { Instance } from "../../../../../../../factory";
import type { DiscordChannel } from "../../../../../../../../state/discord/client.js";

export const CATEGORY_TYPE = 4;
export const TEXT_CHANNEL_TYPE = 0;
const ANNOUNCEMENT_CHANNEL_TYPE = 5;
const TYPE_STAGE = 13;
const TYPE_FORUM = 15;
const TYPE_MEDIA = 16;
const COMMUNITY_GATED_TYPES: ReadonlySet<number> = new Set([
    ANNOUNCEMENT_CHANNEL_TYPE,
    TYPE_STAGE,
    TYPE_FORUM,
    TYPE_MEDIA,
]);
const WEBHOOK_CAPABLE_TYPES: ReadonlySet<number> = new Set([TEXT_CHANNEL_TYPE, ANNOUNCEMENT_CHANNEL_TYPE]);
const FEATURE_COMMUNITY = "COMMUNITY";

export const KIND_CHANNEL = "channel";
export const KIND_WEBHOOK = "webhook";
export const KIND_FIELD_NAME = "create_kind";
export const KIND_OPTIONS: ReadonlyArray<SelectOption> = [
    { value: KIND_CHANNEL, label: "Channel" },
    { value: KIND_WEBHOOK, label: "Webhook" },
];

export const DEFAULT_TYPE = "0";
export const DEFAULT_CHANNEL_NAME = "new-channel";
export const DEFAULT_WEBHOOK_NAME = "new webhook";
export const TRIGGER_LABEL = "+ Create";
export const SUBMIT_LABEL = "Create";
const NO_PARENT_LABEL = "(no category)";
export const NO_PARENT_VALUE = "";
const HIDDEN_INPUT_SELECTOR = "input[type='hidden']";
export const TYPE_FIELD_NAME = "channel_type";
export const PARENT_FIELD_NAME = "channel_parent";
export const CHANNEL_NAME_FIELD_NAME = "channel_name";
export const WEBHOOK_CHANNEL_FIELD_NAME = "webhook_channel";
export const JOINT_CHECK_FIELD_NAME = "joint_webhook";
export const JOINT_CHECK_LABEL = "Also create a webhook on this channel";
export const JOINT_WEBHOOK_NAME_LABEL = "Webhook name";
const UNNAMED_FALLBACK = "(unnamed)";
export const NO_WEBHOOK_CAPABLE_TEXT =
    "No webhook-capable channels yet. Switch to Channel and create a Text or Announcement channel first.";

export const JOINT_WAIT_TIMEOUT_MS = 5000;
export const JOINT_POLL_INTERVAL_MS = 200;

const CHANNEL_TYPE_OPTIONS: ReadonlyArray<SelectOption> = [
    { value: "0", label: "Text" },
    { value: "2", label: "Voice" },
    { value: "4", label: "Category" },
    { value: "5", label: "Announcement" },
    { value: "13", label: "Stage" },
    { value: "15", label: "Forum" },
    { value: "16", label: "Media" },
];

export interface ToolbarOpts {
    guildId: string;
    getChannels: () => readonly DiscordChannel[];
    features: readonly string[];
}

export function isWebhookCapable(channelType: number): boolean {
    return WEBHOOK_CAPABLE_TYPES.has(channelType);
}

export function typeOptionsFor(features: readonly string[]): SelectOption[] {
    const isCommunity = features.includes(FEATURE_COMMUNITY);
    if (isCommunity) return [...CHANNEL_TYPE_OPTIONS];
    return CHANNEL_TYPE_OPTIONS.filter((o) => !COMMUNITY_GATED_TYPES.has(Number(o.value)));
}

export function parentOptionsFrom(categories: readonly DiscordChannel[]): SelectOption[] {
    const out: SelectOption[] = [{ value: NO_PARENT_VALUE, label: NO_PARENT_LABEL }];
    for (const cat of categories) out.push({ value: cat.channel_id, label: cat.name ?? UNNAMED_FALLBACK });
    return out;
}

export function optionsFrom(channels: readonly DiscordChannel[]): SelectOption[] {
    return channels
        .filter((c) => isWebhookCapable(c.type))
        .map((c) => ({
            value: c.channel_id,
            label: c.name ?? UNNAMED_FALLBACK,
        }));
}

export function readSelectValue(selectInst: Instance): string {
    const hidden = selectInst.el.querySelector<HTMLInputElement>(HIDDEN_INPUT_SELECTOR);
    return hidden?.value ?? "";
}
