import { randomUUID } from "node:crypto";
import { recordVerify, writeVaultEntry } from "../../../clan-vault/index.js";
import type { Actor } from "../../../clan-vault/shared/vault-types.js";
import { byoForClan } from "../../../database/discord/byo/byo-identity.js";
import { upsertIdentity } from "../../../database/discord/byo/upsert-identity.js";
import type { DiscordBotPayload } from "../../byo-bot/types/payload-type.js";
import { validateDiscordBot } from "../../byo-bot/validators/payload-validator.js";

const ENTRY_KEY_DISCORD_BOT = "discord-bot";
const ENTRY_TYPE_DISCORD_BOT = "discord-bot";
const DEFAULT_INTENTS_BITFIELD = 1;

export interface LinkContext {
    clan: { id: string; display_name: string; slug: string };
    sid: string;
    payload: DiscordBotPayload;
}

export type VerifyMetadata = { username: string; application_id: string };

function upsertBotIdentity(
    ctx: LinkContext,
    metadata: VerifyMetadata,
    botId: string,
    existingOwner: string | null,
): void {
    upsertIdentity({
        botId,
        clanId: ctx.clan.id,
        clanName: ctx.clan.display_name,
        username: metadata.username,
        applicationId: metadata.application_id,
        intentsBitfield: DEFAULT_INTENTS_BITFIELD,
        ownerSiteAccountId: existingOwner ?? ctx.sid,
        publicKey: ctx.payload.public_key,
    });
}

export async function persistLinkIdentity(
    ctx: LinkContext,
    metadata: VerifyMetadata,
): Promise<{ ok: true; botId: string } | { ok: false; reason: string }> {
    const actor: Actor = { kind: "user", user_id: ctx.sid };
    const writeResult = await writeVaultEntry({
        actor,
        clanId: ctx.clan.id,
        entry_key: ENTRY_KEY_DISCORD_BOT,
        entry_type: ENTRY_TYPE_DISCORD_BOT,
        payload: ctx.payload,
        validate: validateDiscordBot,
    });
    if (!writeResult.ok) return { ok: false, reason: writeResult.reason };
    const existing = byoForClan(ctx.clan.id);
    const botId = existing?.bot_id ?? randomUUID();
    upsertBotIdentity(ctx, metadata, botId, existing?.owner_site_account_id ?? null);
    await recordVerify(ctx.clan.id, ENTRY_KEY_DISCORD_BOT, "ok", actor);
    return { ok: true, botId };
}
