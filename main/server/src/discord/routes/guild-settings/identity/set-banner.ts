import { ClanAuditActions } from "../../../../database/clans/audit/clan-audit-actions.js";
import { mutationRoute } from "../../route-common/mutation-route.js";

import { registerMount } from "../../_mount-registry.js";
import { TARGET_DISCORD_GUILD_SETTINGS } from "../../route-common/target-kinds.js";
interface SetBannerBody {
    userId: string;
    guildName: string;
    beforeBannerUrl: string | null;
    bannerDataUrl: string | null;
    afterBannerUrl: string | null;
}

const router = mutationRoute({
    method: "patch",
    path: "/:guildId/banner",
    targetKind: TARGET_DISCORD_GUILD_SETTINGS,
    opKind: "update",
    clansocketPermission: "discord:guild-settings.set-banner",
    rateLimitRoute: "/guilds/:id",
    auditAction: ClanAuditActions.DiscordGuildSettingsSetBanner,
    failureCode: "set_banner_failed",
    buildPayload: (req) => {
        const body = req.body as SetBannerBody;
        const guildId = req.params.guildId as string;
        return {
            actorUserId: body.userId,
            targetIdOrTemp: guildId,
            before: { subject: "banner", bannerUrl: body.beforeBannerUrl },
            after: { subject: "banner", bannerDataUrl: body.bannerDataUrl },
            auditPayload: {
                guildId,
                targetName: body.guildName,
                beforeBannerUrl: body.beforeBannerUrl,
                afterBannerUrl: body.afterBannerUrl,
            },
        };
    },
});
registerMount("/guild-settings", router);
export default router;
