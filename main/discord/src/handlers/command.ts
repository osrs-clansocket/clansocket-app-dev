import logger from "@clansocket/logger";
import { dispatchEvent, eventErrCtx } from "../dispatchers/event-dispatcher.js";
import { trackInteractionPending, triggerInteractionCleanup } from "../interactions/ttl-tracker.js";
import { serverRegistry } from "../registries/server-registry.js";
import type { BotIdentity } from "../shared/types/bot-types.js";
import { autoBindServer } from "../state-sync/auto-bind.js";
import { syncOneGuild } from "../state-sync/ready-sync.js";
import { logAuditServerAdd, logAuditServerRemove, logAuditUserJoin, logAuditUserLeave } from "./audit.js";
import { processInteraction } from "./interaction/index.js";
import { processMessage } from "./message/index.js";
import { processSlashCommand } from "./slash.js";

function safeHandler(fn: any, label: any) {
    return async (arg: any) => {
        try {
            await fn(arg);
        } catch (err: any) {
            logger.error(`${label} error:`, err);
        }
    };
}

const handleMemberAdd = safeHandler(
    (member: any) => logAuditUserJoin(member.guild.id, member.user.id),
    "Guild member add",
);
const handleMemberRemove = safeHandler(
    (member: any) => logAuditUserLeave(member.guild.id, member.user.id),
    "Guild member remove",
);

const handleGuildChange = (logFn: any, infoFn: any) =>
    safeHandler(async (guild: any) => {
        await logFn(guild.id);
        serverRegistry.invalidate(guild.id);
        infoFn(guild);
    }, "Guild event");

async function resolveMemberCount(guild: any): Promise<number> {
    try {
        const fresh = await guild.client.guilds.fetch({ guild: guild.id, withCounts: true });
        return fresh.approximateMemberCount ?? guild.memberCount ?? 0;
    } catch {
        return guild.memberCount ?? 0;
    }
}

function guildCreateHandler(identity: BotIdentity) {
    return safeHandler(async (guild: any) => {
        await logAuditServerAdd(guild.id);
        serverRegistry.invalidate(guild.id);
        const memberCount = await resolveMemberCount(guild);
        logger.info(`Joined server: ${guild.name} (${memberCount} members)`);
        try {
            await syncOneGuild(guild.id, guild, identity.bot_id, identity.bot_name);
        } catch (err) {
            logger.warn(`syncOneGuild failed for guild ${guild.id}: ${(err as Error).message}`);
        }
        try {
            await autoBindServer(identity.bot_id, guild.id, guild.name);
        } catch (err) {
            logger.warn(`Auto-bind failed for bot=${identity.bot_id} guild=${guild.id}: ${(err as Error).message}`);
        }
    }, "Guild create");
}
const handleGuildDelete = handleGuildChange(logAuditServerRemove, (g: any) => logger.info(`Left server: ${g.name}`));

function buildDispatch<T>(label: string, idKey: string, process: (item: T, ctx: any) => Promise<void>) {
    return {
        label,
        process,
        errCtx: (ctx: any, item: any) => eventErrCtx(ctx, (item.user ?? item.author)?.id, idKey, item.id),
    };
}

function onInteractionCreate(intr: any, identity: BotIdentity) {
    trackInteractionPending(intr).catch(() => undefined);
    triggerInteractionCleanup().catch(() => undefined);
    return dispatchEvent(
        intr,
        identity,
        buildDispatch("Interaction", "interactionId", async (i: any, ctx: any) => {
            if (i.isChatInputCommand()) {
                await processSlashCommand(i, ctx);
            } else {
                await processInteraction(i, ctx);
            }
        }),
    );
}

export function registerEventHandlers(client: any, identity: BotIdentity) {
    client.on("messageCreate", (m: any) =>
        dispatchEvent(
            m,
            identity,
            buildDispatch("Message", "messageId", async (msg: any, ctx: any) => {
                await processMessage(msg, ctx);
            }),
        ),
    );
    client.on("interactionCreate", (i: any) => onInteractionCreate(i, identity));
    client.on("guildMemberAdd", handleMemberAdd);
    client.on("guildMemberRemove", handleMemberRemove);
    client.on("guildCreate", guildCreateHandler(identity));
    client.on("guildDelete", handleGuildDelete);
}
