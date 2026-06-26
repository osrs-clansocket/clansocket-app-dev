import type { Instance } from "../../core";
import { AppEvents, events, type TransformChanged } from "../../../../managers/events";

interface ClanIconTransform {
    scale: number;
    rotate: number;
    translateX: number;
    translateY: number;
}

export type { ClanIconTransform };

export function applyTransformCss(el: HTMLElement, t: ClanIconTransform): void {
    el.style.transform = `scale(${t.scale}) rotate(${t.rotate}deg) translate(${t.translateX}px, ${t.translateY}px)`;
}

export function bindTransformEvents(host: Instance, renderTarget: Instance, slug: string): void {
    const unbindTransform = events.on(AppEvents.CLAN_TRANSFORM_CHANGED, (...args: unknown[]) => {
        const payload = args[0] as TransformChanged | undefined;
        if (!payload || payload.slug !== slug) return;
        applyTransformCss(renderTarget.el, payload.transform);
    });
    host.trackDispose({ dispose: unbindTransform });
}
