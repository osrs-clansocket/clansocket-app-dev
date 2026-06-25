import type { DiscordChannelOverwrite } from "../../../../state/discord/client.js";
import { targetIdOf } from "./permission-target.js";
import { safeBigInt } from "./permission-format.js";

export function matchingBaseBits(
    existing: readonly DiscordChannelOverwrite[],
    channelId: string,
    kind: "role" | "member",
    targetId: string,
): { allow: bigint; deny: bigint } {
    const match = existing.find((o) => o.channel_id === channelId && o.kind === kind && targetIdOf(o) === targetId);
    return {
        allow: match ? safeBigInt(match.allow) : 0n,
        deny: match ? safeBigInt(match.deny) : 0n,
    };
}
