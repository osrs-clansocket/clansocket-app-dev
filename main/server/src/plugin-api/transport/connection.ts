import logger from "@clansocket/logger";
import type { IncomingMessage } from "http";
import type { WebSocket } from "ws";
import { randomUUID } from "crypto";
import { markPluginDisconnected, recordPluginDisconnect } from "../../database/index.js";
import { PLUGIN_MAX_PAYLOAD_BYTES, WS_CODE_POLICY_VIOLATION } from "../constants.js";
import { EVENT_PONG } from "../event-types.js";
import { logPluginLifecycle, logPluginError } from "../logger/index.js";
import { unregisterSocket } from "../session/account-cap.js";
import { send } from "./send.js";
import { isTelemetryAllowed } from "../session/telemetry-gate.js";
import { clientIpFor } from "../session/attack-monitor.js";
import { registerSession, unregisterSession } from "../session/session-registry/index.js";
import { initialSocketState, type PluginSocket } from "../session/socket-state.js";
import { eachClient } from "./wss-registry.js";
import { dispatchPluginMessage } from "../handlers/dispatch.js";
import type { PluginClientMessage } from "../types/index.js";
import { onPong } from "./pong-recorder.js";

const LARGE_PAYLOAD_THRESHOLD = PLUGIN_MAX_PAYLOAD_BYTES * 0.9;

export function onConnection(rawWs: WebSocket, req: IncomingMessage): void {
    const ws = rawWs as PluginSocket;
    const sessionId = randomUUID();
    const remote = clientIpFor(req);
    logPluginLifecycle("connect", sessionId);

    const state = initialSocketState(() => {
        if (!state.authed) ws.close(WS_CODE_POLICY_VIOLATION, "identity timeout");
    });
    ws.pluginState = state;
    registerSession(sessionId, state);

    const ctx = { ws, state, sessionId, remote } as const;

    ws.on(EVENT_PONG, () => onPong(ws, sessionId));
    ws.on("message", (raw) => onMessage(ctx, raw as Buffer));
    ws.on("close", (code, reason) => onClose(ws, sessionId, code, reason));
    ws.on("error", (err) => logPluginError(sessionId, err.message));
}

export function onHeartbeat(): void {
    eachClient((ws) => {
        const state = ws.pluginState;
        if (!state) return;
        if (state.isAlive === false) {
            ws.terminate();
            return;
        }
        state.isAlive = false;
        state.lastPingAt = Date.now();
        try {
            ws.ping();
        } catch (err) {
            logger.debug(`[plugin-conn] ping failed: ${(err as Error).message}`);
            ws.terminate();
        }
    });
}

function onMessage(
    ctx: { ws: PluginSocket; state: PluginSocket["pluginState"] & object; sessionId: string; remote: string },
    rawBuf: Buffer,
): void {
    const { ws, state, sessionId } = ctx;
    if (!state.bucket.tryConsume()) {
        send(ws, { type: "error", reason: "rate limit" });
        return;
    }
    if (rawBuf.length > LARGE_PAYLOAD_THRESHOLD) {
        logPluginError(sessionId, `large payload ${rawBuf.length}B (limit ${PLUGIN_MAX_PAYLOAD_BYTES}B)`);
    }
    let msg: PluginClientMessage;
    try {
        msg = JSON.parse(rawBuf.toString()) as PluginClientMessage;
    } catch {
        send(ws, { type: "error", reason: "invalid json" });
        return;
    }
    dispatchPluginMessage(ctx, msg);
}

function recordSessionClose(state: NonNullable<PluginSocket["pluginState"]>, sessionId: string): void {
    if (!state.authed || !state.sockMode || !state.sockClanId) return;
    if (!isTelemetryAllowed(state.clanStatus)) return;
    try {
        recordPluginDisconnect(state.sockClanId, state.sockMode, sessionId);
    } catch (err) {
        logPluginError(sessionId, `disconnect record failed: ${(err as Error).message}`);
    }
    if (!state.sessionAccount) return;
    try {
        markPluginDisconnected(state.sockClanId, state.sockMode, state.sessionAccount);
    } catch (err) {
        logPluginError(sessionId, `connection unmark failed: ${(err as Error).message}`);
    }
}

function onClose(ws: PluginSocket, sessionId: string, code: number, reason: Buffer): void {
    const state = ws.pluginState;
    if (!state) return;
    if (state.identityTimer) {
        clearTimeout(state.identityTimer);
        state.identityTimer = null;
    }
    const reasonStr = reason && reason.length > 0 ? reason.toString("utf8") : "";
    logPluginLifecycle("disconnect", sessionId, code, reasonStr);
    unregisterSession(sessionId);
    recordSessionClose(state, sessionId);
    if (state.sessionAccount) unregisterSocket(state.sessionAccount, ws);
}
