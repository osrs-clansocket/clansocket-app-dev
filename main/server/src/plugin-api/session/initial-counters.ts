export function initialCounterSection() {
    return {
        unauthedEventCount: 0,
        staleIdentityEventCount: 0,
        notLoggedInEventCount: 0,
        lastBatchSeq: 0,
    };
}

export function initialTimingSection() {
    return {
        lastIdentityAt: 0,
        lastPingAt: 0,
        lastRttMs: null,
        connectedAt: Date.now(),
    };
}
