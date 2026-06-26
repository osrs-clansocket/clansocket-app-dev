import { recordChat } from "../../../database/index.js";
import { sessionReady } from "../../session/socket-state.js";
import { EVENT_CHAT } from "../../event-types.js";
import { logPluginError, logPluginEvent } from "../../logger/index.js";
import { send } from "../../transport/send.js";
import { isTelemetryAllowed, rejectUnauthed } from "../../session/telemetry-gate.js";
import type { PluginClientMessage } from "../../types/index.js";
import type { DispatchContext } from "../dispatch-types.js";

type ChatMsg = Extract<PluginClientMessage, { type: "chat" }>;

const MAX_CHAT_TEXT_LEN = 1024;

function persistChat(ctx: DispatchContext, msg: ChatMsg, timestampMs: number): void {
    const { state, sessionId } = ctx;
    try {
        recordChat(state.sockClanId!, {
            sessionId,
            timestampMs,
            accountHash: state.sessionAccount!,
            rsn: state.sessionRsn!,
            senderRsn: msg.senderRsn,
            world: msg.world,
            kind: msg.kind,
            text: msg.text,
            eventTs: msg.eventTs,
        });
        logPluginEvent(sessionId, EVENT_CHAT, {
            kind: msg.kind,
            text: msg.text,
            rsn: state.sessionRsn!,
            senderRsn: msg.senderRsn,
            world: msg.world,
        });
    } catch (err) {
        logPluginError(sessionId, `chat record failed: ${(err as Error).message}`);
    }
}

export function handleChat(ctx: DispatchContext, msg: ChatMsg): void {
    const { ws, state } = ctx;
    if (!sessionReady(state) || !state.sessionRsn) {
        rejectUnauthed(ws, state);
        return;
    }
    if (!isTelemetryAllowed(state.clanStatus)) return;
    if (msg.text.length === 0 || msg.text.length > MAX_CHAT_TEXT_LEN) {
        send(ws, { type: "error", reason: "bad_text" });
        return;
    }
    const timestampMs = msg.eventTs > 0 ? msg.eventTs * 1000 : Date.now();
    persistChat(ctx, msg, timestampMs);
}
