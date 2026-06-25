import { runBotWrite } from "../db-runners.js";

export function cleanupExpiredInteractions(): number {
    const result = runBotWrite(
        `DELETE FROM discord_interactions_pending WHERE expires_at < ? AND acknowledged_at IS NULL`,
        Date.now(),
    );
    return result.changes;
}
