import type { WebSocket } from "ws";
import { LOGIN_STATE_BOOTSTRAPPING, LOGIN_STATE_UNKNOWN } from "./login-states.js";
import { PLUGIN_IDENTITY_TIMEOUT_MS, PLUGIN_RL_UNAUTHED_BURST, PLUGIN_RL_UNAUTHED_PER_SEC } from "../constants.js";
import { createTokenBucket, type TokenBucket } from "./ratelimit.js";
import type { PluginLoginState } from "../types/index.js";

export interface RosterSnapshotEntry {
    rank: string | null;
    joinedAt: string | null;
}

export type AutoVerifyReason = "owner_deputy" | "rank_whitelist" | "account_binding";

export interface PluginSocketState {
    isAlive: boolean;
    authed: boolean;
    sessionAccount: string | null;
    sessionRsn: string | null;
    sockMode: string | null;
    sockClanId: string | null;
    currentWorld: number;
    bucket: TokenBucket;
    unauthedEventCount: number;
    staleIdentityEventCount: number;
    notLoggedInEventCount: number;
    identityTimer: NodeJS.Timeout | null;
    loginState: PluginLoginState;
    prevLoginState: string;
    lastIdentityAt: number;
    lastPingAt: number;
    lastRttMs: number | null;
    connectedAt: number;
    snapshotHashes: Map<string, string>;
    lastBatchSeq: number;
    lastRosterFingerprint: string | null;
    managerClanId: string | null;
    managerVerified: boolean;
    autoVerifyReason: AutoVerifyReason | null;
    clanStatus: string | null;
    clanVerified: boolean;
    latestClanRank: string | null;
    lastRosterSnapshot: Map<string, RosterSnapshotEntry> | null;
    identityWaiters: Set<() => void>;
}

export type PluginSocket = WebSocket & { pluginState?: PluginSocketState };

function initialIdentitySection() {
    return {
        sessionAccount: null,
        sessionRsn: null,
        sockMode: null,
        sockClanId: null,
        currentWorld: 0,
    };
}

import { initialCounterSection, initialTimingSection } from "./initial-counters.js";

function initialManagerSection() {
    return {
        managerClanId: null,
        managerVerified: false,
        autoVerifyReason: null,
        clanStatus: null,
        clanVerified: false,
        latestClanRank: null,
        lastRosterFingerprint: null,
        lastRosterSnapshot: null,
    };
}

export function initialSocketState(onIdentityTimeout: () => void): PluginSocketState {
    return {
        isAlive: true,
        authed: false,
        bucket: createTokenBucket(PLUGIN_RL_UNAUTHED_PER_SEC, PLUGIN_RL_UNAUTHED_BURST),
        identityTimer: setTimeout(onIdentityTimeout, PLUGIN_IDENTITY_TIMEOUT_MS),
        loginState: LOGIN_STATE_UNKNOWN,
        prevLoginState: LOGIN_STATE_BOOTSTRAPPING,
        snapshotHashes: new Map<string, string>(),
        identityWaiters: new Set(),
        ...initialIdentitySection(),
        ...initialCounterSection(),
        ...initialTimingSection(),
        ...initialManagerSection(),
    };
}

export function sessionReady(
    state: PluginSocketState,
): state is PluginSocketState & { sockClanId: string; sessionAccount: string } {
    return state.authed && state.sockClanId !== null && state.sessionAccount !== null;
}
