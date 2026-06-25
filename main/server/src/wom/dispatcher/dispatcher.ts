import "./queue-processor.js";
import { cancelScheduledWake, scheduleWake } from "./wake-scheduler.js";

export function pokeWomDispatcher(clanId: string): void {
    scheduleWake(clanId, Date.now());
}

export function cancelWomDispatcher(clanId: string): void {
    cancelScheduledWake(clanId);
}
