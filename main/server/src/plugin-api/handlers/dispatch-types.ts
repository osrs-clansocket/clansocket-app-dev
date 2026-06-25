import type { PluginSocket, PluginSocketState } from "../session/socket-state.js";

export interface DispatchContext {
    ws: PluginSocket;
    state: PluginSocketState;
    sessionId: string;
    remote: string;
}

export interface BatchContext {
    batchSeq: number;
    batchTick: number | null;
}
