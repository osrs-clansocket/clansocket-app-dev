import { div, input, label, textarea, type Child, type Instance, baseProps, textProps } from "../../../factory";
import { MAX_PRIORITY, MODE_EDIT, type Mode } from "./constants.js";
import {
    AI_MEMORY_FIELD_CLASS,
    AI_MEMORY_INPUT_CLASS,
    AI_MEMORY_LABEL_CLASS,
    AI_MEMORY_TEXTAREA_CLASS,
} from "../../../../shared/constants/ai-memory-constants.js";

export function fieldRow(labelText: string, control: Child): Instance {
    return div(baseProps([AI_MEMORY_FIELD_CLASS]), [label(textProps([AI_MEMORY_LABEL_CLASS], labelText)), control]);
}

export function buildIdInput(value: string, mode: Mode): Instance<HTMLInputElement> {
    if (mode === MODE_EDIT) {
        return input({
            value,
            classes: [AI_MEMORY_INPUT_CLASS],
            name: "id",
            ariaLabel: "Memory ID",
            readonly: "",
            context: "the memory ID (read-only while editing)",
            meta: ["input"],
        });
    }
    return input({
        value,
        classes: [AI_MEMORY_INPUT_CLASS],
        name: "id",
        ariaLabel: "Memory ID",
        required: "",
        pattern: "[a-z0-9][a-z0-9-]{1,63}",
        context: "enter the memory ID",
        meta: ["input"],
    });
}

export function buildPriorityInput(value: number): Instance<HTMLInputElement> {
    return input({
        classes: [AI_MEMORY_INPUT_CLASS],
        name: "priority",
        value: String(value),
        ariaLabel: "Priority",
        type: "number",
        min: "0",
        max: String(MAX_PRIORITY),
        context: "set the memory priority",
        meta: ["input"],
    });
}

export function buildTriggersInput(value: string): Instance<HTMLInputElement> {
    return input({
        value,
        classes: [AI_MEMORY_INPUT_CLASS],
        name: "triggers",
        ariaLabel: "Triggers",
        context: "enter trigger keywords for this memory",
        meta: ["input"],
    });
}

export function buildContentTextarea(value: string): Instance<HTMLTextAreaElement> {
    return textarea({
        value,
        classes: [AI_MEMORY_TEXTAREA_CLASS],
        name: "content",
        ariaLabel: "Content",
        required: "",
        context: "enter the memory content",
        meta: ["input"],
    });
}
