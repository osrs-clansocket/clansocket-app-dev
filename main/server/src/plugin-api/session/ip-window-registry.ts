export interface IpWindow {
    count: number;
    windowStartMs: number;
}

const ipWindows = new Map<string, IpWindow>();
let lastSweepAt = 0;

export function getIpWindow(ip: string): IpWindow | undefined {
    return ipWindows.get(ip);
}

export function setIpWindow(ip: string, w: IpWindow): void {
    ipWindows.set(ip, w);
}

export function sweepIpWindows(now: number, windowMs: number, sweepIntervalMs: number): void {
    if (now - lastSweepAt < sweepIntervalMs) return;
    lastSweepAt = now;
    for (const [ip, entry] of ipWindows) {
        if (now - entry.windowStartMs > windowMs * 2) ipWindows.delete(ip);
    }
}

export function clearIpWindows(): void {
    ipWindows.clear();
    lastSweepAt = 0;
}
