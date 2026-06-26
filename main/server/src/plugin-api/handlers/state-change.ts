import { recordClanRoster, recordPluginLogin } from "../../database/index.js";
import { sessionReady } from "../session/socket-state.js";
import { EVENT_CLAN_ROSTER, EVENT_LOGIN_STATE } from "../event-types.js";
import {
    LOGIN_STATE_CONNECTION_LOST,
    LOGIN_STATE_HOPPING,
    LOGIN_STATE_LOADING,
    LOGIN_STATE_LOGGED_IN,
    LOGIN_STATE_LOGGED_OUT,
    LOGIN_STATE_LOGGING_IN,
    LOGIN_STATE_LOGIN_SCREEN,
    LOGIN_STATE_LOGIN_SCREEN_AUTHENTICATOR,
    LOGIN_STATE_STARTING,
    LOGIN_STATE_UNKNOWN,
} from "../session/login-states.js";
import { logPluginError, logPluginEvent } from "../logger/index.js";
import { send } from "../transport/send.js";
import type { RosterSnapshotEntry } from "../session/socket-state.js";
import { isTelemetryAllowed, rejectUnauthed } from "../session/telemetry-gate.js";
import type { PluginClientMessage, PluginLoginState } from "../types/index.js";
import type { DispatchContext } from "./dispatch-types.js";

const VALID_LOGIN_STATES: ReadonlySet<PluginLoginState> = new Set([
    LOGIN_STATE_LOGGED_IN,
    LOGIN_STATE_LOGGED_OUT,
    LOGIN_STATE_LOGIN_SCREEN,
    LOGIN_STATE_LOGIN_SCREEN_AUTHENTICATOR,
    LOGIN_STATE_LOGGING_IN,
    LOGIN_STATE_LOADING,
    LOGIN_STATE_HOPPING,
    LOGIN_STATE_CONNECTION_LOST,
    LOGIN_STATE_STARTING,
    LOGIN_STATE_UNKNOWN,
]);

type LoginStateMsg = Extract<PluginClientMessage, { type: "login_state" }>;
type ClanRosterMsg = Extract<PluginClientMessage, { type: "clan_roster" }>;

function persistLogin(ctx: DispatchContext, msg: LoginStateMsg, stateBefore: string): void {
    const { state, sessionId } = ctx;
    try {
        recordPluginLogin({
            sessionId,
            stateBefore,
            clanId: state.sockClanId!,
            mode: state.sockMode!,
            accountHash: state.sessionAccount!,
            loginState: msg.state,
        });
    } catch (err) {
        logPluginError(sessionId, `login_state record failed: ${(err as Error).message}`);
    }
    logPluginEvent(sessionId, EVENT_LOGIN_STATE, msg);
}

export function handleLoginState(ctx: DispatchContext, msg: LoginStateMsg): void {
    const { ws, state } = ctx;
    if (!state.authed || !state.sockMode || !state.sockClanId || !state.sessionAccount) {
        rejectUnauthed(ws, state);
        return;
    }
    if (!VALID_LOGIN_STATES.has(msg.state)) {
        send(ws, { type: "error", reason: "invalid login_state" });
        return;
    }
    const stateBefore = state.prevLoginState;
    state.prevLoginState = msg.state;
    state.loginState = msg.state;
    if (msg.state === LOGIN_STATE_LOGGED_IN) state.notLoggedInEventCount = 0;
    if (!isTelemetryAllowed(state.clanStatus)) return;
    persistLogin(ctx, msg, stateBefore);
}

function buildRosterSnapshot(members: ClanRosterMsg["members"]): Map<string, RosterSnapshotEntry> {
    const snapshot = new Map<string, RosterSnapshotEntry>();
    for (const member of members) {
        snapshot.set(member.name.toLowerCase(), { rank: member.rank, joinedAt: member.joinedAt });
    }
    return snapshot;
}

function persistRoster(ctx: DispatchContext, msg: ClanRosterMsg): void {
    const { state, sessionId } = ctx;
    try {
        recordClanRoster(state.sockClanId!, state.sessionAccount!, msg.fingerprint, msg.members);
        state.lastRosterFingerprint = msg.fingerprint;
        state.lastRosterSnapshot = buildRosterSnapshot(msg.members);
        logPluginEvent(sessionId, EVENT_CLAN_ROSTER, {
            fingerprint: msg.fingerprint,
            member_count: msg.members.length,
        });
    } catch (err) {
        logPluginError(sessionId, `clan_roster record failed: ${(err as Error).message}`);
    }
}

export function handleClanRoster(ctx: DispatchContext, msg: ClanRosterMsg): void {
    const { ws, state } = ctx;
    if (!sessionReady(state)) {
        rejectUnauthed(ws, state);
        return;
    }
    if (!isTelemetryAllowed(state.clanStatus)) return;
    if (state.lastRosterFingerprint === msg.fingerprint) return;
    persistRoster(ctx, msg);
}
