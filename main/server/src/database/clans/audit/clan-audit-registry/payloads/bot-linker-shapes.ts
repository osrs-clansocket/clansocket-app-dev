import type { AuditCommonPayload } from "../payload-types.js";

export interface BotLinkerReassigned extends AuditCommonPayload {
    previous_linker: string;
    new_linker: string;
    by_owner: string;
}
