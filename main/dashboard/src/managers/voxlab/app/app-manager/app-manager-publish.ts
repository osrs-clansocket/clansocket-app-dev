import type { BakerManager } from "../../mesh/baker-manager.js";
import type { KeyframeRecorderService } from "../../services/keyframe-recorder-service.js";
import type { MeshManager } from "../../mesh/mesh-manager.js";
import type { PbrEncodeService } from "../../services/pbr/pbr-encode-service.js";
import type { SnapshotManager } from "../../snapshot-manager.js";
import type { TimelineManager } from "../../timeline/timeline-manager.js";
import type { ViewportManager } from "../../viewport/viewport-manager.js";
import type { AlbedoSettings } from "../../../../shared/types/voxlab/paint/paint-types.js";
import type { PublishPayload } from "../voxlab-editor.js";
import { PUBLISH_THUMBNAIL_PX } from "./app-manager-build.js";

export interface PublishCtx {
    snapshot: SnapshotManager;
    viewport: ViewportManager;
    timeline: TimelineManager;
    baker: BakerManager;
    recorder: KeyframeRecorderService;
    meshes: MeshManager;
    pbrEncodeService: PbrEncodeService;
    frameAspect: number;
}

function bakeLiveCamera(
    viewport: ViewportManager,
    captured: ReturnType<SnapshotManager["capture"]>,
    frameFov: number,
): void {
    const liveCam = viewport.camera;
    const liveTarget = viewport.controls.target;
    const existingCam = (captured.parts.camera ?? {}) as Record<string, unknown>;
    captured.parts.camera = {
        ...existingCam,
        fov: frameFov,
        near: liveCam.near,
        far: liveCam.far,
        positionX: liveCam.position.x,
        positionY: liveCam.position.y,
        positionZ: liveCam.position.z,
        targetX: liveTarget.x,
        targetY: liveTarget.y,
        targetZ: liveTarget.z,
    };
}

function filterPublishParts(parts: Record<string, unknown>): Record<string, unknown> {
    const cleanParts: Record<string, unknown> = {};
    for (const [name, state] of Object.entries(parts)) {
        if (name === "background" || name === "paint") continue;
        cleanParts[name] = state;
    }
    return cleanParts;
}

async function resolveSourceAlbedo(ctx: PublishCtx, parts: Record<string, unknown>): Promise<string | undefined> {
    const albedo = parts.albedo as AlbedoSettings | undefined;
    if (albedo?.source !== "source-image") return undefined;
    const pixels = ctx.meshes.sourceImagePixels;
    if (!pixels) return undefined;
    const urls = await ctx.pbrEncodeService.encodeBatch([
        { slot: "albedo", data: pixels.data, width: pixels.width, height: pixels.height },
    ]);
    return urls.albedo;
}

export async function buildPublishPayload(ctx: PublishCtx): Promise<PublishPayload> {
    const mesh = ctx.meshes.exportPaintedMesh();
    if (!mesh) throw new Error("VoxlabAppManager.publish: no mesh loaded");
    const timeline = ctx.timeline.getTimeline();
    if (!timeline) throw new Error("VoxlabAppManager.publish: timeline missing");
    return runPublish(ctx, mesh, timeline);
}

function publishDimensions(aspect: number): { width: number; height: number } {
    return aspect >= 1
        ? { width: PUBLISH_THUMBNAIL_PX, height: Math.round(PUBLISH_THUMBNAIL_PX / aspect) }
        : { width: Math.round(PUBLISH_THUMBNAIL_PX * aspect), height: PUBLISH_THUMBNAIL_PX };
}

async function bakeThumbnail(
    ctx: PublishCtx,
    captured: ReturnType<PublishCtx["snapshot"]["capture"]>,
): Promise<Awaited<ReturnType<PublishCtx["baker"]["bakeFrame"]>>> {
    const editFov = ctx.viewport.camera.fov;
    const frameFov = ctx.viewport.frameFov();
    bakeLiveCamera(ctx.viewport, captured, frameFov);
    ctx.timeline.pause();
    ctx.timeline.seek(0);
    const { width, height } = publishDimensions(ctx.frameAspect);
    ctx.viewport.setFov(frameFov);
    const thumbnail = await ctx.baker.bakeFrame({ width, height, format: "png", transparent: true });
    ctx.viewport.setFov(editFov);
    return thumbnail;
}

export async function runPublish(
    ctx: PublishCtx,
    mesh: NonNullable<ReturnType<MeshManager["exportPaintedMesh"]>>,
    timeline: NonNullable<ReturnType<TimelineManager["getTimeline"]>>,
): Promise<PublishPayload> {
    const captured = ctx.snapshot.capture();
    const thumbnail = await bakeThumbnail(ctx, captured);
    const cleanParts = filterPublishParts(captured.parts);
    const publishedTimeline = ctx.recorder.isEnabled() ? timeline : { ...timeline, tracks: [] };
    return {
        mesh,
        payloadVersion: 1,
        snapshot: { ...captured, parts: cleanParts },
        timeline: publishedTimeline,
        thumbnailPng: thumbnail.blob,
        sourceAlbedoImage: await resolveSourceAlbedo(ctx, captured.parts),
    };
}
