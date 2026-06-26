import type { Client } from "discord.js";
import { FALLBACK_UNKNOWN } from "../core/constants.js";
import { BaseQueueRunner, loadAndDrain } from "../base/base-queue-runner.js";
import { loadPendingOutbound, type PendingOutboundRow } from "../loaders/outbound-loader.js";
import { failAndWarn } from "../shared/transitions/fail-and-warn.js";
import { lookupSender, type Sender } from "./sender-registry.js";
import "./senders/_loader.js";
import { transitionApplied, transitionFailed, transitionInFlight } from "./transition.js";

const HTTP_INTERNAL = 500;

class OutboundRunner extends BaseQueueRunner<PendingOutboundRow, Sender, string | null> {
    constructor(private readonly client: Client) {
        super();
    }

    protected claim(row: PendingOutboundRow): Promise<boolean> {
        return transitionInFlight(row.queue_id);
    }

    protected lookupRegistration(row: PendingOutboundRow): Sender | null {
        return lookupSender(row.target_kind) ?? null;
    }

    protected async gate(): Promise<boolean> {
        return true;
    }

    protected runHandler(row: PendingOutboundRow, sender: Sender): Promise<string | null> {
        return sender(this.client, row);
    }

    protected async markApplied(row: PendingOutboundRow, responseId: string | null): Promise<void> {
        await transitionApplied(row.queue_id, responseId);
    }

    protected markFailed(row: PendingOutboundRow, err: unknown): Promise<void> {
        const e = err as { code?: number; message?: string };
        const code = typeof e.code === "number" ? e.code : HTTP_INTERNAL;
        const msg = `Outbound dispatch failed for ${row.queue_id}: ${e.message ?? FALLBACK_UNKNOWN}`;
        return failAndWarn(() => transitionFailed(row.queue_id, code, row.attempts + 1, null), msg);
    }

    protected markUnhandled(row: PendingOutboundRow): Promise<void> {
        const msg = `Outbound dispatch unsupported target_kind: ${row.target_kind}`;
        return failAndWarn(() => transitionFailed(row.queue_id, HTTP_INTERNAL, row.attempts + 1, null), msg);
    }
}

export function drainPending(botId: string, client: Client): Promise<number> {
    return loadAndDrain(() => loadPendingOutbound(botId), new OutboundRunner(client));
}
