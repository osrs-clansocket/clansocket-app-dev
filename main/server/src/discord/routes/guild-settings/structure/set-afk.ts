import { ClanAuditActions } from "../../../../database/clans/audit/clan-audit-actions.js";
import { mutationRoute } from "../../route-common/mutation-route.js";
import { MOUNT_GUILD_SETTINGS, RATE_LIMIT_GUILD } from "../../route-common/route-paths.js";

import { registerMount } from "../../_mount-registry.js";
import { TARGET_DISCORD_GUILD_SETTINGS } from "../../route-common/target-kinds.js";
interface SetAfkBody {
    userId: string;
    guildName: string;
    beforeAfkChannelId: string | null;
    afkChannelId: string | null;
    beforeAfkTimeout: number | null;
    afkTimeout: number | null;
}

function buildAfkPayload(body: SetAfkBody, guildId: string) {
    const state = (afkChannelId: string | null, afkTimeout: number | null) => ({
        afkChannelId,
        afkTimeout,
        subject: "afk",
    });
    return {
        actorUserId: body.userId,
        targetIdOrTemp: guildId,
        before: state(body.beforeAfkChannelId, body.beforeAfkTimeout),
        after: state(body.afkChannelId, body.afkTimeout),
        auditPayload: {
            guildId,
            targetName: body.guildName,
            beforeAfkChannelId: body.beforeAfkChannelId,
            afterAfkChannelId: body.afkChannelId,
            beforeAfkTimeout: body.beforeAfkTimeout,
            afterAfkTimeout: body.afkTimeout,
        },
    };
}

const router = mutationRoute({
    method: "patch",
    path: "/:guildId/afk",
    targetKind: TARGET_DISCORD_GUILD_SETTINGS,
    opKind: "update",
    clansocketPermission: "discord:guild-settings.set-afk",
    rateLimitRoute: RATE_LIMIT_GUILD,
    auditAction: ClanAuditActions.DiscordGuildSettingsSetAfk,
    failureCode: "set_afk_failed",
    buildPayload: (req) => buildAfkPayload(req.body as SetAfkBody, req.params.guildId as string),
});
registerMount(MOUNT_GUILD_SETTINGS, router);
export default router;
