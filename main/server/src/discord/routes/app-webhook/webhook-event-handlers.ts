import logger from "@clansocket/logger";

const INTEGRATION_GUILD = 0;
const INTEGRATION_USER = 1;

interface AuthorizedData {
    integration_type: number;
    user?: { id: string };
    scopes?: string[];
    guild?: { id: string; name?: string };
}

interface DeauthorizedData {
    user?: { id: string };
}

function logAuthorized(data: unknown): void {
    const d = data as AuthorizedData;
    if (d.integration_type === INTEGRATION_GUILD && d.guild) {
        const scopes = (d.scopes ?? []).join(",");
        logger.info(
            `[discord-webhook] AUTHORIZED guild_id=${d.guild.id} guild_name=${d.guild.name ?? ""} installer_user_id=${d.user?.id ?? ""} scopes=${scopes}`,
        );
        return;
    }
    if (d.integration_type === INTEGRATION_USER) {
        const scopes = (d.scopes ?? []).join(",");
        logger.info(`[discord-webhook] AUTHORIZED user_install user_id=${d.user?.id ?? ""} scopes=${scopes}`);
        return;
    }
    logger.info(`[discord-webhook] AUTHORIZED integration_type=${d.integration_type} (unrecognized)`);
}

function logDeauthorized(data: unknown): void {
    const d = data as DeauthorizedData;
    logger.info(`[discord-webhook] DEAUTHORIZED user_id=${d.user?.id ?? ""}`);
}

const EVENT_HANDLERS: Record<string, (data: unknown) => void> = {
    APPLICATION_AUTHORIZED: logAuthorized,
    APPLICATION_DEAUTHORIZED: logDeauthorized,
};

export function dispatchEvent(event: { type: string; data: unknown }): void {
    const handler = EVENT_HANDLERS[event.type];
    if (handler) {
        handler(event.data);
        return;
    }
    logger.info(`[discord-webhook] event=${event.type} (unhandled)`);
}
