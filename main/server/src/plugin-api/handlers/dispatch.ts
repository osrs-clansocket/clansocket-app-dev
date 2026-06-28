import {
    EVENT_BATCH,
    EVENT_CHAT,
    EVENT_CLAIM_CONSENT_RESPONSE,
    EVENT_CLAN_CONFIG_REQUEST,
    EVENT_CLAN_ROSTER,
    EVENT_CLAN_TITLES_SNAPSHOT,
    EVENT_COMBAT_ACHIEVEMENTS_CATALOG,
    EVENT_HELLO,
    EVENT_IDENTITY,
    EVENT_LOGIN_STATE,
    EVENT_PING,
    EVENT_PONG,
    EVENT_RSN_VERIFY_RESPONSE,
} from "../event-types.js";
import { PLUGIN_PROTOCOL_VERSION } from "../constants.js";
import { logPluginError } from "../logger/index.js";
import { send } from "../transport/send.js";
import type { PluginClientMessage } from "../types/index.js";
import { bumpSeen } from "./bump-seen.js";
import { handleClaimConsent } from "../consent/claim-finalize/index.js";
import { handleResponse } from "../consent/rsn-verify.js";
import { handleClanConfig } from "./clan-config.js";
import { handleChat } from "./telemetry/chat.js";
import { handleTitlesSnapshot } from "./telemetry/clan-titles.js";
import { handleIdentity } from "./identity.js";
import { handleClanRoster, handleLoginState } from "./state-change.js";
import { handleStandardTelemetry } from "./telemetry/standard-telemetry.js";
import { pluginEventRegistry } from "../../flows/registries/plugin-event-registry.js";
import { handleCatalog } from "./telemetry/snapshots.js";
import { dispatchBatch } from "./batch-dispatcher.js";
import type { BatchContext, DispatchContext } from "./dispatch-types.js";

export type { BatchContext, DispatchContext } from "./dispatch-types.js";

type Handler = (ctx: DispatchContext, msg: PluginClientMessage, batchCtx?: BatchContext) => void;

type HelloMsg = Extract<PluginClientMessage, { type: "hello" }>;
type PingMsg = Extract<PluginClientMessage, { type: "ping" }>;
type BatchMsg = Extract<PluginClientMessage, { type: "batch" }>;

function handleHello(ctx: DispatchContext, msg: HelloMsg): void {
    const { ws, sessionId } = ctx;
    if (typeof msg.protocolVersion === "number" && msg.protocolVersion !== PLUGIN_PROTOCOL_VERSION) {
        logPluginError(
            sessionId,
            `protocol_version_mismatch client=${msg.protocolVersion} server=${PLUGIN_PROTOCOL_VERSION}`,
        );
        send(ws, {
            type: "error",
            reason: `protocol_version_mismatch: client=${msg.protocolVersion} server=${PLUGIN_PROTOCOL_VERSION}`,
        });
        ws.close();
        return;
    }
    send(ws, { type: "welcome", sessionId });
}

function handlePing(ctx: DispatchContext, msg: PingMsg): void {
    send(ctx.ws, { type: EVENT_PONG, ts: msg.ts });
}

function handleBatch(ctx: DispatchContext, msg: BatchMsg): void {
    dispatchBatch(ctx, msg, dispatchPluginMessage);
}

const protocolHandlers = new Map<string, Handler>([
    [EVENT_HELLO, handleHello as Handler],
    [EVENT_PING, handlePing as Handler],
    [EVENT_RSN_VERIFY_RESPONSE, handleResponse as Handler],
    [EVENT_CLAIM_CONSENT_RESPONSE, handleClaimConsent as Handler],
    [EVENT_IDENTITY, handleIdentity as Handler],
    [EVENT_LOGIN_STATE, handleLoginState as Handler],
    [EVENT_CLAN_ROSTER, handleClanRoster as Handler],
    [EVENT_BATCH, handleBatch as Handler],
    [EVENT_CHAT, handleChat as Handler],
    [EVENT_CLAN_TITLES_SNAPSHOT, handleTitlesSnapshot as Handler],
    [EVENT_COMBAT_ACHIEVEMENTS_CATALOG, handleCatalog as Handler],
    [EVENT_CLAN_CONFIG_REQUEST, handleClanConfig as Handler],
]);

function resolveHandler(eventType: string): Handler | null {
    const protocol = protocolHandlers.get(eventType);
    if (protocol) return protocol;
    if (pluginEventRegistry.has(eventType)) return handleStandardTelemetry as Handler;
    return null;
}

export function dispatchPluginMessage(ctx: DispatchContext, msg: PluginClientMessage, batchCtx?: BatchContext): void {
    const handler = resolveHandler(msg.type);
    if (!handler) {
        send(ctx.ws, { type: "error", reason: "unknown message type" });
        return;
    }
    handler(ctx, msg, batchCtx);
    bumpSeen(ctx);
}
