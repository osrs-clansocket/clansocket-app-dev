import { formatClientProfile } from "../format-profile.js";
import type { ProfileContext } from "../types.js";

export function profileSection(profile: ProfileContext | null | undefined, historyWindow: number): string | null {
    if (!profile) return null;
    return `[PROMPT: user-profile]\n## User Profile (persisted in the client browser — you emit this back each turn in \`profile_context\`)\n\n${formatClientProfile(profile, historyWindow)}`;
}
