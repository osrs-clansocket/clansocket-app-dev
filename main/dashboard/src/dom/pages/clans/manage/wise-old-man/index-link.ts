import { BTN_VARIANT_PRIMARY, button, div, input, paragraph, signal, type Instance } from "../../../../factory";
import { label as labelEl } from "../../../../factory/content-ops/form/input-label.js";
import { FORM_INPUT } from "../../../../forms/form-classes.js";
import { linkWom } from "../../../../../state/wom/clients/wom-client.js";
import {
    brandHead,
    ERR_REQUIRED,
    FORM_CLASS,
    FORM_FIELD_CLASS,
    FORM_LABEL_CLASS,
    HINT_CLASS,
    NOT_LINKED_LEDE,
    ROOT_CLASS,
    STATUS_LINE_CLASS,
    STATUS_LINKED,
    STATUS_LINKING,
    SUBMIT_BTN_CLASS,
    SUBMIT_LINK_BTN,
} from "./index-constants.js";

interface LinkFormValues {
    groupId: number;
    verificationCode: string;
    apiKey?: string;
}

interface LinkFormInputs {
    groupIdInput: Instance;
    codeInput: Instance;
    keyInput: Instance;
}

function buildSecretInput(ariaLabel: string, context: string): Instance {
    return input({
        ariaLabel,
        context,
        type: "password",
        classes: [FORM_INPUT],
        autocomplete: "off",
        spellcheck: "false",
        meta: ["input"],
    });
}

function buildLinkInputs(): LinkFormInputs {
    return {
        groupIdInput: input({
            type: "number",
            classes: [FORM_INPUT],
            inputmode: "numeric",
            placeholder: "12345",
            ariaLabel: "Wise Old Man group id",
            context: "enter Wise Old Man group id",
            meta: ["input"],
        }),
        codeInput: buildSecretInput("Wise Old Man verification code", "enter Wise Old Man verification code"),
        keyInput: buildSecretInput("Wise Old Man api key", "enter optional Wise Old Man api key"),
    };
}

function readLinkForm(inputs: LinkFormInputs): LinkFormValues | null {
    const rawGroupId = (inputs.groupIdInput.el as HTMLInputElement).value.trim();
    const code = (inputs.codeInput.el as HTMLInputElement).value.trim();
    const apiKey = (inputs.keyInput.el as HTMLInputElement).value.trim();
    if (rawGroupId.length === 0 || code.length === 0) return null;
    const numericGroupId = Number(rawGroupId);
    if (Number.isNaN(numericGroupId) || numericGroupId <= 0) return null;
    const out: LinkFormValues = { groupId: numericGroupId, verificationCode: code };
    if (apiKey.length > 0) out.apiKey = apiKey;
    return out;
}

async function runLinkSubmit(args: {
    inputs: LinkFormInputs;
    slug: string;
    onLinked: () => void;
    statusSig: ReturnType<typeof signal<string>>;
}): Promise<void> {
    const { inputs, slug, onLinked, statusSig } = args;
    const form = readLinkForm(inputs);
    if (form === null) {
        statusSig.set(ERR_REQUIRED);
        return;
    }
    statusSig.set(STATUS_LINKING);
    const result = await linkWom(slug, form);
    if (!result.ok) {
        statusSig.set(`Link failed: ${result.reason ?? "unknown"}`);
        return;
    }
    statusSig.set(STATUS_LINKED);
    onLinked();
}

function linkFormField(label: string, control: Instance): Instance {
    return div({ classes: [FORM_FIELD_CLASS], context: null, meta: null }, [
        labelEl({ classes: [FORM_LABEL_CLASS], text: label, htmlFor: "", context: null, meta: null }),
        control,
    ]);
}

function buildLinkForm(slug: string, onLinked: () => void): Instance {
    const inputs = buildLinkInputs();
    const statusSig = signal("");
    const statusLine = paragraph({ classes: [STATUS_LINE_CLASS], text: statusSig, context: null, meta: null });
    return div({ classes: [FORM_CLASS], context: null, meta: null }, [
        linkFormField("Group ID", inputs.groupIdInput),
        linkFormField("Verification code", inputs.codeInput),
        linkFormField("API key (optional)", inputs.keyInput),
        button({
            classes: [SUBMIT_BTN_CLASS],
            variant: BTN_VARIANT_PRIMARY,
            compact: true,
            text: SUBMIT_LINK_BTN,
            context: "submit the WoM credentials to link the clan's WoM group",
            meta: ["submit"],
            onClick: () => void runLinkSubmit({ inputs, slug, onLinked, statusSig }),
        }),
        statusLine,
    ]);
}

export function notLinkedView(slug: string, onLinked: () => void): Instance {
    return div({ classes: [ROOT_CLASS], context: null, meta: null }, [
        brandHead(),
        paragraph({ classes: [HINT_CLASS], text: NOT_LINKED_LEDE, context: null, meta: null }),
        buildLinkForm(slug, onLinked),
    ]);
}
