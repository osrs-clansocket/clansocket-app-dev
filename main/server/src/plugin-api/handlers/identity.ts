import { logPluginIdentity } from "../logger/index.js";
import { modeKey } from "../transport/mode-router.js";
import { send } from "../transport/send.js";
import { isTelemetryAllowed } from "../session/telemetry-gate.js";
import { pushPending } from "../consent/rsn-verify.js";
import { pushByRsn } from "../consent/claim-push.js";
import type { PluginSocketState } from "../session/socket-state.js";
import type { DispatchContext } from "./dispatch.js";
import {
    evaluateClanMembership,
    evaluateManagerBinding,
    flipToAuthed,
    markConnected,
    recordIdentityDb,
    resolveClan,
    type ClanRow,
    type IdentityMsg,
} from "./identity-phases.js";
import { identityPrechecks } from "./identity-precheck.js";
import { validateRsnIdentity } from "./validate-rsn-identity.js";

function populateIdentity(state: PluginSocketState, msg: IdentityMsg, clanRow: ClanRow | null, mode: string): void {
    state.sockMode = mode;
    state.sockClanId = clanRow?.id ?? null;
    state.clanStatus = clanRow?.status ?? null;
    state.sessionAccount = msg.accountHash;
    state.sessionRsn = msg.rsn;
    state.currentWorld = msg.world;
}

function logAccepted(sessionId: string, msg: IdentityMsg, mode: string): void {
    logPluginIdentity(sessionId, {
        mode,
        rsn: msg.rsn,
        accountHash: msg.accountHash,
        world: msg.world,
        activity: msg.activity,
        clanName: msg.clanName ?? null,
        clanRank: msg.clanRank ?? null,
        clanMemberCount: msg.clanMemberCount ?? null,
        clanOnlineCount: msg.clanOnlineCount ?? null,
        worldTypes: msg.worldTypes,
    });
}

function postAuth(ctx: DispatchContext, msg: IdentityMsg): void {
    const { ws, state } = ctx;
    flipToAuthed(ctx);
    markConnected(ctx, msg);
    send(ws, { type: "identity_ok" });
    pushPending(ws, msg.accountHash);
    pushByRsn(ws, msg.rsn);
    state.clanVerified = false;
}

export function handleIdentity(ctx: DispatchContext, msg: IdentityMsg): void {
    const { state, sessionId } = ctx;
    const clanName = (msg.clanName ?? "").trim();
    if (!identityPrechecks(ctx, msg, clanName)) return;
    state.managerClanId = null;
    state.managerVerified = false;
    state.autoVerifyReason = null;
    state.latestClanRank = msg.clanRank ?? null;
    if (!validateRsnIdentity(ctx, msg)) return;
    const clanResolution = resolveClan(ctx, clanName);
    if (clanResolution === "error") return;
    const clanRow = clanResolution;
    const mode = modeKey(msg.worldTypes, msg.activity);
    populateIdentity(state, msg, clanRow, mode);
    if (clanRow && isTelemetryAllowed(state.clanStatus) && !recordIdentityDb(ctx, msg, clanRow, mode)) return;
    logAccepted(sessionId, msg, mode);
    postAuth(ctx, msg);
    if (!clanRow) return;
    evaluateManagerBinding(ctx, clanRow);
    evaluateClanMembership(ctx, msg, clanRow);
}
