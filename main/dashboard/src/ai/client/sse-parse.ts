import type { EventFn, ServerEvent, StatusFn } from "./types.js";

const SSE_PREFIX = "data: ";
const SSE_DELIMITER = "\n\n";

export function emitChainEvent(
    ev: { type: string; payload: Record<string, unknown> },
    onStatus?: StatusFn,
    onEvent?: EventFn,
): void {
    if (ev.type === "status") {
        const status = (ev.payload as { status?: string }).status;
        if (status && onStatus) onStatus(status);
    } else if (onEvent) {
        onEvent(ev.type, ev.payload);
    }
}

function extractBlockData(block: string): string | null {
    const lines = block.split("\n");
    const dataParts: string[] = [];
    let started = false;
    for (const line of lines) {
        if (line.startsWith(SSE_PREFIX)) {
            dataParts.push(line.slice(SSE_PREFIX.length));
            started = true;
            continue;
        }
        if (started) dataParts.push(line);
    }
    if (!started) return null;
    const json = dataParts.join("\n");
    return json.length === 0 ? null : json;
}

function tryParseEvent(json: string): ServerEvent | null {
    try {
        return JSON.parse(json) as ServerEvent;
    } catch {
        return null;
    }
}

function maybeParseBlock(block: string): ServerEvent | null {
    const json = extractBlockData(block);
    if (json === null) return null;
    return tryParseEvent(json);
}

export function parseEvents(buffer: string): { events: ServerEvent[]; rest: string } {
    const events: ServerEvent[] = [];
    let cursor = 0;
    let idx = buffer.indexOf(SSE_DELIMITER, cursor);
    while (idx !== -1) {
        const block = buffer.slice(cursor, idx);
        cursor = idx + SSE_DELIMITER.length;
        const ev = maybeParseBlock(block);
        if (ev !== null) events.push(ev);
        idx = buffer.indexOf(SSE_DELIMITER, cursor);
    }
    return { events, rest: buffer.slice(cursor) };
}
