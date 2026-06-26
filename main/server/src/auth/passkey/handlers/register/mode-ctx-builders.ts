import { randomUUID } from "node:crypto";
import { CHALLENGE_PURPOSE_REGISTER, type ChallengeContext } from "../../challenge-store.js";
import type { RegisterBody } from "./context.js";

function buildRegisterCtx(
    raw: string | undefined,
    errorCode: string,
    fill: (value: string) => Partial<ChallengeContext>,
): ChallengeContext | { error: string } {
    const value = (raw ?? "").trim();
    if (value.length === 0) return { error: errorCode };
    return {
        challenge: "",
        purpose: CHALLENGE_PURPOSE_REGISTER,
        siteAccountId: null,
        displayName: null,
        linkCode: null,
        backupCode: null,
        ...fill(value),
    };
}

export const MODE_CTX_BUILDERS: Record<string, (body: RegisterBody) => ChallengeContext | { error: string }> = {
    new: (body) =>
        buildRegisterCtx(body.displayName, "display_name_required", (v) => ({
            siteAccountId: randomUUID(),
            displayName: v,
        })),
    link: (body) => buildRegisterCtx(body.linkCode, "link_code_required", (v) => ({ linkCode: v })),
    recover: (body) => buildRegisterCtx(body.backupCode, "backup_code_required", (v) => ({ backupCode: v })),
};
