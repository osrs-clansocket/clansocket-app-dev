import type { Instance } from "../../../factory";
import type { SelectOption } from "../../../forms/glass/inputs/select/index.js";
import { listMembers, listRoles } from "../../../../state/discord/guild-state-cache.js";
import { pickerField } from "./builder-pickers-field.js";

export type { ChannelPickerArgs } from "./builder-pickers-channel.js";
export { editChannel, editTextChannel, editVoiceChannel } from "./builder-pickers-channel.js";

export interface RolePickerArgs {
    title: string;
    guildId: string;
    currentRoleId: string | null;
    onSave: (next: string | null) => void;
    allowEmpty?: boolean;
}

export function editRole(args: RolePickerArgs): Instance {
    const opts: SelectOption[] = listRoles(args.guildId).map((r) => ({ value: r.role_id, label: r.name }));
    return pickerField({
        title: args.title,
        options: opts,
        current: args.currentRoleId,
        onSave: args.onSave,
        allowEmpty: args.allowEmpty ?? true,
    });
}

export interface MemberPickerArgs {
    title: string;
    guildId: string;
    currentUserId: string | null;
    onSave: (next: string | null) => void;
    allowEmpty?: boolean;
}

export function editMember(args: MemberPickerArgs): Instance {
    const opts: SelectOption[] = listMembers(args.guildId).map((m) => ({
        value: m.user_id,
        label: m.display_name ?? m.name,
    }));
    return pickerField({
        title: args.title,
        options: opts,
        current: args.currentUserId,
        onSave: args.onSave,
        allowEmpty: args.allowEmpty ?? true,
    });
}

export function editEnum(
    title: string,
    options: readonly SelectOption[],
    current: string,
    onSave: (next: string) => void,
): Instance {
    return pickerField({
        title,
        current,
        options: [...options],
        onSave: (v) => onSave(v ?? ""),
        allowEmpty: false,
    });
}
