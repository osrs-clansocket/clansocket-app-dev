import type { Instance } from "../../../../../../factory";
import { setGuildAfk, setSystemChannel, type DiscordGuildSettings } from "../../../../../../../state/discord/client.js";
import {
    editEnum,
    editTextChannel,
    editVoiceChannel,
} from "../../../../../../discord/inspector/builders/section-builder.js";
import {
    AFK_TIMEOUT_OPTIONS,
    parseNum,
} from "../../../../../../../state/discord/guild-settings/mode-fields-options.js";

const EMPTY_AFK_TIMEOUT = 0;

function changeAfkChannel(s: DiscordGuildSettings, uid: string, next: string | null): void {
    void setGuildAfk(s.guild_id, {
        userId: uid,
        guildName: s.name,
        beforeAfkChannelId: s.afk_channel_id,
        afkChannelId: next,
        beforeAfkTimeout: s.afk_timeout,
        afkTimeout: s.afk_timeout,
    });
}

function changeAfkTimeout(s: DiscordGuildSettings, uid: string, next: string): void {
    void setGuildAfk(s.guild_id, {
        userId: uid,
        guildName: s.name,
        beforeAfkChannelId: s.afk_channel_id,
        afkChannelId: s.afk_channel_id,
        beforeAfkTimeout: s.afk_timeout,
        afkTimeout: parseNum(next),
    });
}

function systemChannelField(s: DiscordGuildSettings, uid: string): Instance {
    return editTextChannel({
        title: "System channel",
        guildId: s.guild_id,
        currentChannelId: s.system_channel_id,
        onSave: (next) => {
            if (next === s.system_channel_id) return;
            void setSystemChannel(s.guild_id, {
                userId: uid,
                guildName: s.name,
                beforeChannelId: s.system_channel_id,
                channelId: next,
            });
        },
    });
}

export function structureFields(s: DiscordGuildSettings, uid: string): Instance[] {
    return [
        systemChannelField(s, uid),
        editVoiceChannel({
            title: "AFK channel",
            guildId: s.guild_id,
            currentChannelId: s.afk_channel_id,
            onSave: (next) => changeAfkChannel(s, uid, next),
        }),
        editEnum("AFK timeout", AFK_TIMEOUT_OPTIONS, String(s.afk_timeout ?? EMPTY_AFK_TIMEOUT), (next) =>
            changeAfkTimeout(s, uid, next),
        ),
    ];
}
