import { upsertSiteAccount } from "../../../../database/site/site-accounts/index.js";
import { type ChallengeContext } from "../../challenge-store.js";
import { redeemBackupCode } from "../../backup-codes.js";
import { consumeLinkCode } from "../../device-link-codes.js";
import { MODE_CTX_BUILDERS } from "./mode-ctx-builders.js";

export { challengeOf } from "../../challenge-store.js";

const PASSKEY_PROVIDER = "passkey";

export interface RegisterBody {
    mode?: "new" | "link" | "recover";
    displayName?: string;
    linkCode?: string;
    backupCode?: string;
}

export function resolveContext(body: RegisterBody): ChallengeContext | { error: string } {
    const mode = body.mode ?? "new";
    return (MODE_CTX_BUILDERS[mode] ?? MODE_CTX_BUILDERS.new)(body);
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
