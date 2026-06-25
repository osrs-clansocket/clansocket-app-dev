let started = false;

export function isStarted(): boolean {
    return started;
}

export function markStarted(): void {
    started = true;
}
