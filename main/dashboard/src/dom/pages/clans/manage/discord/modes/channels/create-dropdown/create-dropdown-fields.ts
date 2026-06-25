import { div, type Instance } from "../../../../../../../factory";
import { textInput } from "../../../../../../../factory/content-ops/form/inputs/text-input.js";
import { FORM_INPUT } from "../../../../../../../forms/form-classes.js";
import { buildGlassSelect } from "../../../../../../../forms/glass/inputs/select/index.js";
import {
    CATEGORY_TYPE,
    CHANNEL_NAME_FIELD_NAME,
    DEFAULT_CHANNEL_NAME,
    DEFAULT_TYPE,
    NO_PARENT_VALUE,
    PARENT_FIELD_NAME,
    TYPE_FIELD_NAME,
    parentOptionsFrom,
    typeOptionsFor,
    type ToolbarOpts,
} from "./create-dropdown-constants.js";
import { buildField, type FormRefs } from "./create-dropdown-common.js";
import { jointField } from "./create-dropdown-joint.js";

export { buildField, emptyFormRefs, type FormRefs } from "./create-dropdown-common.js";

function newNameInput(): Instance<HTMLInputElement> {
    return textInput({
        classes: [FORM_INPUT],
        value: DEFAULT_CHANNEL_NAME,
        ariaLabel: "Channel name",
        name: CHANNEL_NAME_FIELD_NAME,
        context: "type the channel name",
        meta: ["input"],
    });
}

export function buildChannelSection(opts: ToolbarOpts, refs: FormRefs, applyVisibility: () => void): Instance {
    const categories = opts.getChannels().filter((c) => c.type === CATEGORY_TYPE);
    const tSel = buildGlassSelect(TYPE_FIELD_NAME, typeOptionsFor(opts.features), DEFAULT_TYPE);
    const pSel = buildGlassSelect(PARENT_FIELD_NAME, parentOptionsFrom(categories), NO_PARENT_VALUE);
    const cnIn = newNameInput();
    refs.channelTypeSelect = tSel;
    refs.channelParentSelect = pSel;
    refs.channelNameInput = cnIn;
    const parentField = buildField("Category", "channel-create-parent", pSel);
    refs.channelParentField = parentField;
    const jointRows = jointField(refs, applyVisibility);
    return div({ classes: [], context: null, meta: null }, [
        buildField("Type", "channel-create-type", tSel),
        parentField,
        buildField("Name", "channel-create-name", cnIn),
        ...jointRows,
    ]);
}

export { buildWebhookSection } from "./create-dropdown-webhook.js";
