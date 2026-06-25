import { MS_PER_HOUR, MS_PER_MINUTE, MS_PER_SECOND } from "../../shared/time.js";

export function formatDuration(ms: number): string {
    if (ms < MS_PER_SECOND) return `${ms}ms`;
    if (ms < MS_PER_MINUTE) return `${Math.floor(ms / MS_PER_SECOND)}s`;
    if (ms < MS_PER_HOUR) {
        const minutes = Math.floor(ms / MS_PER_MINUTE);
        const seconds = Math.floor((ms % MS_PER_MINUTE) / MS_PER_SECOND);
        return `${minutes}m ${seconds}s`;
    }
    const hours = Math.floor(ms / MS_PER_HOUR);
    const minutes = Math.floor((ms % MS_PER_HOUR) / MS_PER_MINUTE);
    return `${hours}h ${minutes}m`;
}
