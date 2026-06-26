import type { Client, PermissionResolvable } from "discord.js";
import { FALLBACK_UNKNOWN } from "../core/constants.js";
import { BaseQueueRunner, loadAndDrain } from "../base/base-queue-runner.js";
import { pendingPublishQueue, type PendingPublishRow } from "../loaders/publish-queue-loader.js";
import { failAndWarn } from "../shared/transitions/fail-and-warn.js";
import { validateBotPermission } from "../validators/bot-permission.js";
import { lookupPublisher } from "./publisher-registry.js";
import type { PublisherRegistration } from "./publisher-types.js";
import { transitionApplied, transitionFailed, transitionInFlight } from "./transition.js";

interface PublishResult {
    snowflakeResolved?: string | null;
}

class PublishRunner extends BaseQueueRunner<PendingPublishRow, PublisherRegistration, PublishResult> {
    constructor(
        private readonly clanId: string,
        private readonly client: Client,
    ) {
        super();
    }

    private fail(row: PendingPublishRow, payload: string, message: string): Promise<void> {
        return failAndWarn(() => transitionFailed(this.clanId, row.guild_id, row.queue_id, payload), message);
    }

    protected claim(row: PendingPublishRow): Promise<boolean> {
        return transitionInFlight(this.clanId, row.guild_id, row.queue_id);
    }

    protected lookupRegistration(row: PendingPublishRow): PublisherRegistration | null {
        return lookupPublisher(row.op_kind, row.target_kind) ?? null;
    }

    protected async gate(row: PendingPublishRow, reg: PublisherRegistration): Promise<boolean> {
        const perm = reg.requiredBotPermission;
        if (!perm) return true;
        const ok = await validateBotPermission({
            client: this.client,
            guildId: row.guild_id,
            requiredPermission: perm,
        });
        if (ok) return true;
        await this.failGate(row, perm);
        return false;
    }

    private failGate(row: PendingPublishRow, perm: PermissionResolvable): Promise<void> {
        const payload = JSON.stringify({ error: "bot_permission_denied", permission: String(perm) });
        const msg = `Bot lacks ${String(perm)} for ${row.target_kind} in guild ${row.guild_id}`;
        return this.fail(row, payload, msg);
    }

    protected runHandler(row: PendingPublishRow, reg: PublisherRegistration): Promise<PublishResult> {
        return reg.handler(this.client, row);
    }

    protected async markApplied(row: PendingPublishRow, result: PublishResult): Promise<void> {
        await transitionApplied(this.clanId, row.guild_id, row.queue_id, result.snowflakeResolved ?? null);
    }

    protected markFailed(row: PendingPublishRow, err: unknown): Promise<void> {
        const msg = (err as { message?: string }).message ?? FALLBACK_UNKNOWN;
        return this.fail(row, JSON.stringify({ message: msg }), `Publish dispatch failed for ${row.queue_id}: ${msg}`);
    }

    protected markUnhandled(row: PendingPublishRow): Promise<void> {
        const msg = `Publish handler missing for ${row.op_kind}:${row.target_kind}`;
        return this.fail(row, JSON.stringify({ error: "no_handler" }), msg);
    }
}

export function drainPublishQueue(clanId: string, guildId: string, client: Client): Promise<number> {
    return loadAndDrain(() => pendingPublishQueue(clanId, guildId), new PublishRunner(clanId, client));
}
