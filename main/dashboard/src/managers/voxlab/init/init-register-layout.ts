import type { FooterPanelComponent } from "../../../dom/forms/voxlab/panels/footer/footer-panel-component.js";
import { panelDefs } from "../../../state/voxlab/registries/layout-panel-registry.js";
import { BaseVoxlabComponent } from "../base/base-voxlab-component.js";
import type { LayoutManager } from "../layout/layout-manager.js";

export function registerLayoutPanels(layout: LayoutManager, footer: FooterPanelComponent): void {
    for (const def of panelDefs())
        layout.register({
            id: def.id,
            title: def.title,
            component: def.accessor(footer as unknown as Record<string, BaseVoxlabComponent>),
            defaultSide: def.defaultSide,
        });
}
