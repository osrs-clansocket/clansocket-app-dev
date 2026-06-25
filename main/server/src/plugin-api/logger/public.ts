import { EVENT_IDENTITY } from "../event-types.js";
import { color } from "./ansi.js";
import { COLOR_BY_TYPE, type IdentityLogData, clearSessionTag, sessionHead, setSessionTag } from "./session.js";
import { formatPayload } from "./payload/index.js";

export function logPluginLifecycle(
    action: "connect" | "disconnect",
    sessionId: string,
    code?: number,
    reason?: string,
): void {
    let detail = "";
    if (action === "disconnect" && code !== undefined) {
        const reasonPart = reason ? ` reason=${reason}` : "";
        detail = `  code=${code}${reasonPart}`;
    }
    console.log(color("brightCyan", sessionHead(action, sessionId)) + detail);
    if (action === "disconnect") clearSessionTag(sessionId);
}

export function logPluginIdentity(sessionId: string, d: IdentityLogData): void {
    setSessionTag(sessionId, { rsn: d.rsn, clanName: d.clanName ?? null });
    const line =
        color("magenta", sessionHead(EVENT_IDENTITY, sessionId)) +
        color("dim", `  acct=${d.accountHash}`) +
        `  world=${d.world}` +
        `  mode=${color("yellow", d.mode)}` +
        color("dim", `  activity=${d.activity ?? "?"}`) +
        `  rank=${d.clanRank ?? "?"}` +
        `  members=${d.clanMemberCount ?? 0}/${d.clanOnlineCount ?? 0}` +
        color("dim", `  [${d.worldTypes.join(",")}]`);
    console.log(line);
}

export function logPluginEvent(sessionId: string, type: string, data: unknown): void {
    const clr = COLOR_BY_TYPE[type] ?? "white";
    const head = color(clr, sessionHead(type, sessionId));
    const body = formatPayload(type, data);
    console.log(body ? `${head}  ${body}` : head);
}

export function logPluginError(sessionId: string, reason: string): void {
    console.log(color("red", sessionHead("error", sessionId)) + "  " + reason);
}
