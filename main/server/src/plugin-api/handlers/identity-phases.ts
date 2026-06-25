import { LOGIN_STATE_LOGGED_IN } from "../session/login-states.js";
import { PLUGIN_RL_AUTHED_BURST, PLUGIN_RL_AUTHED_PER_SEC, WS_CODE_INTERNAL_ERROR } from "../constants.js";
import {
    isClanMember,
    markPluginConnected,
    recordPluginIdentity,
    orCreateClan,
    upsertVerifiedRsn,
} from "../../database/index.js";
import { isClanManager } from "../../database/clans/access/clan-manager-store.js";
import { accountByHash } from "../../database/site/site-accounts/index.js";
import { logPluginError } from "../logger/index.js";
import { mapAccountType } from "../../wom/mappers/account-type-mapper.js";
import { send } from "../transport/send.js";
import { isTelemetryAllowed } from "../session/telemetry-gate.js";
import { enforceAccountCap } from "../session/account-cap.js";
import type { PluginClientMessage } from "../types/index.js";
import type { DispatchContext } from "./dispatch.js";

export type IdentityMsg = Extract<PluginClientMessage, { type: "identity" }>;

export type ClanRow = NonNullable<ReturnType<typeof orCreateClan>>;

export function resolveClan(ctx: DispatchContext, clanName: string): ClanRow | null | "error" {
    if (clanName.length === 0) return null;
    try {
        return orCreateClan(clanName);
    } catch (err) {
        logPluginError(ctx.sessionId, `clan resolve failed: ${(err as Error).message}`);
        send(ctx.ws, { type: "error", reason: "clan_resolve_failed" });
        ctx.ws.close(WS_CODE_INTERNAL_ERROR, "clan_resolve_failed");
        return "error";
    }
}

function buildIdentityRecord(msg: IdentityMsg, mode: string) {
    return {
        mode,
        accountHash: msg.accountHash,
        rsn: msg.rsn,
        accountType: typeof msg.accountType === "string" ? mapAccountType(msg.accountType) : null,
        world: msg.world,
        activity: msg.activity ?? null,
        clanName: msg.clanName ?? null,
        clanRank: msg.clanRank ?? null,
        clanJoinedAt: msg.clanJoinedAt ?? null,
        clanMemberCount: msg.clanMemberCount ?? null,
        clanOnlineCount: msg.clanOnlineCount ?? null,
        worldTypes: msg.worldTypes,
        pluginVersion: msg.pluginVersion,
        schemaVersion: msg.schemaVersion,
    };
}

export function recordIdentityDb(ctx: DispatchContext, msg: IdentityMsg, clanRow: ClanRow, mode: string): boolean {
    try {
        recordPluginIdentity(clanRow.id, mode, ctx.sessionId, buildIdentityRecord(msg, mode));
        return true;
    } catch (err) {
        logPluginError(ctx.sessionId, `identity record failed: ${(err as Error).message}`);
        send(ctx.ws, { type: "error", reason: "identity record failed" });
        ctx.ws.close(WS_CODE_INTERNAL_ERROR, "identity record failed");
        return false;
    }
}

export function flipToAuthed(ctx: DispatchContext): void {
    const { state } = ctx;
    const wasAuthed = state.authed;
    state.authed = true;
    state.loginState = LOGIN_STATE_LOGGED_IN;
    state.lastIdentityAt = Date.now();
    state.staleIdentityEventCount = 0;
    state.notLoggedInEventCount = 0;
    if (state.identityWaiters.size > 0) {
        const waiters = [...state.identityWaiters];
        state.identityWaiters.clear();
        for (const fire of waiters) fire();
    }
    if (!wasAuthed) state.bucket.reconfigure(PLUGIN_RL_AUTHED_PER_SEC, PLUGIN_RL_AUTHED_BURST);
    if (state.identityTimer) {
        clearTimeout(state.identityTimer);
        state.identityTimer = null;
    }
}

export function markConnected(ctx: DispatchContext, msg: IdentityMsg): void {
    const { ws, state, sessionId } = ctx;
    enforceAccountCap(msg.accountHash, ws);
    if (state.sockClanId && state.sockMode && state.sessionAccount && isTelemetryAllowed(state.clanStatus)) {
        try {
            markPluginConnected(state.sockClanId, state.sockMode, state.sessionAccount, sessionId);
        } catch (err) {
            logPluginError(sessionId, `connection mark failed: ${(err as Error).message}`);
        }
    }
    try {
        upsertVerifiedRsn(msg.accountHash, msg.rsn, "plugin", msg.clanRank ?? null);
    } catch (err) {
        logPluginError(sessionId, `rsn upsert failed: ${(err as Error).message}`);
    }
}

export function evaluateManagerBinding(ctx: DispatchContext, clanRow: ClanRow): void {
    const { state } = ctx;
    if (!state.sessionAccount) return;
    const bound = accountByHash(state.sessionAccount);
    if (bound && isClanManager(bound.id, clanRow.id)) {
        state.managerClanId = clanRow.id;
        state.managerVerified = true;
        state.autoVerifyReason = "account_binding";
    }
}

export function evaluateClanMembership(ctx: DispatchContext, msg: IdentityMsg, clanRow: ClanRow): void {
    const { ws, state } = ctx;
    if (!isTelemetryAllowed(state.clanStatus)) {
        send(ws, { type: "clan_reminder", reason: "not_registered", clanName: clanRow.display_name });
        return;
    }
    const isManagerOfThisClan = state.managerVerified && state.managerClanId === clanRow.id;
    state.clanVerified = isManagerOfThisClan || isClanMember(clanRow.id, msg.rsn);
    if (!state.clanVerified) {
        send(ws, { type: "clan_reminder", reason: "not_member", clanName: clanRow.display_name });
    }
}
