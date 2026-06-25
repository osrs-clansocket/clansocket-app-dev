import type { Instance } from "../../../../../factory";
import { inspectorOverride$ } from "../../../../../../state/discord/inspector-override.js";
import { selectedEmojiName } from "../../../../../../state/discord/selected-emoji.js";
import { selectedDiscordItem } from "../../../../../../state/discord/selected-item.js";
import { channelOverwriteSections } from "../../../../../discord/inspector/composers/entities/overwrite-composer.js";
import { channelSections } from "../../../../../discord/inspector/composers/sections/channel-section-composer.js";
import { memberSections } from "../../../../../discord/inspector/composers/sections/member-section-composer.js";
import { roleSections } from "../../../../../discord/inspector/composers/sections/role-section-composer.js";
import { serverEmojiSections } from "../../../../../discord/inspector/composers/entities/emoji-composer.js";
import { serverStickerSections } from "../../../../../discord/inspector/composers/entities/sticker-composer.js";
import { webhookSections } from "../../../../../discord/inspector/composers/sections/webhook-section-composer.js";
import { emojiSections } from "./rail-emoji.js";
import type { SelectedItem } from "../../../../../../state/discord/frame/rail-right-item.js";

type SectionBuilders = {
    [K in SelectedItem["kind"]]: (data: Extract<SelectedItem, { kind: K }>["data"]) => Instance[];
};

const SECTION_BUILDERS: SectionBuilders = {
    channel: channelSections,
    role: roleSections,
    member: memberSections,
    webhook: webhookSections,
    "server-emoji": serverEmojiSections,
    "server-sticker": serverStickerSections,
    "channel-overwrite": channelOverwriteSections,
};

function sectionsForItem(item: SelectedItem): Instance[] {
    return (SECTION_BUILDERS[item.kind] as (data: SelectedItem["data"]) => Instance[])(item.data);
}

export function currentSections(): Instance[] {
    const overrideFactory = inspectorOverride$();
    if (overrideFactory !== null) return overrideFactory();
    const item = selectedDiscordItem();
    if (item) return sectionsForItem(item);
    if (selectedEmojiName() !== null) return emojiSections();
    return [];
}
