import type { FooterPanelComponent } from "../../../../dom/forms/voxlab/panels/footer/footer-panel-component.js";

export function mountFooterSections(
    footer: FooterPanelComponent,
    sidebar: {
        cameraContainer: HTMLElement;
        sceneContainer: HTMLElement;
        displayContainer: HTMLElement;
        statsPanel: { mount: (el: HTMLElement) => void };
    },
): void {
    for (const section of footer.cameraSections) section.mount(sidebar.cameraContainer);
    for (const section of footer.sceneSections) section.mount(sidebar.sceneContainer);
    for (const section of footer.displaySections) section.mount(sidebar.displayContainer);
    for (const section of footer.meshSections) section.mount(footer.meshContainer);
    sidebar.statsPanel.mount(footer.meshContainer);
    for (const section of footer.colorSections) section.mount(footer.colorContainer);
    for (const section of footer.textureSections) section.mount(footer.textureContainer);
}
