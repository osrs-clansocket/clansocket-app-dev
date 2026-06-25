let reopenPending = false;

export function isReopenPending(): boolean {
    return reopenPending;
}

export function setReopenPending(v: boolean): void {
    reopenPending = v;
}
