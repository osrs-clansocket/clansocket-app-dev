import { div, type Instance } from "../../../../../../factory";
import { label as labelEl } from "../../../../../../factory/content-ops/form/input-label.js";
import { FORM_FIELD, FORM_FIELD_LABEL } from "../../../../../../forms/form-classes.js";

export const FIELD_ID_APP_ID = "byo-bot-app-id";
export const FIELD_ID_BOT_TOKEN = "byo-bot-token";
export const FIELD_ID_PUBLIC_KEY = "byo-bot-public-key";

export function buildField(labelText: string, fieldId: string, control: Instance): Instance {
    return div({ classes: [FORM_FIELD], id: fieldId, context: null, meta: null }, [
        labelEl({ classes: [FORM_FIELD_LABEL], text: labelText, htmlFor: fieldId, context: null, meta: null }),
        control,
    ]);
}
