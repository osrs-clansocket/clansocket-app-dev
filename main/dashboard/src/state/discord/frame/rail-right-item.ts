import { selectedDiscordItem } from "../selected-item.js";

export type SelectedItem = NonNullable<ReturnType<typeof selectedDiscordItem>>;

export function itemKey(item: SelectedItem): string {
    if (item.kind === "channel") return `channel:${item.data.channel_id}`;
    if (item.kind === "role") return `role:${item.data.role_id}`;
    if (item.kind === "member") return `member:${item.data.user_id}`;
    if (item.kind === "webhook") return `webhook:${item.data.webhook_id}`;
    if (item.kind === "server-emoji") return `server-emoji:${item.data.emoji_id}`;
    if (item.kind === "server-sticker") return `server-sticker:${item.data.sticker_id}`;
    const o = item.data;
    const tid = o.kind === "role" ? o.role_id : o.user_id;
    return `channel-overwrite:${o.channel_id}:${tid}`;
}
