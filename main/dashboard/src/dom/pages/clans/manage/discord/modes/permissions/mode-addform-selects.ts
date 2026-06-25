import { div, type Instance } from "../../../../../../factory";
import { label as labelEl } from "../../../../../../factory/content-ops/form/input-label.js";
import { FORM_FIELD, FORM_FIELD_LABEL } from "../../../../../../forms/form-classes.js";
import { buildGlassSelect, type SelectOption } from "../../../../../../forms/glass/inputs/select/index.js";
import { listChannels, listMembers, listRoles } from "../../../../../../../state/discord/guild-state-cache.js";

export interface AddFormSelects {
    targetSelect: Instance;
    channelSelect: Instance;
    branchSelect: Instance;
}

export function buildField(labelText: string, inputId: string, control: Instance): Instance {
    return div({ classes: [FORM_FIELD], id: inputId, context: null, meta: null }, [
        labelEl({ classes: [FORM_FIELD_LABEL], text: labelText, htmlFor: inputId, context: null, meta: null }),
        control,
    ]);
}

export function buildAddSelects(guildId: string, bit: number): AddFormSelects {
    const roleOptions: SelectOption[] = listRoles(guildId).map((r) => ({ value: `role:${r.role_id}`, label: r.name }));
    const memberOptions: SelectOption[] = listMembers(guildId).map((m) => ({
        value: `member:${m.user_id}`,
        label: m.display_name ?? m.name,
    }));
    const targetOptions: SelectOption[] = [...roleOptions, ...memberOptions];
    const channelOptions: SelectOption[] = listChannels(guildId).map((c) => ({
        value: c.channel_id,
        label: c.name ?? c.channel_id,
    }));
    const branchOptions: SelectOption[] = [
        { value: "allow", label: "ALLOW" },
        { value: "deny", label: "DENY" },
    ];
    return {
        targetSelect: buildGlassSelect(`perm-add-target-${bit}`, targetOptions, targetOptions[0]?.value ?? ""),
        channelSelect: buildGlassSelect(`perm-add-channel-${bit}`, channelOptions, channelOptions[0]?.value ?? ""),
        branchSelect: buildGlassSelect(`perm-add-branch-${bit}`, branchOptions, "allow"),
    };
}
