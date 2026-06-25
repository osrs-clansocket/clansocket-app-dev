import { isWebhookCapable } from "../../../state-sync/webhooks/webhook-capable-guard.js";

function guardForUpdate<T>(guard: (x: T) => T | null): (_o: unknown, n: T) => T | null {
    return (_o, n) => guard(n);
}

export const stickerGuard = (s: any): any => (s.guildId ? s : null);
export const channelGuard = (c: any): any => ("guild" in c && c.guild ? c : null);
export const webhookGuard = (c: any): any => (isWebhookCapable(c) ? c : null);
export const stickerGuardNew = guardForUpdate(stickerGuard);
export const channelGuardNew = guardForUpdate(channelGuard);
