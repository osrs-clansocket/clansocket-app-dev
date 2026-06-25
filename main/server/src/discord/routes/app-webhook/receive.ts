import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { verifyEd25519 } from "../../../crypto/ed25519-verifier.js";
import { HTTP_NO_CONTENT, HTTP_UNAUTHORIZED } from "../../../shared/http/http-status.js";
import { dispatchEvent } from "./webhook-event-handlers.js";

import { mountedRouter } from "../_mount-registry.js";

const WEBHOOK_TYPE_EVENT = 1;

interface WebhookEnvelope {
    version: number;
    application_id: string;
    type: number;
    event?: { type: string; timestamp: string; data: unknown };
}

function validateExtractBody(req: Request): Buffer | null {
    const signature = req.header("x-signature-ed25519");
    const timestamp = req.header("x-signature-timestamp");
    const publicKey = process.env.DISCORD_PUBLIC_KEY;
    const rawBody = (req as any).rawBody as Buffer | undefined;
    if (!signature || !timestamp || !publicKey || !rawBody) return null;
    return verifyEd25519(signature, timestamp, rawBody, publicKey) ? rawBody : null;
}

function processEnvelope(envelope: WebhookEnvelope, res: Response): void {
    if (envelope.type === WEBHOOK_TYPE_EVENT && envelope.event) {
        try {
            dispatchEvent(envelope.event);
        } catch (err) {
            logger.error(`[discord-webhook] dispatch failed: ${(err as Error).message}`);
        }
    }
    res.status(HTTP_NO_CONTENT).end();
}

const router = mountedRouter("/app-webhook");

(() => {
    router.post("/", (req: Request, res: Response) => {
        if (!validateExtractBody(req)) {
            res.status(HTTP_UNAUTHORIZED).end();
            return;
        }
        processEnvelope(req.body as WebhookEnvelope, res);
    });
})();

export default router;
