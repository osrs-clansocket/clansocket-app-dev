import logger from "@clansocket/logger";

const INTEGRATION_GUILD = 0;
const INTEGRATION_USER = 1;

const EVENT_HANDLERS: Record<string, (data: unknown) => void> = {
    APPLICATION_AUTHORIZED: (data) => {
        const d = data as {
            integration_type: number;
            user?: { id: string };
            scopes?: string[];
            guild?: { id: string; name?: string };
        };
        const scopes = (d.scopes ?? []).join(",");
        if (d.integration_type === INTEGRATION_GUILD && d.guild) {
            logger.info(
                `[discord-webhook] AUTHORIZED guild_id=${d.guild.id} guild_name=${d.guild.name ?? ""} installer_user_id=${d.user?.id ?? ""} scopes=${scopes}`,
            );
        } else if (d.integration_type === INTEGRATION_USER) {
            logger.info(`[discord-webhook] AUTHORIZED user_install user_id=${d.user?.id ?? ""} scopes=${scopes}`);
        } else {
            logger.info(`[discord-webhook] AUTHORIZED integration_type=${d.integration_type} (unrecognized)`);
        }
    },
    APPLICATION_DEAUTHORIZED: (data) => {
        const d = data as { user?: { id: string } };
        logger.info(`[discord-webhook] DEAUTHORIZED user_id=${d.user?.id ?? ""}`);
    },
};

export function dispatchEvent(event: { type: string; data: unknown }): void {
    const handler = EVENT_HANDLERS[event.type];
    if (handler) {
        handler(event.data);
        return;
    }
    logger.info(`[discord-webhook] event=${event.type} (unhandled)`);
}
