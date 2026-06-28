export interface DiscordTriggerSpec {
    readonly triggerId: string;
    readonly listenerEvent: string;
    readonly gatewaySource: string;
    readonly payloadKind:
        | "channel"
        | "member"
        | "role"
        | "emoji"
        | "sticker"
        | "webhook"
        | "guild"
        | "message"
        | "reaction"
        | "thread"
        | "voice-state"
        | "ban"
        | "interaction"
        | "scheduled-event";
}

export const DISCORD_TRIGGER_MANIFEST: readonly DiscordTriggerSpec[] = [
    { triggerId: "discord:channels.created",        listenerEvent: "channelCreate",        gatewaySource: "discord.gateway.channelCreate",        payloadKind: "channel" },
    { triggerId: "discord:channels.updated",        listenerEvent: "channelUpdate",        gatewaySource: "discord.gateway.channelUpdate",        payloadKind: "channel" },
    { triggerId: "discord:channels.deleted",        listenerEvent: "channelDelete",        gatewaySource: "discord.gateway.channelDelete",        payloadKind: "channel" },
    { triggerId: "discord:members.joined",          listenerEvent: "guildMemberAdd",       gatewaySource: "discord.gateway.guildMemberAdd",       payloadKind: "member" },
    { triggerId: "discord:members.left",            listenerEvent: "guildMemberRemove",    gatewaySource: "discord.gateway.guildMemberRemove",    payloadKind: "member" },
    { triggerId: "discord:members.updated",         listenerEvent: "guildMemberUpdate",    gatewaySource: "discord.gateway.guildMemberUpdate",    payloadKind: "member" },
    { triggerId: "discord:roles.created",           listenerEvent: "roleCreate",           gatewaySource: "discord.gateway.guildRoleCreate",      payloadKind: "role" },
    { triggerId: "discord:roles.updated",           listenerEvent: "roleUpdate",           gatewaySource: "discord.gateway.guildRoleUpdate",      payloadKind: "role" },
    { triggerId: "discord:roles.deleted",           listenerEvent: "roleDelete",           gatewaySource: "discord.gateway.guildRoleDelete",      payloadKind: "role" },
    { triggerId: "discord:server-emojis.created",   listenerEvent: "emojiCreate",          gatewaySource: "discord.gateway.emojiCreate",          payloadKind: "emoji" },
    { triggerId: "discord:server-emojis.updated",   listenerEvent: "emojiUpdate",          gatewaySource: "discord.gateway.emojiUpdate",          payloadKind: "emoji" },
    { triggerId: "discord:server-emojis.deleted",   listenerEvent: "emojiDelete",          gatewaySource: "discord.gateway.emojiDelete",          payloadKind: "emoji" },
    { triggerId: "discord:server-stickers.created", listenerEvent: "stickerCreate",        gatewaySource: "discord.gateway.stickerCreate",        payloadKind: "sticker" },
    { triggerId: "discord:server-stickers.updated", listenerEvent: "stickerUpdate",        gatewaySource: "discord.gateway.stickerUpdate",        payloadKind: "sticker" },
    { triggerId: "discord:server-stickers.deleted", listenerEvent: "stickerDelete",        gatewaySource: "discord.gateway.stickerDelete",        payloadKind: "sticker" },
    { triggerId: "discord:webhooks.updated",        listenerEvent: "webhooksUpdate",       gatewaySource: "discord.gateway.webhooksUpdate",       payloadKind: "webhook" },
    { triggerId: "discord:guild.updated",           listenerEvent: "guildUpdate",          gatewaySource: "discord.gateway.guildUpdate",          payloadKind: "guild" },
    { triggerId: "discord:messages.created",        listenerEvent: "messageCreate",        gatewaySource: "discord.gateway.messageCreate",        payloadKind: "message" },
    { triggerId: "discord:messages.updated",        listenerEvent: "messageUpdate",        gatewaySource: "discord.gateway.messageUpdate",        payloadKind: "message" },
    { triggerId: "discord:messages.deleted",        listenerEvent: "messageDelete",        gatewaySource: "discord.gateway.messageDelete",        payloadKind: "message" },
    { triggerId: "discord:reactions.added",         listenerEvent: "messageReactionAdd",   gatewaySource: "discord.gateway.messageReactionAdd",   payloadKind: "reaction" },
    { triggerId: "discord:reactions.removed",       listenerEvent: "messageReactionRemove",gatewaySource: "discord.gateway.messageReactionRemove",payloadKind: "reaction" },
    { triggerId: "discord:threads.created",         listenerEvent: "threadCreate",         gatewaySource: "discord.gateway.threadCreate",         payloadKind: "thread" },
    { triggerId: "discord:threads.updated",         listenerEvent: "threadUpdate",         gatewaySource: "discord.gateway.threadUpdate",         payloadKind: "thread" },
    { triggerId: "discord:threads.deleted",         listenerEvent: "threadDelete",         gatewaySource: "discord.gateway.threadDelete",         payloadKind: "thread" },
    { triggerId: "discord:voice.state-updated",     listenerEvent: "voiceStateUpdate",     gatewaySource: "discord.gateway.voiceStateUpdate",     payloadKind: "voice-state" },
    { triggerId: "discord:bans.added",              listenerEvent: "guildBanAdd",          gatewaySource: "discord.gateway.guildBanAdd",          payloadKind: "ban" },
    { triggerId: "discord:bans.removed",            listenerEvent: "guildBanRemove",       gatewaySource: "discord.gateway.guildBanRemove",       payloadKind: "ban" },
    { triggerId: "discord:interactions.created",    listenerEvent: "interactionCreate",    gatewaySource: "discord.gateway.interactionCreate",    payloadKind: "interaction" },
    { triggerId: "discord:scheduled-events.created",listenerEvent: "guildScheduledEventCreate",gatewaySource: "discord.gateway.guildScheduledEventCreate",payloadKind: "scheduled-event" },
    { triggerId: "discord:scheduled-events.updated",listenerEvent: "guildScheduledEventUpdate",gatewaySource: "discord.gateway.guildScheduledEventUpdate",payloadKind: "scheduled-event" },
    { triggerId: "discord:scheduled-events.deleted",listenerEvent: "guildScheduledEventDelete",gatewaySource: "discord.gateway.guildScheduledEventDelete",payloadKind: "scheduled-event" },
];

export function discordTriggerByListenerEvent(listenerEvent: string): DiscordTriggerSpec | null {
    for (const t of DISCORD_TRIGGER_MANIFEST) if (t.listenerEvent === listenerEvent) return t;
    return null;
}

export function discordTriggerById(triggerId: string): DiscordTriggerSpec | null {
    for (const t of DISCORD_TRIGGER_MANIFEST) if (t.triggerId === triggerId) return t;
    return null;
}
