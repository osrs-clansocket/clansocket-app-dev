import { input, label, span, type Instance, baseProps, textProps } from "../../../factory";
import {
    MAX_OUTPUT_TOKENS_CEILING,
    MAX_OUTPUT_TOKENS_DEFAULT,
    MAX_OUTPUT_TOKENS_FLOOR,
    type AddKeyInputs,
} from "./key-form-submit.js";
import {
    FORM_FIELD as FIELD_CLASS,
    FORM_FIELD_LABEL as FIELD_LABEL_CLASS,
    FORM_INPUT as INPUT_CLASS,
} from "../../../forms/form-classes.js";

function buildTokensInput(): Instance<HTMLInputElement> {
    return input({
        classes: [INPUT_CLASS],
        ariaLabel: "Max output tokens per request",
        type: "number",
        placeholder: String(MAX_OUTPUT_TOKENS_DEFAULT),
        autocomplete: "off",
        min: String(MAX_OUTPUT_TOKENS_FLOOR),
        max: String(MAX_OUTPUT_TOKENS_CEILING),
        step: "1",
        context: "set the max output tokens per request",
        meta: ["input"],
    });
}

export function buildKeyInputs(): AddKeyInputs {
    const providerInput = input({
        classes: [INPUT_CLASS],
        ariaLabel: "Provider",
        type: "text",
        placeholder: "openai",
        autocomplete: "off",
        context: "enter the AI provider name (openai, anthropic, etc)",
        meta: ["input"],
    });
    const keyInput = input({
        classes: [INPUT_CLASS],
        ariaLabel: "API key",
        type: "password",
        placeholder: "sk-...",
        autocomplete: "new-password",
        context: "enter the API key for the provider",
        meta: ["input"],
    });
    return { providerInput, keyInput, maxTokensInput: buildTokensInput() };
}

export function buildKeyFields(inputs: AddKeyInputs): {
    providerField: Instance;
    keyField: Instance;
    maxTokensField: Instance;
} {
    const providerField = label(baseProps([FIELD_CLASS]), [
        span(textProps([FIELD_LABEL_CLASS], "Provider")),
        inputs.providerInput,
    ]);
    const keyField = label(baseProps([FIELD_CLASS]), [
        span(textProps([FIELD_LABEL_CLASS], "API key")),
        inputs.keyInput,
    ]);
    const maxTokensField = label(baseProps([FIELD_CLASS]), [
        span(
            textProps(
                [FIELD_LABEL_CLASS],
                `Max output tokens (${MAX_OUTPUT_TOKENS_FLOOR}–${MAX_OUTPUT_TOKENS_CEILING})`,
            ),
        ),
        inputs.maxTokensInput,
    ]);
    return { providerField, keyField, maxTokensField };
}
