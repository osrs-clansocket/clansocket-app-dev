import type { FooterPanelComponent } from "../../../dom/forms/voxlab/panels/footer/footer-panel-component.js";
import type { TexturePaintManager } from "../paint/texture-paint-manager.js";
import type { ViewportManager } from "../viewport/viewport-manager.js";
import { recorderEvents } from "../app/app-manager/app-manager-events.js";
import { scheduleCameraFlush } from "./schedule-camera-flush.js";
import { scheduleRecorderFlush } from "./schedule-recorder-flush.js";
import type { ScheduleDeps } from "./schedule-types.js";

export function wireRecorderListeners(
    deps: ScheduleDeps,
    footer: FooterPanelComponent,
    texturePaint: TexturePaintManager,
    viewport: ViewportManager,
): void {
    const handler = (): void => scheduleRecorderFlush(deps);
    for (const [target, evt] of recorderEvents(footer, texturePaint)) target.addEventListener(evt, handler);
    viewport.controls.addEventListener("change", () => scheduleCameraFlush(deps));
}
