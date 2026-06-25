import { HTTP_NOT_FOUND } from "../../../../shared/http/http-status.js";
import type { Response } from "express";
import { accountById, type SiteAccountRow } from "../../../../database/site/site-accounts/index.js";
import { insertNotification } from "../../../../notifications/notification-store.js";

export { challengeOf } from "../../challenge-store.js";

export const MAX_PASSKEYS = 10;
export const OK_FLAG = true;

export function audit(siteAccountId: string, title: string, body: string): void {
    insertNotification({ siteAccountId, title, body, kind: "auth_audit", href: "/account" });
}

export function loadAccountOr404(siteAccountId: string, res: Response): SiteAccountRow | null {
    const account = accountById(siteAccountId);
    if (account === null) {
        res.status(HTTP_NOT_FOUND).json({ error: "account_not_found" });
        return null;
    }
    return account;
}
