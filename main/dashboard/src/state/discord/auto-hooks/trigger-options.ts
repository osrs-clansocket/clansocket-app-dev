import type { SelectOption } from "../../../dom/forms/glass/inputs/select/index.js";
import { getTriggerLabel, listTriggerTypes } from "../../../shared/constants/clan-manage-discord/token-list.js";

export function buildTriggerOptions(): SelectOption[] {
    return listTriggerTypes().map((t) => ({ value: t, label: getTriggerLabel(t) }));
}
