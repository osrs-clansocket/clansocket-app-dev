import type { Instance } from "../../../../factory";
import type { DiscordChannel } from "../../../../../state/discord/client.js";
import { editText, buildReadonlySection } from "../../builders/section-builder.js";
import { saveChannelPatch } from "./channel-section-save.js";

const TYPE_LABELS: Record<number, string> = {
    0: "text",
    2: "voice",
    4: "category",
    5: "announcement",
    10: "announcement thread",
    11: "public thread",
    12: "private thread",
    13: "stage",
    15: "forum",
    16: "media",
};
const TYPE_UNKNOWN = "?";

const THREAD_CHANNEL_TYPES: ReadonlySet<number> = new Set([10, 11, 12]);

export function isThreadChannel(type: number): boolean {
    return THREAD_CHANNEL_TYPES.has(type);
}

function readonlyRow(title: string, value: string): Instance {
    return buildReadonlySection({ title, value });
}

export function baseSections(channel: DiscordChannel): Instance[] {
    return [
        editText("Name", channel.name ?? "", (next) => void saveChannelPatch(channel, { name: next })),
        readonlyRow("ID", channel.channel_id),
        readonlyRow("Type", TYPE_LABELS[channel.type] ?? TYPE_UNKNOWN),
        readonlyRow("Position", String(channel.position ?? 0)),
    ];
}
