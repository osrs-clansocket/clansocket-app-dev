import { div, type Instance } from "../../../../../../../factory";
import { FORM_FIELD, FORM_FIELD_LABEL } from "../../../../../../../forms/form-classes.js";
import { label as labelEl } from "../../../../../../../factory/content-ops/form/input-label.js";

export interface FormRefs {
    kindSelect: Instance | null;
    channelTypeSelect: Instance | null;
    channelParentSelect: Instance | null;
    channelParentField: Instance | null;
    channelNameInput: Instance<HTMLInputElement> | null;
    jointCheckField: Instance | null;
    jointWebhookNameInput: Instance<HTMLInputElement> | null;
    jointWebhookNameField: Instance | null;
    getJointChecked: (() => boolean) | null;
    webhookChannelSelect: Instance | null;
    webhookChannelField: Instance | null;
    webhookNameInput: Instance<HTMLInputElement> | null;
    webhookNameField: Instance | null;
    webhookEmptyHint: Instance | null;
    channelSection: Instance | null;
    webhookSection: Instance | null;
}

export function emptyFormRefs(): FormRefs {
    const keys: Array<keyof FormRefs> = [
        "kindSelect",
        "channelTypeSelect",
        "channelParentSelect",
        "channelParentField",
        "channelNameInput",
        "jointCheckField",
        "jointWebhookNameInput",
        "jointWebhookNameField",
        "getJointChecked",
        "webhookChannelSelect",
        "webhookChannelField",
        "webhookNameInput",
        "webhookNameField",
        "webhookEmptyHint",
        "channelSection",
        "webhookSection",
    ];
    return Object.fromEntries(keys.map((k) => [k, null])) as unknown as FormRefs;
}

export function buildField(labelText: string, inputId: string, control: Instance): Instance {
    return div({ classes: [FORM_FIELD], id: inputId, context: null, meta: null }, [
        labelEl({ classes: [FORM_FIELD_LABEL], text: labelText, htmlFor: inputId, context: null, meta: null }),
        control,
    ]);
}
