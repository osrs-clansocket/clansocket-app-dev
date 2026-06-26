import { div, wireChange, type Instance, baseProps } from "../../../factory";
import { buildGlassSelect, type SelectOption } from "../../../forms/glass/inputs/select/index.js";
import { DISCORD_INSPECTOR_SECTION_CLASS } from "../../../../shared/constants/clan-manage-discord/route-constants.js";
import { buildLabelRow } from "./section-builder-readonly.js";

const NONE_OPTION_LABEL = "— none —";
const HIDDEN_INPUT_SELECTOR = "input[type='hidden']";

function slugify(s: string): string {
    return s.toLowerCase().split(" ").join("-");
}

interface PickerFieldArgs {
    title: string;
    options: SelectOption[];
    current: string | null;
    onSave: (next: string | null) => void;
    allowEmpty: boolean;
}

export function pickerField(args: PickerFieldArgs): Instance {
    const finalOptions = args.allowEmpty ? [{ value: "", label: NONE_OPTION_LABEL }, ...args.options] : args.options;
    const slug = slugify(args.title);
    const selectId = `discord-inspector-${slug}`;
    const select = buildGlassSelect(selectId, finalOptions, args.current ?? "");
    const hidden = select.el.querySelector<HTMLInputElement>(HIDDEN_INPUT_SELECTOR);
    if (hidden !== null) {
        wireChange(hidden, () => {
            const val = hidden.value;
            args.onSave(val.length === 0 ? null : val);
        });
    }
    return div(baseProps([DISCORD_INSPECTOR_SECTION_CLASS]), [buildLabelRow(args.title, null), select]);
}
