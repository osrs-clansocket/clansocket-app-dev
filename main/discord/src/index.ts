import logger from "@clansocket/logger";
import { initBotRegistry } from "./registries/bot-registry.js";
import shutdown from "./core/shutdown.js";

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("uncaughtException", (error: Error) => {
    logger.error("Uncaught exception:", error);
    shutdown();
});

initBotRegistry().catch((error: Error & { code?: string }) => {
    const detail = error.message || error.code || error.name || "unknown";
    logger.error(`Failed to initialize BotRegistry: ${detail}`, error);
    process.exit(1);
});
