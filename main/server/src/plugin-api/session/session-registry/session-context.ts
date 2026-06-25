import type { PluginSocketState } from "../socket-state.js";
import { sessionStateId } from "./index.js";

export interface PluginSessionContext {
    sessionId: string;
    accountHash: string;
    rsn: string;
    mode: string;
    clanId: string;
    world: number;
}

function isFullyPlaced(state: PluginSocketState | undefined): boolean {
    if (!state) return false;
    return state.authed && state.sessionAccount !== null && state.sockMode !== null && state.sockClanId !== null;
}

export function pluginSessionContext(sessionId: string | undefined | null): PluginSessionContext | null {
    if (!sessionId) return null;
    const state = sessionStateId(sessionId);
    if (!isFullyPlaced(state)) return null;
    return {
        sessionId,
        accountHash: state!.sessionAccount!,
        rsn: state!.sessionRsn ?? "",
        mode: state!.sockMode!,
        clanId: state!.sockClanId!,
        world: state!.currentWorld,
    };
}
