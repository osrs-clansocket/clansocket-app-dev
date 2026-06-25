import "../../../../styles/pages/voxlab/picker-page.css";
import { div, input, label } from "../../../factory/index.js";

const CLS_CONTROL = "voxlab__control";
const CLS_FILE = "voxlab__control--file";
const CLS_FILE_INPUT = "voxlab__picker-file-input";
const CLS_FILE_LABEL = "voxlab__picker-file-label";

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
    const wrapper = div({ classes: [CLS_CONTROL, CLS_FILE], context: null, meta: null }, [
        label({ classes: [CLS_FILE_LABEL], context: null, meta: null }, [options.label]),
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
