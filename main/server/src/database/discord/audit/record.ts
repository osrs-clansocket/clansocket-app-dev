import { recordClanAudit } from "../../clans/audit/clan-audit/record.js";
import type { AnyAuditAction, PayloadFor } from "../../clans/audit/clan-audit-registry/index.js";
import { resolveClanId } from "./resolve-clan.js";

export interface DiscordAuditEntry {
    guildId: string;
    discordUserId: string | null;
    action: string;
    data: Record<string, unknown>;
}

export function recordFromDiscord(entry: DiscordAuditEntry): boolean {
    const clanId = resolveClanId(entry.guildId);
    if (!clanId) return false;
    const payload = entry.discordUserId ? { ...entry.data, discord_user_id: entry.discordUserId } : { ...entry.data };
    recordClanAudit(clanId, {
        actor: null,
        action: entry.action as AnyAuditAction,
        targetId: null,
        guildId: entry.guildId,
        payload: payload as PayloadFor<AnyAuditAction>,
    });
    return true;
}
