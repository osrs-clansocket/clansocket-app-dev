import { CLAN_STATUS_ACTIVE, CLAN_STATUS_PENDING, CLAN_STATUS_RECOVERY } from "../../shared/clan/clan-status.js";
import { normalizeRsn } from "../../database/clans/access/clan-roster/lookups.js";
import { RUNEWATCH_BLOCKED_REASON, checkRunewatchBlock, isHardBlock } from "../../runewatch/gates/check-block-gate.js";
import { IN_WORLD_LOGIN_STATES } from "./login-states.js";
import { PLUGIN_IDENTITY_REASSERT_MS, WS_CODE_POLICY_VIOLATION } from "../constants.js";
import { send } from "../transport/send.js";
import type { PluginSocket, PluginSocketState } from "./socket-state.js";
import { handleLoggedOut, handleStaleIdentity, rejectUnauthed } from "./reject-handlers.js";

export { rejectUnauthed } from "./reject-handlers.js";

export type TelemetryReason =
    | "unauthed"
    | "stale_identity"
    | "not_logged_in"
    | "clan_blocked"
    | typeof RUNEWATCH_BLOCKED_REASON;

const TELEMETRY_ALLOWED_STATUSES: ReadonlySet<string> = new Set([
    CLAN_STATUS_ACTIVE,
    CLAN_STATUS_PENDING,
    CLAN_STATUS_RECOVERY,
]);

export function isTelemetryAllowed(status: string | null): boolean {
    return status !== null && TELEMETRY_ALLOWED_STATUSES.has(status);
}

export function checkTelemetryGate(
    state: PluginSocketState,
    now: number,
): { ok: true } | { ok: false; reason: TelemetryReason } {
    if (!state.authed || !state.sockMode || !state.sessionAccount) return { ok: false, reason: "unauthed" };
    if (state.sessionRsn !== null) {
        const rwBlock = checkRunewatchBlock(normalizeRsn(state.sessionRsn));
        if (isHardBlock(rwBlock)) return { ok: false, reason: RUNEWATCH_BLOCKED_REASON };
    }
    if (!isTelemetryAllowed(state.clanStatus) || !state.clanVerified) return { ok: false, reason: "clan_blocked" };
    if (now - state.lastIdentityAt > PLUGIN_IDENTITY_REASSERT_MS) return { ok: false, reason: "stale_identity" };
    if (!IN_WORLD_LOGIN_STATES.has(state.loginState)) return { ok: false, reason: "not_logged_in" };
    return { ok: true };
}

export function handleTelemetryReject(ws: PluginSocket, state: PluginSocketState, reason: TelemetryReason): void {
    switch (reason) {
        case "unauthed":
            return rejectUnauthed(ws, state);
        case "clan_blocked":
            return;
        case RUNEWATCH_BLOCKED_REASON:
            send(ws, { type: "error", reason: RUNEWATCH_BLOCKED_REASON });
            ws.close(WS_CODE_POLICY_VIOLATION, RUNEWATCH_BLOCKED_REASON);
            return;
        case "stale_identity":
            return handleStaleIdentity(ws, state);
        case "not_logged_in":
            return handleLoggedOut(ws, state);
    }
}
