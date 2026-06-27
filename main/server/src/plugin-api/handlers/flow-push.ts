import { sessionReady } from "../session/socket-state.js";
import { send } from "../transport/send.js";
import { eachClient } from "../transport/wss-registry.js";
import { broadcastMessage } from "../types/index.js";
import { getClanDb } from "../../database/index.js";

interface MemberRow {
    account_hash: string | null;
}

function memberAccountHashByRsn(clanId: string, rsn: string): string | null {
    const row = getClanDb(clanId)
        .prepare("SELECT account_hash FROM clan_members WHERE member_name = ?")
        .get(rsn) as MemberRow | undefined;
    return row?.account_hash ?? null;
}

const COLOR_BRAND = "ffcc33";
const DEFAULT_BODY_COLOR = "ffffff";

function wrap(hex: string, body: string): string {
    return `<col=${hex}>${body}</col>`;
}

function formatChatbox(body: string, bodyColor: string): string {
    return `${wrap(COLOR_BRAND, "[ClanSocket]")} ${wrap(bodyColor, body)}`;
}

export interface FlowPushChatboxClanInput {
    readonly clanId: string;
    readonly message: string;
    readonly color?: string;
}

export interface FlowPushChatboxMemberInput {
    readonly clanId: string;
    readonly rsn: string;
    readonly message: string;
    readonly color?: string;
}

export function pushChatboxToClan(input: FlowPushChatboxClanInput): { recipientCount: number } {
    const text = formatChatbox(input.message, input.color ?? DEFAULT_BODY_COLOR);
    let count = 0;
    eachClient((ws) => {
        const pstate = ws.pluginState;
        if (!pstate || !sessionReady(pstate)) return;
        if (pstate.sockClanId !== input.clanId) return;
        send(ws, broadcastMessage(text));
        count += 1;
    });
    return { recipientCount: count };
}

export function pushChatboxToMember(input: FlowPushChatboxMemberInput): { recipientCount: number } {
    const accountHash = memberAccountHashByRsn(input.clanId, input.rsn);
    if (!accountHash) return { recipientCount: 0 };
    const text = formatChatbox(input.message, input.color ?? DEFAULT_BODY_COLOR);
    let count = 0;
    eachClient((ws) => {
        const pstate = ws.pluginState;
        if (!pstate || !sessionReady(pstate)) return;
        if (pstate.sockClanId !== input.clanId) return;
        if (pstate.sessionAccount !== accountHash) return;
        send(ws, broadcastMessage(text));
        count += 1;
    });
    return { recipientCount: count };
}
