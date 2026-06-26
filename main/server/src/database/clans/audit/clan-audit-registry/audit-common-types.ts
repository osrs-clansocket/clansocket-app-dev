export type AuditSource = "server" | "client" | "system" | "discord";

export interface AuditCommonPayload {
    causedBy?: string;
    requestId?: string;
    elapsedMs?: number;
    revertsAuditId?: number;
}

export interface BeforeAfter<T> {
    before: T | null;
    after: T;
}

export interface DiscordBase extends AuditCommonPayload {
    guildId: string;
    targetName: string;
}
