import { div, type Instance } from "../../../../../../../factory";
import { textInput } from "../../../../../../../factory/content-ops/form/inputs/text-input.js";
import { FORM_FIELD, FORM_FIELD_LABEL, FORM_INPUT } from "../../../../../../../forms/form-classes.js";
import { label as labelEl } from "../../../../../../../factory/content-ops/form/input-label.js";
import { buildGlassCheck } from "../../../../../../../forms/glass/inputs/glass-check.js";
import {
    DEFAULT_WEBHOOK_NAME,
    JOINT_CHECK_FIELD_NAME,
    JOINT_CHECK_LABEL,
    JOINT_WEBHOOK_NAME_LABEL,
} from "./create-dropdown-constants.js";
import { buildField, type FormRefs } from "./create-dropdown-common.js";

function jointCheckRow(
    getChecked: () => boolean,
    setChecked: (v: boolean) => void,
    applyVisibility: () => void,
): Instance {
    const jointCheck = buildGlassCheck({
        name: JOINT_CHECK_FIELD_NAME,
        ariaLabel: JOINT_CHECK_LABEL,
        checked: getChecked,
        onChange: (v) => {
            setChecked(v);
            applyVisibility();
        },
    });
    return div({ classes: [FORM_FIELD], context: null, meta: null }, [
        labelEl({
            classes: [FORM_FIELD_LABEL],
            text: JOINT_CHECK_LABEL,
            htmlFor: JOINT_CHECK_FIELD_NAME,
            context: null,
            meta: null,
        }),
        jointCheck,
    ]);
}

export function jointField(refs: FormRefs, applyVisibility: () => void): Instance[] {
    let jointChecked = false;
    refs.getJointChecked = () => jointChecked;
    const jointCheckField = jointCheckRow(
        () => jointChecked,
        (v) => {
            jointChecked = v;
        },
        applyVisibility,
    );
    refs.jointCheckField = jointCheckField;
    const jwIn = textInput({
        classes: [FORM_INPUT],
        value: DEFAULT_WEBHOOK_NAME,
        ariaLabel: JOINT_WEBHOOK_NAME_LABEL,
        context: "type the webhook name for the new channel",
        meta: ["input"],
    });
    refs.jointWebhookNameInput = jwIn;
    const jointWebhookNameField = buildField(JOINT_WEBHOOK_NAME_LABEL, "channel-create-joint-webhook-name", jwIn);
    refs.jointWebhookNameField = jointWebhookNameField;
    return [jointCheckField, jointWebhookNameField];
}
