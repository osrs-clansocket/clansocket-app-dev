function payload(id: string, name: string | null, guildId: string, extra?: object) {
    return { id, name, guildId, ...(extra ?? {}) };
}

export const pMember = (m: any) => payload(m.id, m.user.username, m.guild.id);
export const pEmoji = (e: any) => payload(e.id, e.name, e.guild.id);
export const pRoleCU = (r: any) => payload(r.id, r.name, r.guild.id, { color: r.color });
export const pRoleDelete = (r: any) => payload(r.id, r.name, r.guild.id);
export const pSticker = (s: any) => payload(s.id, s.name, s.guildId);
export const pChannel = (c: any) => payload(c.id, c.name, c.guild.id, { type: c.type });
export const pGuild = (g: any) => payload(g.id, g.name, g.id);
export const pWebhook = (c: any) => ({ guildId: c.guild.id, channelId: c.id });
export const pMessage = (m: any) => ({
    id: m.id,
    channelId: m.channelId ?? m.channel?.id ?? "",
    guildId: m.guildId ?? m.guild?.id ?? "",
    authorId: m.author?.id ?? null,
    content: m.content ?? "",
});
export const pReaction = (args: { reaction: any; user: any }) => ({
    messageId: args.reaction.message?.id ?? "",
    channelId: args.reaction.message?.channelId ?? args.reaction.message?.channel?.id ?? "",
    guildId: args.reaction.message?.guildId ?? args.reaction.message?.guild?.id ?? "",
    userId: args.user?.id ?? "",
    emoji: args.reaction.emoji?.name ?? args.reaction.emoji?.id ?? "",
});
export const pThread = (t: any) => ({
    id: t.id,
    name: t.name ?? "",
    guildId: t.guild?.id ?? t.guildId ?? "",
    parentId: t.parentId ?? null,
});
export const pVoiceState = (args: { oldState: any; newState: any }) => ({
    userId: args.newState?.id ?? args.oldState?.id ?? "",
    guildId: args.newState?.guild?.id ?? args.oldState?.guild?.id ?? "",
    channelId: args.newState?.channelId ?? null,
    previousChannelId: args.oldState?.channelId ?? null,
});
export const pBan = (b: any) => ({
    userId: b.user?.id ?? "",
    guildId: b.guild?.id ?? "",
    reason: b.reason ?? null,
});
export const pInteraction = (i: any) => ({
    id: i.id,
    type: String(i.type ?? ""),
    userId: i.user?.id ?? "",
    guildId: i.guildId ?? i.guild?.id ?? "",
    channelId: i.channelId ?? i.channel?.id ?? null,
    commandName: i.commandName ?? null,
    customId: i.customId ?? null,
});
export const pScheduledEvent = (e: any) => ({
    id: e.id,
    name: e.name ?? "",
    guildId: e.guild?.id ?? e.guildId ?? "",
    scheduledStartAt: e.scheduledStartTimestamp ?? null,
    scheduledEndAt: e.scheduledEndTimestamp ?? null,
    channelId: e.channelId ?? null,
});
