import { MS_PER_MINUTE } from "../../shared/time.js";
import { PLUGIN_IP_UPGRADES_PER_MIN } from "../constants.js";
import { clearIpWindows, getIpWindow, setIpWindow, sweepIpWindows } from "./ip-window-registry.js";

export { type TokenBucket, createTokenBucket } from "./token-bucket.js";

const SWEEP_INTERVAL_MINUTES = 5;
const WINDOW_MS = MS_PER_MINUTE;
const SWEEP_INTERVAL_MS = SWEEP_INTERVAL_MINUTES * MS_PER_MINUTE;

export function ipUpgradeLimiter(ip: string): boolean {
    const now = Date.now();
    sweepIpWindows(now, WINDOW_MS, SWEEP_INTERVAL_MS);
    const entry = getIpWindow(ip);
    if (!entry || now - entry.windowStartMs > WINDOW_MS) {
        setIpWindow(ip, { count: 1, windowStartMs: now });
        return true;
    }
    if (entry.count >= PLUGIN_IP_UPGRADES_PER_MIN) return false;
    entry.count += 1;
    return true;
}

export function stopSweeper(): void {
    clearIpWindows();
}
