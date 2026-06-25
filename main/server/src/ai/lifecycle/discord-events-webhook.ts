import { MIME_JSON } from "../../shared/http/http-mime.js";

import logger from "@clansocket/logger";
import { summarizeEvent } from "./event-summarizers.js";

type EventEntry = { type: string; payload: Record<string, unknown> };

const queue: EventEntry[] = [];
const MAX_BATCH = 10;
const MAX_QUEUE = 200;
const MAX_BLOCK_CHARS = 1900;
const BLOCK_TRUNCATION_BUFFER = 4;

let draining = false;

function url(): string | null {
    const raw = process.env.DISCORD_EVENTS_WEBHOOK_URL;
    return typeof raw === "string" && raw.length > 0 ? raw : null;
}

async function postBatch(lines: string[]): Promise<void> {
    const target = url();
    if (!target || lines.length === 0) return;
    let block = "```\n" + lines.join("\n");
    if (block.length > MAX_BLOCK_CHARS) block = block.slice(0, MAX_BLOCK_CHARS - BLOCK_TRUNCATION_BUFFER) + "\n…";
    block += "\n```";
    try {
        await fetch(target, {
            method: "POST",
            headers: { "Content-Type": MIME_JSON },
            body: JSON.stringify({ content: block }),
        });
    } catch (err) {
        logger.error("[discord-events-webhook] post failed:", (err as Error).message);
    }
}

async function drain(): Promise<void> {
    if (draining || queue.length === 0) return;
    draining = true;
    try {
        while (queue.length > 0) {
            const batch = queue.splice(0, MAX_BATCH);
            await postBatch(batch.map(summarizeEvent));
        }
    } finally {
        draining = false;
    }
}

export function enqueueDiscordEvent(type: string, payload: Record<string, unknown>): void {
    if (!url()) return;
    if (queue.length >= MAX_QUEUE) queue.shift();
    queue.push({ type, payload });
    void drain();
}
