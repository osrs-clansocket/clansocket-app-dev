import { icon, inlineConfirm, TREE_ICON_CLASS, type Instance, type TreeNode } from "../../../../../../factory";
import { displayLabelFor } from "../../../../../../../state/discord/members/mappers/member-mapper.js";
import { identityStore } from "../../../../../../../state/identity/stores/identity-store.js";
import { kickDiscordMember, setMemberNickname, type DiscordMember } from "../../../../../../../state/discord/client.js";
import { selectDiscordItem } from "../../../../../../../state/discord/inspector-selection.js";

const MEMBER_ICON = "person";
const BOT_ICON = "robot";

function iconForMember(member: DiscordMember): Instance {
    return icon({
        name: member.is_bot ? BOT_ICON : MEMBER_ICON,
        classes: [TREE_ICON_CLASS],
        context: null,
        meta: null,
    });
}

export function sortedByLabel(members: readonly DiscordMember[]): DiscordMember[] {
    return [...members].sort((a, b) => displayLabelFor(a).localeCompare(displayLabelFor(b)));
}

function memberNicknameHandler(member: DiscordMember, guildId: string): (next: string) => Promise<boolean> {
    return async (next) => {
        const session = identityStore.session$();
        if (session === null) return false;
        const nextNickname = next.length === 0 ? null : next;
        return setMemberNickname(guildId, {
            userId: session.id,
            targetUserId: member.user_id,
            targetUserName: member.name,
            beforeNickname: member.nickname,
            nickname: nextNickname,
        });
    };
}

async function confirmKick(host: Instance, member: DiscordMember, guildId: string): Promise<void> {
    const label = displayLabelFor(member);
    const ok = await inlineConfirm(host, {
        cancelLabel: "Cancel",
        confirmLabel: "Kick",
        danger: true,
        cancelContext: `keep ${label} in the guild`,
        confirmContext: `confirm kicking ${label} from the guild`,
    });
    if (!ok) return;
    const session = identityStore.session$();
    if (session === null) return;
    await kickDiscordMember(guildId, member.user_id, {
        userId: session.id,
        targetUserName: member.name,
    });
}

export function memberLeafFor(member: DiscordMember, guildId: string, host: Instance): TreeNode {
    const label = displayLabelFor(member);
    return {
        label,
        kind: "leaf",
        key: member.user_id,
        icon: iconForMember(member),
        title: member.name,
        onClick: () => selectDiscordItem({ kind: "member", data: member }),
        onLabelEdit: memberNicknameHandler(member, guildId),
        actions: [
            {
                iconName: "person-dash",
                title: `Kick ${label}`,
                onClick: () => void confirmKick(host, member, guildId),
                danger: true,
            },
        ],
    };
}
