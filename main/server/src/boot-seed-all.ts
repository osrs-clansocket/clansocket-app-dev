import logger from "@clansocket/logger";
import { seedBotIdentity } from "./database/discord/seed-default.js";
import { seedPresenceTemplate } from "./database/discord/presence/seed-default-template.js";
import { registerVaultEntry } from "./discord/byo-bot/registrars/vault-registrar.js";
import { registerWomVault } from "./wom/registrars/vault-registrar.js";

export function seedAll(): void {
    registerVaultEntry();
    registerWomVault();
    const seeded = seedBotIdentity();
    if (seeded) logger.info("seeded clansocket-default discord bot identity from env");
    seedPresenceTemplate();
}
