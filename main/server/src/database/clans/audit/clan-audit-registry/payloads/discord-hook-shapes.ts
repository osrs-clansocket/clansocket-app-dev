import type { AuditCommonPayload } from "../payload-types.js";

export type { BotLinkerReassigned } from "./bot-linker-shapes.js";

export interface AutoHookCreated extends AuditCommonPayload {
    guildId: string;
    targetName: string;
    autoHookId: string;
    autoHookName: string;
    triggerType: string;
    webhookId: string;
}
export interface AutoHookUpdated extends AuditCommonPayload {
    guildId: string;
    targetName: string;
    autoHookId: string;
    autoHookName: string;
}
export interface AutoHookDeleted extends AuditCommonPayload {
    guildId: string;
    targetName: string;
    autoHookId: string;
}
export interface AutoHookToggled extends AuditCommonPayload {
    guildId: string;
    targetName: string;
    autoHookId: string;
    enabled: boolean;
}
