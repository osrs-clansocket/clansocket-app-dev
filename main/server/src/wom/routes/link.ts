import { type Request, type Response } from "express";
import { handleAsync } from "../../api/middleware.js";
import { recordVerify, writeVaultEntry } from "../../clan-vault/index.js";
import type { Actor } from "../../clan-vault/shared/vault-types.js";
import { clanWomIdentity } from "../../database/wom/identity/get-clan-identity.js";
import { upsertIdentity } from "../../database/wom/identity/upsert-clan-identity.js";
import { HTTP_BAD_REQUEST, HTTP_FORBIDDEN } from "../../shared/http/http-status.js";
import { isPlainObject } from "../../shared/validators/type-guards.js";
import { withClanTry } from "../../clans/preflights/with-clan-try.js";
import type { ClanManagerContext } from "../../clans/preflights/clan-preflight.js";
import { isWomOwner } from "../auth/linker-gate.js";
import { defaultUserAgent } from "../builders/default-ua-builder.js";
import { validateWomPayload } from "../validators/payload-validator.js";
import { verifyWomCredentials } from "../verifiers/credentials-verifier.js";
import { mountedRouter } from "./_mount-registry.js";

const ENTRY_KEY_WOM = "wom";
const ENTRY_TYPE_WOM = "wom";

function fillDefault(payload: unknown, clanId: string): unknown {
    const p = isPlainObject(payload) ? payload : null;
    if (p === null) return payload;
    if (p.user_agent !== undefined) return payload;
    return { ...p, user_agent: defaultUserAgent(clanId) };
}

const router = mountedRouter();

type Clan = ClanManagerContext["clan"];

interface WriteLinkArgs {
    clan: Clan;
    sid: string;
    payload: unknown;
    actor: Actor;
    existing: ReturnType<typeof clanWomIdentity>;
    metadata: { groupId: number; groupName: string };
    res: Response;
}

function upsertAndRespond(a: WriteLinkArgs): void {
    const linkerSiteAccountId = a.existing?.linker_site_account_id ?? a.sid;
    upsertIdentity({
        linkerSiteAccountId,
        clanId: a.clan.id,
        womGroupId: a.metadata.groupId,
        cachedGroupName: a.metadata.groupName,
    });
    a.res.json({
        ok: true,
        linked: {
            group_id: a.metadata.groupId,
            group_name: a.metadata.groupName,
            linker_site_account_id: linkerSiteAccountId,
        },
    });
}

async function applyVerifiedLink(a: WriteLinkArgs): Promise<void> {
    const writeResult = await writeVaultEntry({
        clanId: a.clan.id,
        entry_key: ENTRY_KEY_WOM,
        entry_type: ENTRY_TYPE_WOM,
        payload: a.payload,
        actor: a.actor,
        validate: validateWomPayload,
    });
    if (!writeResult.ok) {
        a.res.status(HTTP_BAD_REQUEST).json({ ok: false, reason: writeResult.reason });
        return;
    }
    upsertAndRespond(a);
    await recordVerify(a.clan.id, ENTRY_KEY_WOM, "ok", a.actor);
}

async function persistWomLink(clan: Clan, sid: string, payload: unknown, res: Response): Promise<void> {
    const existing = clanWomIdentity(clan.id);
    if (existing && !isWomOwner(sid, clan.id, existing.linker_site_account_id)) {
        res.status(HTTP_FORBIDDEN).json({ error: "not_linker_or_clan_owner" });
        return;
    }
    const verifyResult = await verifyWomCredentials(payload as Parameters<typeof verifyWomCredentials>[0]);
    if (verifyResult.status !== "ok" || !verifyResult.public_metadata) {
        res.status(HTTP_BAD_REQUEST).json({ ok: false, reason: verifyResult.status });
        return;
    }
    await applyVerifiedLink({
        clan,
        sid,
        payload,
        existing,
        res,
        actor: { kind: "user", user_id: sid },
        metadata: verifyResult.public_metadata,
    });
}

router.post(
    "/:slug",
    handleAsync((req: Request, res: Response) =>
        withClanTry(req, res, { label: "wom", errorCode: "link_failed" }, async (ctx) => {
            const { clan, sid } = ctx;
            const payload = fillDefault(req.body as unknown, clan.id);
            if (!validateWomPayload(payload)) {
                res.status(HTTP_BAD_REQUEST).json({ ok: false, reason: "invalid_payload" });
                return;
            }
            await persistWomLink(clan, sid, payload, res);
        }),
    ),
);

export default router;
