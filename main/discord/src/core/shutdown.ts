import logger from "@clansocket/logger";
import { botRegistry } from "../registries/bot-registry.js";

let isShuttingDown = false;

async function destroyOneBot(state: {
    client: { isReady: () => boolean; destroy: () => Promise<void> };
    identity: { bot_id: string };
}): Promise<void> {
    try {
        if (state.client.isReady()) {
            await state.client.destroy();
            logger.info(`Discord client disconnected (bot_id=${state.identity.bot_id})`);
        }
    } catch (err) {
        logger.error(`Error during client shutdown for ${state.identity.bot_id}: ${(err as Error).message}`);
    }
}

async function destroyBotClients(): Promise<void> {
    await Promise.all(botRegistry.list().map(destroyOneBot));
}

async function shutdown(): Promise<void> {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.info("Shutting down gracefully...");
    await destroyBotClients();
    botRegistry.clear();
    logger.info("Shutdown complete");
    process.exit(0);
}

export default shutdown;
