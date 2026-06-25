import type { Instance } from "../../../factory";
import type { SelectOption } from "../../../forms/glass/inputs/select/index.js";
import { listChannels } from "../../../../state/discord/guild-state-cache.js";
import { pickerField } from "./builder-pickers-field.js";

const DISCORD_CHANNEL_TYPE_TEXT = 0;
const DISCORD_CHANNEL_TYPE_VOICE = 2;

export interface ChannelPickerArgs {
    title: string;
    guildId: string;
    currentChannelId: string | null;
    onSave: (next: string | null) => void;
    allowEmpty?: boolean;
}

export function editChannel(args: ChannelPickerArgs): Instance {
    const opts: SelectOption[] = listChannels(args.guildId).map((c) => ({
        value: c.channel_id,
        label: c.name ?? c.channel_id,
    }));
    return pickerField({
        title: args.title,
        options: opts,
        current: args.currentChannelId,
        onSave: args.onSave,
        allowEmpty: args.allowEmpty ?? true,
    });
}

function channelByType(args: ChannelPickerArgs & { typeFilter: number }): Instance {
    const opts: SelectOption[] = listChannels(args.guildId)
        .filter((c) => c.type === args.typeFilter)
        .map((c) => ({ value: c.channel_id, label: c.name ?? c.channel_id }));
    return pickerField({
        title: args.title,
        options: opts,
        current: args.currentChannelId,
        onSave: args.onSave,
        allowEmpty: true,
    });
}

export function editTextChannel(args: ChannelPickerArgs): Instance {
    return channelByType({ ...args, typeFilter: DISCORD_CHANNEL_TYPE_TEXT });
}

export function editVoiceChannel(args: ChannelPickerArgs): Instance {
    return channelByType({ ...args, typeFilter: DISCORD_CHANNEL_TYPE_VOICE });
}
