import { PermissionsBitField, type Guild } from "discord.js";
import { orThrow } from "../../../shared/nullable.js";
import { registerPublisher } from "../../publisher-registry.js";
import { OP_KINDS, ENTITY_TYPES } from "../../publish-vocab.js";
import { runPublishOp } from "../../runners/op-runner.js";

const SUBJECT_NAME = "name";
const SUBJECT_ICON = "icon";
const SUBJECT_BANNER = "banner";
const SUBJECT_DESCRIPTION = "description";
const SUBJECT_SYSTEM_CHANNEL = "system-channel";
const SUBJECT_AFK = "afk";
const SUBJECT_WELCOME_SCREEN = "welcome-screen";
const SUBJECT_VERIFICATION_LEVEL = "verification-level";

interface WelcomeChannelInput {
    channelId: string;
    description: string;
    emoji?: string | null;
}

type UpdateState =
    | { subject: typeof SUBJECT_NAME; name: string }
    | { subject: typeof SUBJECT_ICON; iconDataUrl: string | null }
    | { subject: typeof SUBJECT_BANNER; bannerDataUrl: string | null }
    | { subject: typeof SUBJECT_DESCRIPTION; description: string | null }
    | { subject: typeof SUBJECT_SYSTEM_CHANNEL; channelId: string | null }
    | { subject: typeof SUBJECT_AFK; afkChannelId: string | null; afkTimeout: number | null }
    | {
          subject: typeof SUBJECT_WELCOME_SCREEN;
          enabled: boolean;
          description: string | null;
          welcomeChannels: WelcomeChannelInput[];
      }
    | { subject: typeof SUBJECT_VERIFICATION_LEVEL; level: number };

const APPLIERS: Record<string, (guild: Guild, data: any) => Promise<unknown>> = {
    [SUBJECT_NAME]: (g, d) => g.setName(d.name),
    [SUBJECT_ICON]: (g, d) => g.setIcon(d.iconDataUrl),
    [SUBJECT_BANNER]: (g, d) => g.setBanner(d.bannerDataUrl),
    [SUBJECT_DESCRIPTION]: (g, d) => g.edit({ description: d.description }),
    [SUBJECT_SYSTEM_CHANNEL]: (g, d) => g.edit({ systemChannel: d.channelId }),
    [SUBJECT_AFK]: (g, d) => g.edit({ afkChannel: d.afkChannelId, afkTimeout: d.afkTimeout ?? undefined }),
    [SUBJECT_WELCOME_SCREEN]: (g, d) =>
        g.editWelcomeScreen({
            enabled: d.enabled,
            description: d.description ?? undefined,
            welcomeChannels: d.welcomeChannels.map((wc: WelcomeChannelInput) => ({
                channel: wc.channelId,
                description: wc.description,
                emoji: wc.emoji ?? undefined,
            })),
        }),
    [SUBJECT_VERIFICATION_LEVEL]: (g, d) => g.setVerificationLevel(d.level),
};

export async function applySettingsUpdate(guild: Guild, data: UpdateState): Promise<void> {
    const applier = orThrow(
        APPLIERS[data.subject],
        `unsupported guild-settings subject: ${(data as { subject: string }).subject}`,
    );
    await applier(guild, data);
}

registerPublisher(OP_KINDS.UPDATE, ENTITY_TYPES.GUILD_SETTINGS, {
    handler: (c, r) => runPublishOp(c, r, OP_KINDS.UPDATE, (g, d) => applySettingsUpdate(g, d as UpdateState)),
    requiredBotPermission: PermissionsBitField.Flags.ManageGuild,
});
