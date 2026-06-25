import { identityStore } from "../../../../../state/identity/stores/identity-store.js";
import { setMemberNickname, type DiscordMember } from "../../../../../state/discord/client.js";

export async function saveMemberNickname(member: DiscordMember, nextNick: string): Promise<void> {
    const session = identityStore.session$();
    if (session === null) return;
    const nextNickname = nextNick.length > 0 ? nextNick : null;
    await setMemberNickname(member.guild_id, {
        userId: session.id,
        targetUserId: member.user_id,
        targetUserName: member.name,
        beforeNickname: member.nickname,
        nickname: nextNickname,
    });
}
