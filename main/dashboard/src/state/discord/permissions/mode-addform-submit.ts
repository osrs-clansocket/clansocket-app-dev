import type { DiscordChannelOverwrite } from "../client.js";
import { memberDisplayOr, roleNameOr } from "../guild-state-cache.js";
import { addPermissionOverride } from "../../../dom/discord/inspector/util/permission-cycle.js";
import { type Branch } from "../../../dom/pages/clans/manage/discord/modes/permissions/mode-constants.js";
import { readSelectValue } from "../../../dom/pages/clans/manage/discord/modes/permissions/mode-chips.js";
import type { AddFormSelects } from "../../../dom/pages/clans/manage/discord/modes/permissions/mode-addform-selects.js";

export interface SubmitDeps {
    guildId: string;
    bit: number;
    selects: AddFormSelects;
    getLatest: () => readonly DiscordChannelOverwrite[];
    showAddError: (msg: string) => void;
    onClose: () => void;
}

interface ParsedTarget {
    kind: "role" | "member";
    tid: string;
    tName: string;
}

function parseTargetVal(targetVal: string, guildId: string): ParsedTarget {
    const sep = targetVal.indexOf(":");
    const kind = targetVal.substring(0, sep) as "role" | "member";
    const tid = targetVal.substring(sep + 1);
    const tName = kind === "role" ? roleNameOr(guildId, tid, tid) : memberDisplayOr(guildId, tid, tid);
    return { kind, tid, tName };
}

export async function trySubmit(d: SubmitDeps): Promise<void> {
    const targetVal = readSelectValue(d.selects.targetSelect);
    const channelId = readSelectValue(d.selects.channelSelect);
    const branch = readSelectValue(d.selects.branchSelect) as Branch;
    if (!targetVal || !channelId) {
        d.showAddError("Pick target and channel.");
        return;
    }
    const { kind, tid, tName } = parseTargetVal(targetVal, d.guildId);
    const ok = await addPermissionOverride({
        channelId,
        kind,
        branch,
        guildId: d.guildId,
        existing: d.getLatest(),
        targetId: tid,
        targetName: tName,
        bit: d.bit,
    });
    if (!ok) {
        d.showAddError("Server rejected the change. Check role/channel selection.");
        return;
    }
    d.onClose();
}
