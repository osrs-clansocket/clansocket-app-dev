import type { Response } from "express";

function isResponseClosed(res: Response): boolean {
    return res.writableEnded || res.destroyed;
}

export function writeSseEvent(res: Response, payload: Record<string, unknown>): boolean {
    if (isResponseClosed(res)) return false;
    return res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

export function writeSseComment(res: Response, comment: string): void {
    if (isResponseClosed(res)) return;
    res.write(`: ${comment}\n\n`);
}
