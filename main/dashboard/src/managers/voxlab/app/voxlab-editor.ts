import "../../../styles/pages/voxlab/voxlab-page.css";
import "../../../styles/pages/voxlab/stage-page.css";
import "../../../styles/pages/voxlab/frame-page.css";
import "../../../styles/pages/voxlab/picker-page.css";
import "../../../styles/pages/voxlab/control-page.css";
import "../../../styles/pages/voxlab/dropdown-page.css";
import "../../../styles/pages/voxlab/footer-page.css";
import "../../../styles/pages/voxlab/shell-page.css";
import "../../../styles/pages/voxlab/modal-page.css";
import "../../../styles/pages/voxlab/overlay-page.css";
import "../../../styles/pages/voxlab/sidebar-page.css";
import "../../../styles/pages/voxlab/tabs-page.css";
import "../../../styles/pages/voxlab/presets-page.css";
import "../../../styles/pages/voxlab/actions-page.css";
import "../../../styles/pages/voxlab/timeline-page.css";
import { createInstance } from "../../../dom/factory/index.js";
import { VoxlabAppManager } from "./voxlab-app-manager.js";
import type { MeshData } from "../../../shared/types/voxlab/mesh/mesh-types.js";
import type { SceneSnapshot } from "../../../shared/types/voxlab/snapshot-types.js";
import type { Timeline } from "../../../shared/types/voxlab/timeline-types.js";

export interface PublishPayload {
    payloadVersion: 1;
    mesh: MeshData;
    snapshot: SceneSnapshot;
    timeline: Timeline;
    thumbnailPng: Blob;
    sourceAlbedoImage?: string;
}

export interface InitialState {
    mesh?: MeshData;
    snapshot?: SceneSnapshot;
    timeline?: Timeline;
}

export interface VoxlabEditorOptions {
    initial?: InitialState;
    frameAspect?: number;
}

export class VoxlabEditor extends EventTarget {
    private app: VoxlabAppManager | null = null;
    private root: HTMLElement | null = null;
    private publishHandler: ((payload: PublishPayload) => Promise<void> | void) | null = null;

    mount(root: HTMLElement, options?: VoxlabEditorOptions): void {
        if (this.app) {
            throw new Error(
                `VoxlabEditor.mount: already mounted — call unmount() first (rootTag=${this.root?.tagName ?? "?"})`,
            );
        }
        this.root = root;
        this.app = new VoxlabAppManager(root, {
            onPublish: (payload) => this.emitPublish(payload),
            onReloadRequested: () => this.emitReload(),
            frameAspect: options?.frameAspect,
        });
        if (options?.initial) {
            this.app.applyInitial(options.initial);
        }
        this.app.start();
    }

    unmount(): void {
        if (!this.app) {
            return;
        }
        this.app.dispose();
        if (this.root) {
            createInstance(this.root).clear();
        }
        this.app = null;
        this.root = null;
    }

    applyMesh(mesh: MeshData): void {
        if (!this.app) {
            throw new Error("VoxlabEditor.applyMesh: not mounted");
        }
        this.app.applyInitial({ mesh });
    }

    async publish(): Promise<PublishPayload> {
        if (!this.app) {
            throw new Error("VoxlabEditor.publish: not mounted");
        }
        const payload = await this.app.publish();
        await this.emitPublish(payload);
        return payload;
    }

    on(event: "publish", listener: (payload: PublishPayload) => Promise<void> | void): void;
    on(event: "reload", listener: () => void): void;
    on(
        event: "publish" | "reload",
        listener: ((payload: PublishPayload) => Promise<void> | void) | (() => void),
    ): void {
        if (event === "publish") {
            this.publishHandler = listener as (payload: PublishPayload) => Promise<void> | void;
            return;
        }
        this.addEventListener(event, () => (listener as () => void)());
    }

    async emitPublish(payload: PublishPayload): Promise<void> {
        await this.publishHandler?.(payload);
    }

    emitReload(): void {
        this.dispatchEvent(new CustomEvent("reload"));
    }
}

export type { MeshData, SceneSnapshot, Timeline };
export { VoxlabRenderer } from "./voxlab-renderer.js";
