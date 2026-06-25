import { type PbrCtx } from "./app-manager/app-manager-pbr.js";
import { type HistCtx } from "./app-manager/app-manager-history.js";
import { type PublishCtx } from "./app-manager/app-manager-publish.js";
import { type ActionsCtx } from "./app-manager/app-manager-actions.js";
import { onCameraMoved, scheduleSettingsSave, type ScheduleDeps } from "./app-manager/app-manager-schedulers.js";
import { type LifecycleDeps } from "./app-manager/app-manager-lifecycle.js";
import { AppServicesMixin } from "./app-services-mixin.js";

export abstract class AppContextsMixin extends AppServicesMixin {
    protected get lifecycleDeps(): LifecycleDeps {
        return {
            footer: this.footer,
            sidebar: this.sidebar,
            overlays: this.overlays,
            meshes: this.meshes,
            viewport: this.viewport,
            snapshot: this.snapshot,
            timeline: this.timeline,
            history: this.history,
            persistence: this.persistence,
            persistedRestoredRef: this.persistedRestoredRef,
            hostManagedStateRef: this.hostManagedStateRef,
        };
    }
    protected get schedDeps(): ScheduleDeps {
        return {
            state: this.schedState,
            snapshot: this.snapshot,
            persistence: this.persistence,
            history: this.history,
            recorder: this.recorder,
            persistedRestored: () => this.persistedRestoredRef.v,
            hostManagedState: () => this.hostManagedStateRef.v,
            onCameraMoved: () =>
                onCameraMoved({
                    snapshot: this.snapshot,
                    viewport: this.viewport,
                    footer: this.footer,
                    timeline: this.timeline,
                    recorder: this.recorder,
                    save: () => scheduleSettingsSave(this.schedDeps),
                }),
        };
    }
    protected get histCtx(): HistCtx {
        return {
            snapshot: this.snapshot,
            history: this.history,
            persistence: this.persistence,
            persistedRestored: () => this.persistedRestoredRef.v,
            hostManagedState: () => this.hostManagedStateRef.v,
        };
    }
    protected get pbrCtx(): PbrCtx {
        return {
            footer: this.footer,
            meshes: this.meshes,
            textureBind: this.textureBind,
            pbrEncodeService: this.pbrEncodeService,
            pbrShaderService: this.pbrShaderService,
        };
    }
    protected get actionsCtx(): ActionsCtx {
        return {
            baker: this.baker,
            fileService: this.fileService,
            footer: this.footer,
            meshes: this.meshes,
            overlays: this.overlays,
            recorder: this.recorder,
            timeline: this.timeline,
            timelinePanel: this.timelinePanel,
        };
    }
    protected get publishCtx(): PublishCtx {
        return {
            snapshot: this.snapshot,
            viewport: this.viewport,
            timeline: this.timeline,
            baker: this.baker,
            recorder: this.recorder,
            meshes: this.meshes,
            pbrEncodeService: this.pbrEncodeService,
            frameAspect: this.frameAspect,
        };
    }
}
