import type { Instance } from "../../../../../factory/index.js";
import type { BrandingController } from "../../branding-controller/index.js";
import type { createSliderSpecs } from "./sliders.js";

interface SubscribeTweakerArgs {
    ctrl: BrandingController;
    sliders: ReturnType<typeof createSliderSpecs>;
    render: () => void;
    refreshSource: () => void;
    applyKindVisibility: () => void;
    statusEl: Instance;
}

export function subscribeTweakerCtrl(args: SubscribeTweakerArgs): void {
    const { ctrl, sliders, render, refreshSource, applyKindVisibility, statusEl } = args;
    ctrl.subscribe({
        onTransformChange: (t) => {
            sliders.syncToTransform(t);
            render();
        },
        onCustomizedChange: () => refreshSource(),
        onIconStateChange: () => applyKindVisibility(),
        onSaveStateChange: (state) => {
            if (state === "saving") statusEl.setText("Saving…");
            else if (state === "error") statusEl.setText("Save failed.");
            else statusEl.setText("");
        },
    });
}
