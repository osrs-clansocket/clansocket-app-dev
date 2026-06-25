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
