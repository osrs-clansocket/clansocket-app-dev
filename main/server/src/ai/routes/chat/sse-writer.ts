import type { Response } from "express";
import { isResponseClosed } from "./predicate-response-closed.js";

function writeFrame(res: Response, frame: string): boolean {
    if (isResponseClosed(res)) return false;
    return res.write(frame);
}

export function writeSseEvent(res: Response, payload: Record<string, unknown>): boolean {
    return writeFrame(res, `data: ${JSON.stringify(payload)}\n\n`);
}

export function writeSseComment(res: Response, comment: string): void {
    writeFrame(res, `: ${comment}\n\n`);
}
