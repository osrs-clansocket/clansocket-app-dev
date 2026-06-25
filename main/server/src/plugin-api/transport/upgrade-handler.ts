import type { IncomingMessage } from "http";
import type { Socket } from "net";
import { PLUGIN_WS_PATH } from "../constants.js";
import { ipUpgradeLimiter } from "../session/ratelimit.js";
import { clientIpFor, isIpFrozen } from "../session/attack-monitor.js";
import { getWss } from "./wss-registry.js";

export function buildUpgradeHandler(): (req: IncomingMessage, socket: Socket, head: Buffer) => void {
    return (req, socket, head) => {
        const current = getWss();
        if (!current) return;
        const pathname = new URL(req.url ?? "", "http://localhost").pathname;
        if (pathname !== PLUGIN_WS_PATH) return;
        const ip = clientIpFor(req);
        if (isIpFrozen(ip, Date.now())) {
            socket.destroy();
            return;
        }
        if (!ipUpgradeLimiter(ip)) {
            socket.destroy();
            return;
        }
        current.handleUpgrade(req, socket, head, (ws) => {
            current.emit("connection", ws, req);
        });
    };
}
