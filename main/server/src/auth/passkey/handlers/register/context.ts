import { randomUUID } from "node:crypto";
import { upsertSiteAccount } from "../../../../database/site/site-accounts/index.js";
import { CHALLENGE_PURPOSE_REGISTER, type ChallengeContext } from "../../challenge-store.js";
import { redeemBackupCode } from "../../backup-codes.js";
import { consumeLinkCode } from "../../device-link-codes.js";

export { challengeOf } from "../../challenge-store.js";

const PASSKEY_PROVIDER = "passkey";

export interface RegisterBody {
    mode?: "new" | "link" | "recover";
    displayName?: string;
    linkCode?: string;
    backupCode?: string;
}

function newRegisterCtx(opts: {
    siteAccountId?: string | null;
    displayName?: string | null;
    linkCode?: string | null;
    backupCode?: string | null;
}): ChallengeContext {
    return {
        challenge: "",
        purpose: CHALLENGE_PURPOSE_REGISTER,
        siteAccountId: opts.siteAccountId ?? null,
        displayName: opts.displayName ?? null,
        linkCode: opts.linkCode ?? null,
        backupCode: opts.backupCode ?? null,
    };
}

function withTrimmed<T>(
    raw: string | undefined,
    errorCode: string,
    build: (value: string) => T,
): T | { error: string } {
    const value = (raw ?? "").trim();
    return value.length === 0 ? { error: errorCode } : build(value);
}

export function resolveContext(body: RegisterBody): ChallengeContext | { error: string } {
    const mode = body.mode ?? "new";
    if (mode === "new")
        return withTrimmed(body.displayName, "display_name_required", (v) =>
            newRegisterCtx({ siteAccountId: randomUUID(), displayName: v }),
        );
    if (mode === "link")
        return withTrimmed(body.linkCode, "link_code_required", (v) => newRegisterCtx({ linkCode: v }));
    return withTrimmed(body.backupCode, "backup_code_required", (v) => newRegisterCtx({ backupCode: v }));
}

export function resolveTarget(
    ctx: ChallengeContext,
): { siteAccountId: string; displayName: string } | { error: string } {
    if (ctx.linkCode !== null) {
        const c = consumeLinkCode(ctx.linkCode);
        return c ? { siteAccountId: c.siteAccountId, displayName: "linked-device" } : { error: "link_code_invalid" };
    }
    if (ctx.backupCode !== null) {
        const c = redeemBackupCode(ctx.backupCode);
        return c
            ? { siteAccountId: c.siteAccountId, displayName: "recovered-device" }
            : { error: "backup_code_invalid" };
    }
    if (!ctx.siteAccountId || !ctx.displayName) return { error: "context_missing" };
    const account = upsertSiteAccount({
        provider: PASSKEY_PROVIDER,
        providerUserId: ctx.siteAccountId,
        displayName: ctx.displayName,
    });
    return { siteAccountId: account.id, displayName: ctx.displayName };
}
