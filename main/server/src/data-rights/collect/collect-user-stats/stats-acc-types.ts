import type { UserDataStats } from "./types.js";

export interface StatsAcc {
    stats: UserDataStats;
    dbsTouched: Set<string>;
}
