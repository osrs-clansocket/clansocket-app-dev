import {
    BTN_VARIANT_PRIMARY,
    button,
    div,
    form,
    paragraph,
    type Instance,
    baseProps,
    textProps,
} from "../../../factory";
import { describeError, submitKeyForm, type AddKeyOpts } from "./key-form-submit.js";
import { buildKeyFields, buildKeyInputs } from "./key-form-fields.js";
export { MAX_OUTPUT_TOKENS_CEILING, MAX_OUTPUT_TOKENS_DEFAULT, MAX_OUTPUT_TOKENS_FLOOR } from "./key-form-submit.js";
export type { AddKeyOpts } from "./key-form-submit.js";
import {
    FORM_CLAIM_FORM as FORM_CLASS,
    FORM_ERROR as ERROR_CLASS,
    FORM_FORM_ROW as FORM_ROW_CLASS,
    FORM_HINT as HINT_CLASS,
} from "../../../forms/form-classes.js";

export interface AddKeyHandle {
    el: HTMLElement;
    destroy: () => void;
}

function buildKeyButtons(opts: AddKeyOpts): { submitBtn: Instance; cancelBtn: Instance } {
    return {
        submitBtn: button({
            variant: BTN_VARIANT_PRIMARY,
            
            type: "submit",
            text: "Save key",
            context: "save the API key to your vault",
            meta: ["submit"],
        }),
        cancelBtn: button({
            
            type: "button",
            text: "Cancel",
            context: "cancel adding a key",
            meta: ["action"],
            onClick: () => opts.onCancel?.(),
        }),
    };
}

function buildHelpEl(): Instance {
    return paragraph(
        textProps(
            [HINT_CLASS],
            "Pick a provider (openai, anthropic, etc) and paste your API key. Stored encrypted in your vault.",
        ),
    );
}

function buildErrorEl(): { errorEl: Instance; showError: (m: string) => void } {
    const errorEl = paragraph(baseProps([ERROR_CLASS]));
    errorEl.el.hidden = true;
    const showError = (message: string): void => {
        errorEl.setText(message);
        errorEl.el.hidden = false;
    };
    return { errorEl, showError };
}

interface FormChildren {
    helpEl: Instance;
    errorEl: Instance;
    providerField: Instance;
    keyField: Instance;
    maxTokensField: Instance;
    submitBtn: Instance;
    cancelBtn: Instance;
}

function buildFormChildren(c: FormChildren): Instance[] {
    return [
        c.helpEl,
        c.providerField,
        c.keyField,
        c.maxTokensField,
        c.errorEl,
        div(baseProps([FORM_ROW_CLASS]), [c.submitBtn, c.cancelBtn]),
    ];
}

function addKeyForm(container: HTMLElement, opts: AddKeyOpts = {}): AddKeyHandle {
    const helpEl = buildHelpEl();
    const { errorEl, showError } = buildErrorEl();
    const inputs = buildKeyInputs();
    const fields = buildKeyFields(inputs);
    const { submitBtn, cancelBtn } = buildKeyButtons(opts);
    const handleSubmit = async (): Promise<void> => {
        errorEl.el.hidden = true;
        await submitKeyForm(inputs, opts, showError);
    };
    const sec = form(
        {
            classes: [FORM_CLASS],
            context: "add an API key — submit to save the provider key to your vault",
            meta: ["submit"],
            onSubmit: (e: SubmitEvent) => {
                e.preventDefault();
                handleSubmit().catch((err) => showError(describeError(err)));
            },
        },
        buildFormChildren({ helpEl, errorEl, ...fields, submitBtn, cancelBtn }),
    );
    sec.mount(container);
    return { el: sec.el, destroy: () => sec.destroy() };
}

export { addKeyForm };
