import type { AutoVerifyReason, RosterSnapshotEntry, PluginSocketState } from "../socket-state.js";
import { getWss } from "../../transport/wss-registry.js";

const sessionsById = new Map<string, PluginSocketState>();

export interface PluginLiveSession {
    sessionId: string;
    accountHash: string;
    rsn: string;
    world: number;
    loginState: string;
    inGameClanId: string | null;
    inGameClanRank: string | null;
    managerClanId: string | null;
    managerVerified: boolean;
    autoVerifyReason: AutoVerifyReason | null;
    rosterSnapshot: ReadonlyMap<string, RosterSnapshotEntry> | null;
    lastIdentityAt: number;
    connectedAt: number;
    pingMs: number | null;
}

export function registerSession(sessionId: string, state: PluginSocketState): void {
    sessionsById.set(sessionId, state);
}

export function unregisterSession(sessionId: string): void {
    sessionsById.delete(sessionId);
}

export function pluginConnectedCount(): number {
    const wss = getWss();
    return wss ? wss.clients.size : 0;
}

export function sessionStateId(sessionId: string): PluginSocketState | undefined {
    return sessionsById.get(sessionId);
}

function isLiveAuthed(state: PluginSocketState): boolean {
    return state.authed && state.sessionAccount !== null && state.sessionRsn !== null;
}

function matchesRsn(state: PluginSocketState, target: string): boolean {
    return isLiveAuthed(state) && state.sessionRsn!.toLowerCase() === target;
}

function matchesAccount(
    state: PluginSocketState,
    accountHash: string,
    requireManagerOfClanId: string | undefined,
): boolean {
    if (!isLiveAuthed(state) || state.sessionAccount !== accountHash) return false;
    if (!requireManagerOfClanId) return true;
    return state.managerVerified && state.managerClanId === requireManagerOfClanId;
}

function matchesClanManager(state: PluginSocketState, clanId: string): boolean {
    return isLiveAuthed(state) && state.managerVerified && state.managerClanId === clanId;
}

function collectSessions(match: (state: PluginSocketState) => boolean): PluginLiveSession[] {
    const out: PluginLiveSession[] = [];
    for (const [sessionId, state] of sessionsById.entries()) {
        if (!match(state)) continue;
        out.push(toLiveSession(sessionId, state));
    }
    return out;
}

export function liveByRsn(rsn: string): PluginLiveSession[] {
    const target = rsn.toLowerCase();
    return collectSessions((state) => matchesRsn(state, target));
}

export function sessionsByHash(accountHash: string, requireManagerOfClanId?: string): PluginLiveSession[] {
    return collectSessions((state) => matchesAccount(state, accountHash, requireManagerOfClanId));
}

export function managerSessions(clanId: string): PluginLiveSession[] {
    return collectSessions((state) => matchesClanManager(state, clanId));
}

function toLiveSession(sessionId: string, state: PluginSocketState): PluginLiveSession {
    return {
        sessionId,
        accountHash: state.sessionAccount!,
        rsn: state.sessionRsn!,
        world: state.currentWorld,
        loginState: state.loginState,
        inGameClanId: state.sockClanId,
        inGameClanRank: state.latestClanRank,
        managerClanId: state.managerClanId,
        managerVerified: state.managerVerified,
        autoVerifyReason: state.autoVerifyReason,
        rosterSnapshot: state.lastRosterSnapshot,
        lastIdentityAt: state.lastIdentityAt,
        connectedAt: state.connectedAt,
        pingMs: state.lastRttMs,
    };
}
