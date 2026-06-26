import { div, input, label, baseProps } from "../../../factory/index.js";

const CLS_CONTROL = "picker__control";
const CLS_FILE = "picker__control--file";
const CLS_FILE_INPUT = "picker-file-input";
const CLS_FILE_LABEL = "picker-file-label";

export interface FilePickerHandle {
    wrapper: HTMLElement;
    input: HTMLInputElement;
    getCurrent: () => File | null;
    clear: () => void;
}

export interface GlassFileOptions {
    label: string;
    accept: string;
    ariaLabel?: string;
}

export function createFilePicker(options: GlassFileOptions): FilePickerHandle {
    const fileInput = input({
        type: "file",
        accept: options.accept,
        classes: [CLS_FILE_INPUT],
        ariaLabel: options.ariaLabel ?? options.label,
        context: `pick file: ${options.label}`,
        meta: ["input"],
    });
    const wrapper = div(baseProps([CLS_CONTROL, CLS_FILE]), [
        label(baseProps([CLS_FILE_LABEL]), [options.label]),
        fileInput,
    ]);
    return {
        wrapper: wrapper.el,
        input: fileInput.el,
        getCurrent: () => fileInput.el.files?.[0] ?? null,
        clear: () => {
            fileInput.el.value = "";
        },
    };
}
