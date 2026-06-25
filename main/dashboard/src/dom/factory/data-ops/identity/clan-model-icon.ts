import "../../../../styles/components/data/clan-model-icon-component.css";
import "../../../../styles/effects/fx/fold-in-effect.css";
import "../../../../styles/effects/fx/fold-out-effect.css";
import { image } from "../../content-ops/graphics/media.js";
import { div } from "../../layout-ops/structural/container.js";
import type { Instance } from "../../core";
import type { ContextProps } from "../../core/types.js";
import { mountRenderer, onMountedRenderer, unmountRenderer } from "./clan-model-mount.js";
import { AppEvents, events, type TransformChanged } from "../../../../managers/events";

const BLOCK_CLASS = "clan-model-icon";
const IMAGE_CLASS = "clan-model-icon__image";
const MESH_CLASS = "clan-model-icon__mesh";

interface ModelTransform {
    scale: number;
    rotate: number;
    translateX: number;
    translateY: number;
}

interface ModelProps extends ContextProps {
    slug: string;
    initialTransform?: ModelTransform;
    imageVersion?: number;
    recordUrl?: string;
    thumbnailUrl?: string;
    mobilePanX?: number;
}

function defaultThumbUrl(slug: string): string {
    return `/api/clans/${encodeURIComponent(slug)}/icon`;
}

function defaultRecordUrl(slug: string): string {
    return `/api/clans/${encodeURIComponent(slug)}/icon-record`;
}

function defaultThumbSrc(baseUrl: string, imageVersion?: number): string {
    if (imageVersion === undefined) return baseUrl;
    const sep = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${sep}v=${imageVersion}`;
}

function applyTransformCss(el: HTMLElement, t: ModelTransform): void {
    el.style.transform = `scale(${t.scale}) rotate(${t.rotate}deg) translate(${t.translateX}px, ${t.translateY}px)`;
}

function bindTransformEvents(host: Instance, renderTarget: Instance, slug: string): void {
    const unbindTransform = events.on(AppEvents.CLAN_TRANSFORM_CHANGED, (...args: unknown[]) => {
        const payload = args[0] as TransformChanged | undefined;
        if (!payload || payload.slug !== slug) return;
        applyTransformCss(renderTarget.el, payload.transform);
    });
    host.trackDispose({ dispose: unbindTransform });
}

function buildIconParts(props: ModelProps): { host: Instance; fallbackImg: Instance; renderTarget: Instance } {
    const host = div({ classes: [BLOCK_CLASS], context: props.context, meta: props.meta });
    const fallbackImg = image({
        src: defaultThumbSrc(props.thumbnailUrl ?? defaultThumbUrl(props.slug), props.imageVersion),
        alt: "",
        classes: [IMAGE_CLASS],
        context: null,
        meta: null,
    });
    host.addChild(fallbackImg);
    const renderTarget = div({ classes: [MESH_CLASS], context: null, meta: null });
    if (props.initialTransform) applyTransformCss(renderTarget.el, props.initialTransform);
    host.addChild(renderTarget);
    return { host, fallbackImg, renderTarget };
}

function clanModelIcon(props: ModelProps): Instance {
    const { host, fallbackImg, renderTarget } = buildIconParts(props);
    const disposedRef = { v: false };
    host.trackDispose({
        dispose: () => {
            disposedRef.v = true;
        },
    });
    const recordUrl = props.recordUrl ?? defaultRecordUrl(props.slug);
    const thumbnailUrl = props.thumbnailUrl ?? defaultThumbUrl(props.slug);
    void mountRenderer(renderTarget.el, recordUrl, thumbnailUrl).then((mounted) => {
        if (!mounted) return;
        if (disposedRef.v) {
            unmountRenderer(renderTarget.el);
            return;
        }
        onMountedRenderer({ host, fallbackImg, renderTarget, mobilePanX: props.mobilePanX });
    });
    bindTransformEvents(host, renderTarget, props.slug);
    return host;
}

export { clanModelIcon };
export type { ModelProps };
