import { div, type Instance } from "../../../dom/factory/index.js";
import { buildInput, buildOverlay, type ModalSpec } from "./modal-service-render.js";
import { MODAL_ROOT_CLASS } from "../../../shared/constants/voxlab/voxlab-classes-constants.js";

type Btn<V> = { label: string; role: "primary" | "secondary" | "danger"; value: V };
const btn = <V>(label: string, role: Btn<V>["role"], value: V): Btn<V> => ({ label, role, value });

export class ModalService {
    private rootInstance: Instance | null = null;

    alert(message: string): Promise<void> {
        return this.open({ title: "Notice", body: message, buttons: [btn("OK", "primary", true)] }).then(
            () => undefined,
        );
    }

    confirm(
        message: string,
        options?: { confirmLabel?: string; cancelLabel?: string; danger?: boolean },
    ): Promise<boolean> {
        return this.open({
            title: "Confirm",
            body: message,
            buttons: [
                btn(options?.cancelLabel ?? "Cancel", "secondary", false),
                btn(options?.confirmLabel ?? "Confirm", options?.danger ? "danger" : "primary", true),
            ],
        }).then((v) => v === true);
    }

    prompt(message: string, defaultValue = ""): Promise<string | null> {
        return this.open({
            title: "Input",
            body: message,
            input: { defaultValue },
            buttons: [btn("Cancel", "secondary", null), btn("OK", "primary", "")],
        }).then((v) => (v === null || v === false ? null : String(v)));
    }

    private getRoot(): Instance {
        if (!this.rootInstance) {
            this.rootInstance = div({
                classes: [MODAL_ROOT_CLASS],
                context: null,
                meta: null,
            });
            this.rootInstance.mount(document.body);
        }
        return this.rootInstance;
    }

    private open(spec: ModalSpec): Promise<string | boolean | null> {
        const root = this.getRoot();
        return new Promise((resolve) => {
            const inputInstance = spec.input ? buildInput(spec.input.defaultValue) : null;
            const overlay = buildOverlay(spec, inputInstance, resolve);
            root.addChild(overlay.el);
            if (inputInstance) {
                inputInstance.el.focus();
                inputInstance.el.select();
            } else {
                overlay.el.focus();
            }
        });
    }
}

export const modalService = new ModalService();
