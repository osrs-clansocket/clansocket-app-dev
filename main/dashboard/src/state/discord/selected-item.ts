import { signal } from "../../dom/factory/reactive/index.js";
import type {
    DiscordChannel,
    DiscordChannelOverwrite,
    DiscordMember,
    DiscordRole,
    DiscordServerEmoji,
    DiscordServerSticker,
    DiscordWebhook,
} from "./client.js";

export type DiscordInspectionTarget =
    | { kind: "channel"; data: DiscordChannel }
    | { kind: "role"; data: DiscordRole }
    | { kind: "member"; data: DiscordMember }
    | { kind: "webhook"; data: DiscordWebhook }
    | { kind: "server-emoji"; data: DiscordServerEmoji }
    | { kind: "server-sticker"; data: DiscordServerSticker }
    | { kind: "channel-overwrite"; data: DiscordChannelOverwrite };

export const selectedDiscordItem = signal<DiscordInspectionTarget | null>(null);

export function clearSelected(): void {
    selectedDiscordItem.set(null);
}
