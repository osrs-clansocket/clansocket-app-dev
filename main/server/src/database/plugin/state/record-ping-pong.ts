import { clanPluginDb } from "../../core/database.js";

export interface PingPongArgs {
    clanId: string;
    mode: string;
    accountHash: string;
    pingAt: number;
    pongAt: number;
}

export function recordPingPong(args: PingPongArgs): void {
    const { clanId, mode, accountHash, pingAt, pongAt } = args;
    clanPluginDb(clanId, mode)
        .prepare(
            `UPDATE plugin_connection_status
             SET latency_ms = $latency, last_ping_at = $pingAt, last_pong_at = $pongAt, updated_at = $pongAt
             WHERE account_hash = $accountHash`,
        )
        .run({ latency: pongAt - pingAt, pingAt, pongAt, accountHash });
}
