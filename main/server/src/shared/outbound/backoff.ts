interface BackoffArgs {
    attemptNo: number;
    baseMs: number;
    multiplier: number;
    maxMs: number;
}

export function computeBackoff(args: BackoffArgs): number {
    let backoffMs = args.baseMs;
    for (let i = 1; i < args.attemptNo; i++) backoffMs *= args.multiplier;
    return Math.min(backoffMs, args.maxMs);
}
