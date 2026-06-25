const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;

export function bucketLabel(retryAfterMs: number): string {
    const seconds = Math.ceil(retryAfterMs / MS_PER_SECOND);
    if (seconds <= SECONDS_PER_MINUTE) return `${seconds}s`;
    const minutes = Math.ceil(seconds / SECONDS_PER_MINUTE);
    if (minutes < MINUTES_PER_HOUR) return `${minutes} min`;
    const hours = Math.ceil(minutes / MINUTES_PER_HOUR);
    return hours === 1 ? "1 hour" : `${hours} hours`;
}
