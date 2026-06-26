import type { Response } from "express";

export function isResponseClosed(res: Response): boolean {
    return res.writableEnded || res.destroyed;
}
