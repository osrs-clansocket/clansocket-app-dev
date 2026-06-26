import { ClanAuditActions } from "../../../../database/clans/audit/clan-audit-actions.js";
import type { WelcomeScreenChannel } from "../../../../database/discord/state/types.js";
import { mutationRoute } from "../../route-common/mutation-route.js";

import { registerMount } from "../../_mount-registry.js";
import { TARGET_DISCORD_GUILD_SETTINGS } from "../../route-common/target-kinds.js";
interface WelcomeScreenBody {
    userId: string;
    guildName: string;
    enabled: boolean;
    description?: string | null;
    welcomeChannels?: WelcomeScreenChannel[];
}

const router = mutationRoute({
    method: "patch",
    path: "/:guildId/welcome-screen",
    targetKind: TARGET_DISCORD_GUILD_SETTINGS,
    opKind: "update",
    clansocketPermission: "discord:guild-settings.set-welcome-screen",
    rateLimitRoute: "/guilds/:id",
    auditAction: ClanAuditActions.DiscordGuildSettingsSetWelcomeScreen,
    failureCode: "set_welcome_screen_failed",
    buildPayload: (req) => {
        const body = req.body as WelcomeScreenBody;
        const guildId = req.params.guildId as string;
        const description = body.description ?? null;
        const state = (enabled: boolean | null, ch: WelcomeScreenChannel[] | null, desc: string | null) => ({
            enabled,
            subject: "welcome-screen",
            description: desc,
            welcomeChannels: ch,
        });
        return {
            actorUserId: body.userId,
            targetIdOrTemp: guildId,
            before: state(null, null, null),
            after: state(body.enabled, body.welcomeChannels ?? [], description),
            auditPayload: { targetName: body.guildName, enabled: body.enabled, guildId, description },
        };
    },
});
registerMount("/guild-settings", router);
export default router;
