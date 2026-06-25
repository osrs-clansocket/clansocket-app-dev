export interface DisposeDeps {
    settingsSaveTimer: { v: number | null };
    texturePaint: { dispose: () => void };
    textureBind: { dispose: () => void };
    pbrShaderServiceRef: { v: { dispose: () => void } | null };
    pbrEncodeService: { dispose: () => void };
    lighting: { dispose: () => void };
    meshes: { dispose: () => void };
    augment: { dispose: () => void };
    footer: { unmount: () => void };
    sidebar: { unmount: () => void };
    timelinePanel: { unmount: () => void };
    overlays: { unmount: () => void };
    frameOverlay: { unmount: () => void };
    viewport: { stop: () => void };
}

export function disposeAll(deps: DisposeDeps): void {
    if (deps.settingsSaveTimer.v !== null) {
        clearTimeout(deps.settingsSaveTimer.v);
        deps.settingsSaveTimer.v = null;
    }
    deps.texturePaint.dispose();
    deps.textureBind.dispose();
    deps.pbrShaderServiceRef.v?.dispose();
    deps.pbrShaderServiceRef.v = null;
    deps.pbrEncodeService.dispose();
    deps.augment.dispose();
    deps.lighting.dispose();
    deps.meshes.dispose();
    deps.footer.unmount();
    deps.sidebar.unmount();
    deps.timelinePanel.unmount();
    deps.overlays.unmount();
    deps.frameOverlay.unmount();
    deps.viewport.stop();
}
