import type { Request, Response } from "express";
import { openNamedStream, writeNamedEvent } from "../../shared/http/sse-stream.js";
import { registerWriteListener, type DbWriteEvent } from "./writes-stream.js";

export interface StreamExtras {
    kindFilter?: string;
    emitPayload?: (event: DbWriteEvent) => object;
}

export interface StreamArgs {
    req: Request;
    res: Response;
    scopeKey: string;
    tables: readonly string[];
    eventName: string;
    readyData: object;
    extras?: StreamExtras;
}

export function streamDbChanges(args: StreamArgs): void {
    const { req, res, scopeKey, tables, eventName, readyData, extras = {} } = args;
    openNamedStream(res, readyData);
    const unsubscribe = registerWriteListener((event) => {
        if (event.scopeKey !== scopeKey) return;
        if (!tables.includes(event.table)) return;
        if (extras.kindFilter !== undefined && event.kind !== extras.kindFilter) return;
        const payload = extras.emitPayload ? extras.emitPayload(event) : readyData;
        writeNamedEvent(res, eventName, payload);
    });
    req.on("close", () => unsubscribe());
}
