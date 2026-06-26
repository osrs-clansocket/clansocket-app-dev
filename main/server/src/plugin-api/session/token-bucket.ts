import { MS_PER_SECOND } from "../../shared/time/index.js";

export interface TokenBucket {
    tryConsume(n?: number): boolean;
    reconfigure(ratePerSec: number, burst: number): void;
}

export function createTokenBucket(ratePerSec: number, burst: number): TokenBucket {
    let rate = ratePerSec;
    let capacity = burst;
    let tokens = burst;
    let lastRefillMs = Date.now();
    const refill = (): void => {
        const now = Date.now();
        tokens = Math.min(capacity, tokens + ((now - lastRefillMs) / MS_PER_SECOND) * rate);
        lastRefillMs = now;
    };
    return {
        tryConsume(n = 1): boolean {
            refill();
            if (tokens < n) return false;
            tokens -= n;
            return true;
        },
        reconfigure(newRate: number, newBurst: number): void {
            refill();
            rate = newRate;
            capacity = newBurst;
            if (tokens > capacity) tokens = capacity;
        },
    };
}
