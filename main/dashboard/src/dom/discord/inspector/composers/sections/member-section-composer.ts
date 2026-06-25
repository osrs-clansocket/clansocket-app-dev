import { derived, type Instance } from "../../../../factory";
import type { DiscordMember } from "../../../../../state/discord/client.js";
import { editText, imagePreview, buildReadonlySection } from "../../builders/section-builder.js";
import { formatMemberFlags } from "./member-flags-format.js";
import { saveMemberNickname } from "./member-nickname-save.js";
import { formatTimestamp, optionalTimestampSections } from "./member-timestamp.js";
import { rolesNamesDerived } from "./member-roles.js";

const NONE_VALUE = "—";

export function memberSections(member: DiscordMember): Instance[] {
    return [
        buildReadonlySection({ title: "Username", value: member.name }),
        buildReadonlySection({ title: "Display name", value: member.display_name ?? NONE_VALUE }),
        editText("Nickname", member.nickname ?? "", (next) => void saveMemberNickname(member, next)),
        buildReadonlySection({ title: "User ID", value: member.user_id }),
        buildReadonlySection({ title: "Joined", value: formatTimestamp(member.joined_at) }),
        buildReadonlySection({ title: "Roles", value: derived(rolesNamesDerived(member)) }),
        buildReadonlySection({ title: "Bot account", value: member.is_bot ? "yes" : "no" }),
        buildReadonlySection({ title: "Boosting", value: member.is_boosting ? "yes" : "no" }),
        buildReadonlySection({
            title: "Verification pending",
            value: member.pending ? "yes — not yet completed onboarding/rules" : "no",
        }),
        buildReadonlySection({ title: "Member flags", value: formatMemberFlags(member.flags) }),
        ...optionalTimestampSections(member),
        imagePreview("Avatar URL", member.avatar_url),
    ];
}
