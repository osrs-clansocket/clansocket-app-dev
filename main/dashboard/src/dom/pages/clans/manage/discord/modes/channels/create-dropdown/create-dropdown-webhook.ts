import { div, type Instance } from "../../../../../../../factory";
import { textInput } from "../../../../../../../factory/content-ops/form/inputs/text-input.js";
import { FORM_FIELD_LABEL, FORM_INPUT } from "../../../../../../../forms/form-classes.js";
import { label as labelEl } from "../../../../../../../factory/content-ops/form/input-label.js";
import { buildGlassSelect } from "../../../../../../../forms/glass/inputs/select/index.js";
import {
    DEFAULT_WEBHOOK_NAME,
    NO_WEBHOOK_CAPABLE_TEXT,
    WEBHOOK_CHANNEL_FIELD_NAME,
    optionsFrom,
    type ToolbarOpts,
} from "./create-dropdown-constants.js";
import { buildField, type FormRefs } from "./create-dropdown-fields.js";

function webhookEmptyHint(): Instance {
    return div({ classes: [], context: null, meta: null }, [
        labelEl({
            classes: [FORM_FIELD_LABEL],
            text: NO_WEBHOOK_CAPABLE_TEXT,
            htmlFor: WEBHOOK_CHANNEL_FIELD_NAME,
            context: null,
            meta: null,
        }),
    ]);
}

export function buildWebhookSection(opts: ToolbarOpts, refs: FormRefs): Instance {
    const channelOptions = optionsFrom(opts.getChannels());
    const defaultChannelId = channelOptions[0]?.value ?? "";
    const wcSel = buildGlassSelect(WEBHOOK_CHANNEL_FIELD_NAME, channelOptions, defaultChannelId);
    const whIn = textInput({
        classes: [FORM_INPUT],
        value: DEFAULT_WEBHOOK_NAME,
        ariaLabel: "Webhook name",
        context: "type the webhook name",
        meta: ["input"],
    });
    refs.webhookChannelSelect = wcSel;
    refs.webhookNameInput = whIn;
    const channelField = buildField("Channel", "webhook-create-channel", wcSel);
    const nameField = buildField("Name", "webhook-create-name", whIn);
    refs.webhookChannelField = channelField;
    refs.webhookNameField = nameField;
    const emptyHint = webhookEmptyHint();
    refs.webhookEmptyHint = emptyHint;
    const hasCapable = channelOptions.length > 0;
    emptyHint.el.hidden = hasCapable;
    channelField.el.hidden = !hasCapable;
    nameField.el.hidden = !hasCapable;
    return div({ classes: [], context: null, meta: null }, [emptyHint, channelField, nameField]);
}
