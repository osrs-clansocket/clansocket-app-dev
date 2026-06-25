export interface UpdateAuditPayload<T> {
    guildId: string;
    targetName: string;
    before: T;
    after: T;
}

export interface RenameAuditPayload {
    guildId: string;
    targetName: string;
    beforeName: string;
    afterName: string;
}

export function updateAuditPayload<T>(guildId: string, targetName: string, before: T, after: T): UpdateAuditPayload<T> {
    return { guildId, targetName, before, after };
}

export function renameAuditPayload(
    guildId: string,
    targetName: string,
    beforeName: string,
    afterName: string,
): RenameAuditPayload {
    return { guildId, targetName, beforeName, afterName };
}

export interface ModerationAfter {
    subject: string;
    reason: string | null;
    targetUserId: string;
}

export interface ModerationAuditPayload {
    guildId: string;
    userId: string;
    userName: string;
    reason: string | undefined;
}

export function moderationAfter(subject: string, targetUserId: string, reason: string | undefined): ModerationAfter {
    return { subject, reason: reason ?? null, targetUserId };
}

export function moderationAuditPayload(
    guildId: string,
    userId: string,
    userName: string,
    reason: string | undefined,
): ModerationAuditPayload {
    return { guildId, userId, userName, reason };
}

export interface WebhookAfter {
    name: string | null;
    channelId: string;
    avatarUrl: string | null;
}

export function webhookAfter(
    name: string | null,
    channelId: string,
    avatarUrl: string | null | undefined,
): WebhookAfter {
    return { name, channelId, avatarUrl: avatarUrl ?? null };
}
