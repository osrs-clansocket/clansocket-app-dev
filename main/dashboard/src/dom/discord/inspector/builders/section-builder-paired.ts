import { derived, type Instance } from "../../../factory";
import {
    channelNameOr,
    guildDataVersion,
    memberDisplayOr,
    roleNameOr,
} from "../../../../state/discord/guild-state-cache.js";
import { buildReadonlySection, NONE_VALUE } from "./section-builder-readonly.js";

export function pairedChannel(label: string, guildId: string, channelId: string | null): Instance[] {
    if (channelId === null || channelId.length === 0) {
        return [buildReadonlySection({ title: label, value: NONE_VALUE })];
    }
    return [
        buildReadonlySection({
            title: label,
            value: derived(() => {
                guildDataVersion();
                return channelNameOr(guildId, channelId, channelId);
            }),
        }),
        buildReadonlySection({ title: `${label} ID`, value: channelId }),
    ];
}

export function pairedRole(label: string, guildId: string, roleId: string | null): Instance[] {
    if (roleId === null || roleId.length === 0) {
        return [buildReadonlySection({ title: label, value: NONE_VALUE })];
    }
    return [
        buildReadonlySection({
            title: label,
            value: derived(() => {
                guildDataVersion();
                return roleNameOr(guildId, roleId, roleId);
            }),
        }),
        buildReadonlySection({ title: `${label} ID`, value: roleId }),
    ];
}

export function pairedMember(label: string, guildId: string, userId: string | null): Instance[] {
    if (userId === null || userId.length === 0) {
        return [buildReadonlySection({ title: label, value: NONE_VALUE })];
    }
    return [
        buildReadonlySection({
            title: label,
            value: derived(() => {
                guildDataVersion();
                return memberDisplayOr(guildId, userId, userId);
            }),
        }),
        buildReadonlySection({ title: `${label} ID`, value: userId }),
    ];
}
