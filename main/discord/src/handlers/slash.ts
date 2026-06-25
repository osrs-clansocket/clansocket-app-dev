import { checkCommandPermission } from "../security/permissions.js";
import { postAuditLog as insertAuditLog } from "../core/api-client.js";
import { AUDIT_ACTIONS, HANDLER_MESSAGES } from "../core/constants.js";
import { ephemeralReply, replyOrEdit } from "./interaction-reply.js";
import { enforceTarget } from "./rate-limit.js";
import { runPluginError } from "./plugin/error-handler.js";
import "../plugins/_loader.js";
import { slashRegistry } from "../plugins/plugin-registry.js";
import type { BotContext } from "../shared/types/bot-types.js";
import logger from "@clansocket/logger";

const ALLOWED = 1;
const DENIED = 0;

async function auditAction(guildId: any, userId: any, action: any, data: any) {
    if (guildId) {
        await insertAuditLog(guildId, userId, action, data);
    }
}

async function checkGuildLimits({ interaction, userId, guildId, plugin, commandName }: any) {
    const allowed = await enforceTarget(interaction, commandName, { command: commandName });
    if (allowed === false) {
        return DENIED;
    }

    const requiredPerm = plugin.permission;
    if (requiredPerm && !(await checkCommandPermission(userId, guildId, requiredPerm))) {
        await interaction.reply(ephemeralReply(HANDLER_MESSAGES.PERMISSION_DENIED));
        await auditAction(guildId, userId, AUDIT_ACTIONS.PERMISSION_DENIED, { command: commandName });
        return DENIED;
    }
    return ALLOWED;
}

async function replyWithError(interaction: any, plugin: any, commandError: any) {
    await runPluginError(plugin, interaction, commandError, () =>
        replyOrEdit(interaction, ephemeralReply(HANDLER_MESSAGES.COMMAND_ERROR)),
    );
}

async function handleSlashError({ commandName, guildId, userId, interaction, plugin, botCtx }: any, commandError: any) {
    logger.error(`Slash command ${commandName} error (bot=${botCtx.botId} clan=${botCtx.clanId}):`, {
        error: commandError.message,
    });
    await auditAction(guildId, userId, AUDIT_ACTIONS.ERROR_OCCURRED, {
        command: commandName,
        error: commandError.message,
    });
    await replyWithError(interaction, plugin, commandError);
}

async function tryExecutePlugin(ctx: any) {
    if ((await checkGuildLimits(ctx)) === DENIED) return;
    await ctx.plugin.execute(ctx.interaction);
    await auditAction(ctx.guildId, ctx.userId, AUDIT_ACTIONS.COMMAND_EXECUTED, {
        command: ctx.commandName,
        options: ctx.interaction.options.data,
    });
}

async function processSlashCommand(interaction: any, botCtx: BotContext) {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;
    if (!slashRegistry.has(commandName)) {
        await interaction.reply(ephemeralReply(HANDLER_MESSAGES.UNKNOWN_COMMAND));
        return;
    }
    const plugin = slashRegistry.get(commandName);
    const userId = interaction.user.id;
    const guildId = botCtx.guildId;
    const ctx = { commandName, guildId, userId, interaction, plugin, botCtx };
    try {
        await tryExecutePlugin(ctx);
    } catch (commandError: any) {
        await handleSlashError(ctx, commandError);
    }
}

function slashCommandData() {
    return slashRegistry
        .list()
        .filter((plugin: any) => plugin.data)
        .map((plugin: any) => plugin.data);
}

export { slashCommandData, processSlashCommand };
