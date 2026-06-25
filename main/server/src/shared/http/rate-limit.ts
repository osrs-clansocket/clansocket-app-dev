import rateLimit, { type RateLimitRequestHandler } from "express-rate-limit";
import { MS_PER_MINUTE } from "../time.js";

interface PerMinuteOpts {
    max: number;
    message?: object;
}

export function perMinuteLimiter(opts: PerMinuteOpts): RateLimitRequestHandler {
    return rateLimit({
        windowMs: MS_PER_MINUTE,
        max: opts.max,
        standardHeaders: true,
        legacyHeaders: false,
        ...(opts.message ? { message: opts.message } : {}),
    });
}
