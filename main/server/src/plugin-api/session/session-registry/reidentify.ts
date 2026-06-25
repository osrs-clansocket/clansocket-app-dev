import { EVENT_REIDENTIFY } from "../../event-types.js";
import { send } from "../../transport/send.js";
import { eachClient } from "../../transport/wss-registry.js";
import type { PluginSocket } from "../socket-state.js";
import { sessionStateId } from "./index.js";

function attachCloseHandler(sock: PluginSocket, onClose: () => void): void {
    sock.on("close", onClose);
}

function socketBySession(sessionId: string): PluginSocket | null {
    const state = sessionStateId(sessionId);
    if (!state) return null;
    let found: PluginSocket | null = null;
    eachClient((ws) => {
        if (ws.pluginState === state) found = ws;
    });
    return found;
}

interface ReidentifyArgs {
    sessionState: NonNullable<ReturnType<typeof sessionStateId>>;
    sock: PluginSocket;
    timeoutMs: number;
}

function awaitReidentify(a: ReidentifyArgs): Promise<boolean> {
    let resolveOuter: (v: boolean) => void = () => {};
    let done = false;
    const signal = AbortSignal.timeout(a.timeoutMs);
    const onIdentity = (): void => settle(true);
    const onClose = (): void => settle(false);
    const onAbort = (): void => settle(false);
    function settle(value: boolean): void {
        if (done) return;
        done = true;
        a.sessionState.identityWaiters.delete(onIdentity);
        a.sock.off("close", onClose);
        signal.removeEventListener("abort", onAbort);
        resolveOuter(value);
    }
    a.sessionState.identityWaiters.add(onIdentity);
    attachCloseHandler(a.sock, onClose);
    signal.addEventListener("abort", onAbort);
    return new Promise<boolean>((resolve) => {
        resolveOuter = resolve;
    });
}

export function requestReidentifyAwait(sessionId: string, timeoutMs: number): Promise<boolean> {
    const sessionState = sessionStateId(sessionId);
    if (!sessionState) return Promise.resolve(false);
    const sock = socketBySession(sessionId);
    if (!sock) return Promise.resolve(false);
    send(sock, { type: EVENT_REIDENTIFY });
    return awaitReidentify({ sessionState, sock, timeoutMs });
}
