import type { ToolbarOpts } from "../../../dom/pages/clans/manage/discord/modes/channels/create-dropdown/create-dropdown-constants.js";
import { submitChannelCreate } from "./create-dropdown/create-dropdown-creators.js";

export async function submitChannelOnly(
    opts: ToolbarOpts,
    typeValue: number,
    parentId: string | null,
    name: string,
): Promise<string | undefined> {
    const ok = await submitChannelCreate(opts.guildId, typeValue, parentId, name);
    return ok ? undefined : "Failed to create channel.";
}
