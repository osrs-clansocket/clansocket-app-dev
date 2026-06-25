import type { Instance } from "../../../../../../factory";
import {
    setGuildDescription,
    setGuildName,
    type DiscordGuildSettings,
} from "../../../../../../../state/discord/client.js";
import { editText, imagePreview } from "../../../../../../discord/inspector/builders/section-builder.js";

export function identityFields(s: DiscordGuildSettings, uid: string): Instance[] {
    return [
        editText("Server name", s.name, (next) => {
            if (next.length === 0 || next === s.name) return;
            void setGuildName(s.guild_id, { userId: uid, beforeName: s.name, name: next });
        }),
        editText("Description", s.description ?? "", (next) => {
            const v = next.length > 0 ? next : null;
            void setGuildDescription(s.guild_id, {
                userId: uid,
                guildName: s.name,
                beforeDescription: s.description,
                description: v,
            });
        }),
        imagePreview("Icon URL", s.icon_url),
        imagePreview("Banner URL", s.banner_url),
    ];
}
