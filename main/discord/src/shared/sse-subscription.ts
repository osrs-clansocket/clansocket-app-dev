import http from "node:http";
import logger from "@clansocket/logger";
import { authedRequestOpts, localApiUrl, requireApiToken, selectLib } from "./local-api-request.js";

const SSE_RECONNECT_MS = 5000;
const SSE_BLOCK_DELIMITER = "\n\n";

export interface SseSubscriptionOptions {
    name: string;
    path: string;
    eventMarker: string;
    onEvent: () => void;
}

class SseSubscription {
    private aborted = false;
    private currentReq: http.ClientRequest | null = null;
    private reconnectPending = false;
    private buffer = "";

    constructor(private readonly opts: SseSubscriptionOptions) {}

    start(): void {
        this.open();
    }

    stop(): void {
        this.aborted = true;
        this.closeCurrentRequest();
    }

    private closeCurrentRequest(): void {
        if (this.currentReq) this.currentReq.destroy();
        this.currentReq = null;
    }

    private consumeBuffer(chunk: string): void {
        this.buffer += chunk;
        let idx = this.buffer.indexOf(SSE_BLOCK_DELIMITER);
        while (idx !== -1) {
            const block = this.buffer.slice(0, idx);
            this.buffer = this.buffer.slice(idx + SSE_BLOCK_DELIMITER.length);
            if (block.includes(this.opts.eventMarker)) this.opts.onEvent();
            idx = this.buffer.indexOf(SSE_BLOCK_DELIMITER);
        }
    }

    private reconnect(): void {
        if (this.aborted) return;
        if (this.reconnectPending) return;
        this.reconnectPending = true;
        this.closeCurrentRequest();
        // eslint-disable-next-line lvi/no-timer-heuristic -- SSE protocol-level reconnect backoff
        setTimeout(() => {
            this.reconnectPending = false;
            this.open();
        }, SSE_RECONNECT_MS);
    }

    private wireResponse(res: http.IncomingMessage): void {
        res.setEncoding("utf8");
        const onClose = (): void => this.reconnect();
        res.on("data", (chunk: string) => this.consumeBuffer(chunk));
        res.on("end", onClose);
        res.on("error", onClose);
    }

    private describeError(err: Error & { code?: string }): string {
        if (err.message) return err.message;
        if (err.code) return err.code;
        return err.name || "unknown";
    }

    private open(): void {
        if (this.aborted) return;
        const token = requireApiToken();
        const url = localApiUrl(this.opts.path);
        const lib = selectLib(url);
        const req = lib.request(url, authedRequestOpts(token, "GET"));
        this.currentReq = req;
        req.on("response", (res) => this.wireResponse(res));
        req.on("error", (err: Error & { code?: string }) => {
            logger.warn(`SSE ${this.opts.name} stream error: ${this.describeError(err)}`);
            this.reconnect();
        });
        req.end();
    }
}

export function startSseSubscription(opts: SseSubscriptionOptions): () => void {
    const sub = new SseSubscription(opts);
    sub.start();
    return () => sub.stop();
}
