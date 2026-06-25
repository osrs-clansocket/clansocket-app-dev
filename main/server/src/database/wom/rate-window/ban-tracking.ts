import { runWomWrite } from "../db-runners.js";
import type { WindowStateName } from "./get.js";

const MAX_CONSECUTIVE_429 = 5;

export function recordWom429(clanId: string, current_consecutive: number): WindowStateName {
    const newConsecutive = current_consecutive + 1;
    const nextState: WindowStateName = newConsecutive >= MAX_CONSECUTIVE_429 ? "banned" : "within_limit";
    runWomWrite(
        clanId,
        `UPDATE clan_wom_rate_window
         SET consecutive_429 = ?, state_name = ?
         WHERE singleton_key = 'default'`,
        newConsecutive,
        nextState,
    );
    return nextState;
}

export function recordWomSuccess(clanId: string): void {
    runWomWrite(
        clanId,
        `UPDATE clan_wom_rate_window
         SET consecutive_429 = 0
         WHERE singleton_key = 'default'`,
    );
}

export function clearWomBan(clanId: string): void {
    runWomWrite(
        clanId,
        `UPDATE clan_wom_rate_window
         SET consecutive_429 = 0, state_name = 'within_limit'
         WHERE singleton_key = 'default'`,
    );
}
