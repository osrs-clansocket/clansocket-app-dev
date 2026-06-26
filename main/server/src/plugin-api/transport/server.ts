import logger from "@clansocket/logger";
import type { Server as HttpServer, IncomingMessage } from "http";
import type { Socket } from "net";
import { WebSocketServer } from "ws";
import { PLUGIN_HEARTBEAT_MS, PLUGIN_MAX_PAYLOAD_BYTES, PLUGIN_WS_PATH, WS_CODE_GOING_AWAY } from "../constants.js";
import { stopSweeper } from "../session/ratelimit.js";
import { clearAccountRegistry } from "../session/account-cap.js";
import { getWss, setWss } from "./wss-registry.js";
import { onConnection, onConnectionHeartbeat } from "./connection.js";
import { buildUpgradeHandler } from "./upgrade-handler.js";

let upgradeHandler: ((req: IncomingMessage, socket: Socket, head: Buffer) => void) | null = null;
let attachedServer: HttpServer | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;

export function attachPluginApi(server: HttpServer): void {
    if (getWss()) return;
    const wss = new WebSocketServer({ noServer: true, maxPayload: PLUGIN_MAX_PAYLOAD_BYTES });
    setWss(wss);
    attachedServer = server;
    upgradeHandler = buildUpgradeHandler();
    server.on("upgrade", upgradeHandler);
    wss.on("connection", onConnection);
    heartbeatInterval = setInterval(onConnectionHeartbeat, PLUGIN_HEARTBEAT_MS);
    if (typeof heartbeatInterval.unref === "function") heartbeatInterval.unref();
    logger.info(`[plugin-api] attached at ${PLUGIN_WS_PATH}`);
}

export function detachPluginApi(): void {
    const wss = getWss();
    if (!wss) return;
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
    stopSweeper();
    if (attachedServer && upgradeHandler) {
        attachedServer.off("upgrade", upgradeHandler);
    }
    for (const client of wss.clients) client.close(WS_CODE_GOING_AWAY, "server shutting down");
    wss.close();
    setWss(null);
    upgradeHandler = null;
    attachedServer = null;
    clearAccountRegistry();
    logger.info("[plugin-api] detached");
}
