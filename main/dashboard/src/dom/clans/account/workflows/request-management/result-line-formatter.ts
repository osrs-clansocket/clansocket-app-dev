import type { ManagerSubmitResult } from "../../../../../state/clans/clans-client/index.js";

export function formatResultLine(result: ManagerSubmitResult, displayName: string): string {
    if (!result.ok) return `✗ ${displayName}: ${result.message ?? result.reason}`;
    if (result.alreadyManager === true) return `○ ${displayName}: already a manager`;
    if (result.status === "granted") {
        return `✓ ${displayName}: auto-granted via RSN '${result.rsn}' (rank '${result.rank}')`;
    }
    return `⌛ ${displayName}: awaiting owner approval`;
}
