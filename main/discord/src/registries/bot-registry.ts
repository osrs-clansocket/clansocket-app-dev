import { Events, type Client } from "discord.js";
import logger from "@clansocket/logger";
import { BaseRegistry } from "../base/base-registry.js";
import { applyPresence } from "../core/presence.js";
import { syncEmojis } from "../emojis/sync.js";
import { createBotClient } from "../factories/client-factory.js";
import { registerEventHandlers } from "../handlers/command.js";
import { wireGatewayListeners } from "../handlers/gateway/index.js";
import { loadBots } from "../loaders/bots-loader.js";
import { loadBotServers } from "../loaders/bot-servers-loader.js";
import { drainPending } from "../outbound/dispatcher.js";
import { startOutboundSubscription } from "../outbound/subscriber.js";
import { drainSerially } from "../shared/queue-drainer.js";
import { drainPublishQueue } from "../publish-queue/dispatcher.js";
import "../publish-queue/handlers/_loader.js";
import { startSubscription } from "../publish-queue/subscriber.js";
import { publishSlashCommands } from "../publishers/slash-publisher.js";
import { noServers } from "../shared/no-servers.js";
import type { BotIdentity, BotState } from "../shared/types/bot-types.js";
import { backfillUnboundGuilds, syncChannelsRoles } from "../state-sync/ready-sync.js";
import { startBotsWatcher } from "../watchers/bots-watcher.js";

async function withInstalledGuilds(
    identity: BotIdentity,
    action: (server: { clan_id: string; guild_id: string }) => Promise<unknown>,
): Promise<number> {
    const servers = await loadBotServers(identity.bot_id);
    if (noServers(servers)) return 0;
    for (const server of servers) await action(server);
    return servers.length;
}

async function publishSlash(identity: BotIdentity): Promise<void> {
    const n = await withInstalledGuilds(identity, (s) => publishSlashCommands(identity, s.guild_id));
    if (n) {
        logger.info(`Slash commands registered for ${n} guild(s) (bot=${identity.bot_id})`);
        return;
    }
    logger.info(`No installed guilds for bot ${identity.bot_id}; skipping slash registration`);
}

async function subscribeAll(identity: BotIdentity, client: Client): Promise<void> {
    const n = await withInstalledGuilds(identity, async (s) => {
        startSubscription(s.clan_id, s.guild_id, client);
        await drainPublishQueue(s.clan_id, s.guild_id, client);
    });
    if (n > 0) logger.info(`Publish-queue subscribed for ${n} guild(s) (bot=${identity.bot_id})`);
}

async function startBot(identity: BotIdentity): Promise<BotState> {
    const client = createBotClient(identity);
    client.once(Events.ClientReady, async () => {
        try {
            registerEventHandlers(client, identity);
            wireGatewayListeners(client);
            await publishSlash(identity);
            await applyPresence(client, identity);
            startOutboundSubscription(identity.bot_id, client);
            await drainPending(identity.bot_id, client);
            await backfillUnboundGuilds(identity, client);
            await subscribeAll(identity, client);
            await syncChannelsRoles(identity, client);
            await syncEmojis(identity);
            logger.info(`Logged in as ${client.user!.tag} (bot_id=${identity.bot_id})`);
        } catch (err) {
            logger.error(`Bot init failed for ${identity.bot_id}: ${(err as Error).message}`);
            process.exit(1);
        }
    });
    await client.login(identity.token);
    return { identity, client };
}

class BotRegistry extends BaseRegistry<string, BotState> {
    private async spawnInitialBots(identities: readonly BotIdentity[]): Promise<void> {
        for (const identity of identities) {
            const state = await startBot(identity);
            this.register(identity.bot_id, state);
        }
    }

    async load(): Promise<void> {
        const identities = await loadBots();
        await this.spawnInitialBots(identities);
        logger.info(`BotRegistry initialized with ${this.size()} bot(s)`);
    }

    private async spawnOne(identity: BotIdentity): Promise<boolean> {
        try {
            const state = await startBot(identity);
            this.register(identity.bot_id, state);
            logger.info(`Hot-spawned new bot ${identity.bot_id}`);
            return true;
        } catch (err) {
            logger.warn(`Hot-spawn failed for ${identity.bot_id}: ${(err as Error).message}`);
            return false;
        }
    }

    private async tearDownOne(botId: string, state: BotState): Promise<boolean> {
        try {
            await state.client.destroy();
        } catch (err) {
            logger.warn(`Bot ${botId} destroy failed: ${(err as Error).message}`);
        }
        this.unregister(botId);
        logger.info(`Tore down removed bot ${botId}`);
        return true;
    }

    private spawnNewBots(fresh: readonly BotIdentity[]): Promise<number> {
        return drainSerially(
            fresh,
            (i) => this.has(i.bot_id),
            (i) => this.spawnOne(i),
        );
    }

    private tearDownBots(freshIds: ReadonlySet<string>): Promise<number> {
        return drainSerially(
            this.entries.entries(),
            ([id]) => freshIds.has(id),
            ([id, s]) => this.tearDownOne(id, s),
        );
    }

    async reconcile(): Promise<void> {
        const fresh = await loadBots();
        const freshIds = new Set(fresh.map((b) => b.bot_id));
        const spawned = await this.spawnNewBots(fresh);
        const removed = await this.tearDownBots(freshIds);
        if (spawned > 0 || removed > 0) {
            logger.info(`BotRegistry reconciled: +${spawned} -${removed} (size=${this.size()})`);
        }
    }
}

export const botRegistry = new BotRegistry();

export async function initBotRegistry(): Promise<void> {
    await botRegistry.load();
    startBotsWatcher(() => botRegistry.reconcile());
    logger.info("BotRegistry watcher started -- bot identities now hot-reload on insert/invalidate");
}
