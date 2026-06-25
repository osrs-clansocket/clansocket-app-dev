import type { Request, Response } from "express";
import { HEADER_CACHE_CONTROL } from "./cache-headers.js";
import { HEADER_CONTENT_TYPE } from "./http-mime.js";
import { HTTP_OK } from "./http-status.js";

const SSE_CONTENT_TYPE = "text/event-stream";
const SSE_CACHE_DEFAULT = "no-cache";
const SSE_CACHE_NO_TRANSFORM = "no-cache, no-transform";
const SSE_CONNECTION = "keep-alive";

interface SseOptions {
    cacheControl?: typeof SSE_CACHE_DEFAULT | typeof SSE_CACHE_NO_TRANSFORM;
    openComment?: string;
}

export function bindStreamLifecycle(req: Request, unsubscribe: () => void): void {
    req.on("close", () => unsubscribe());
    req.on("error", () => unsubscribe());
}

export function openEventStream(res: Response, opts: SseOptions = {}): void {
    res.setHeader(HEADER_CONTENT_TYPE, SSE_CONTENT_TYPE);
    res.setHeader(HEADER_CACHE_CONTROL, opts.cacheControl ?? SSE_CACHE_DEFAULT);
    res.setHeader("Connection", SSE_CONNECTION);
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();
    res.write(`: ${opts.openComment ?? "stream open"}\n\n`);
}

export function writeSseFrame(res: Response, payload: unknown, onError: () => void): void {
    try {
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch {
        onError();
    }
}

export function openNamedStream(res: Response, readyData: object): void {
    res.writeHead(HTTP_OK, {
        [HEADER_CONTENT_TYPE]: SSE_CONTENT_TYPE,
        [HEADER_CACHE_CONTROL]: SSE_CACHE_DEFAULT,
        Connection: SSE_CONNECTION,
    });
    res.write(`event: ready\ndata: ${JSON.stringify(readyData)}\n\n`);
}

export function writeNamedEvent(res: Response, eventName: string, data: object): void {
    res.write(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
}
