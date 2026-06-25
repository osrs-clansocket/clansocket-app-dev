import type { Instance } from "../../../../../../factory";
import {
    setVerificationLevel,
    setWelcomeScreen,
    type DiscordGuildSettings,
} from "../../../../../../../state/discord/client.js";
import { editCheck, editEnum, editText } from "../../../../../../discord/inspector/builders/section-builder.js";
import {
    VERIFICATION_OPTIONS,
    parseNum,
} from "../../../../../../../state/discord/guild-settings/mode-fields-options.js";

function changeVerification(s: DiscordGuildSettings, uid: string, next: string): void {
    const lvl = parseNum(next);
    if (lvl === null || lvl === s.verification_level) return;
    void setVerificationLevel(s.guild_id, {
        userId: uid,
        guildName: s.name,
        beforeLevel: s.verification_level,
        level: lvl,
    });
}

export function accessFields(s: DiscordGuildSettings, uid: string): Instance[] {
    return [
        editEnum("Verification level", VERIFICATION_OPTIONS, String(s.verification_level), (next) =>
            changeVerification(s, uid, next),
        ),
        editCheck("Welcome screen enabled", s.welcome_screen_enabled, (next) => {
            void setWelcomeScreen(s.guild_id, {
                userId: uid,
                guildName: s.name,
                enabled: next,
                description: s.welcome_screen_description,
            });
        }),
        editText("Welcome description", s.welcome_screen_description ?? "", (next) => {
            void setWelcomeScreen(s.guild_id, {
                userId: uid,
                guildName: s.name,
                enabled: s.welcome_screen_enabled,
                description: next.length > 0 ? next : null,
            });
        }),
    ];
}
