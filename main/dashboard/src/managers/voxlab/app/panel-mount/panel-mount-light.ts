import { LightPanelComponent } from "../../../../dom/forms/voxlab/panels/light-panel-component.js";
import type { PanelDeps } from "./panel-deps.js";

export function buildLightPanel(deps: PanelDeps): LightPanelComponent {
    const p = new LightPanelComponent({
        lighting: deps.lighting,
        onHdrChanged: deps.onHdrChanged,
        sections: deps.footer.lightSections,
    });
    p.mount(deps.footer.lightContainer);
    return p;
}
