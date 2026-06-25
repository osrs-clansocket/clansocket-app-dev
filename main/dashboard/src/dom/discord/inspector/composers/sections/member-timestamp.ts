import type { Instance } from "../../../../factory";
import type { DiscordMember } from "../../../../../state/discord/client.js";
import { buildReadonlySection } from "../../builders/section-builder.js";

const NONE_VALUE = "—";
const ISO_DATE_END = 16;

export function formatTimestamp(ms: number | null): string {
    if (ms === null) return NONE_VALUE;
    return new Date(ms).toISOString().slice(0, ISO_DATE_END).replace("T", " ");
}

export function optionalTimestampSections(member: DiscordMember): Instance[] {
    const out: Instance[] = [];
    if (member.premium_since !== null) {
        out.push(buildReadonlySection({ title: "Boosting since", value: formatTimestamp(member.premium_since) }));
    }
    if (member.communication_disabled_until !== null) {
        out.push(
            buildReadonlySection({
                title: "Timeout until",
                value: formatTimestamp(member.communication_disabled_until),
            }),
        );
    }
    return out;
}
