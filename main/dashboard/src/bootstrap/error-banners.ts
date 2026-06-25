import { errorBanner } from "../dom/factory/data-ops/error-banner.js";
import { ERROR_BANNER_ACTION_RELOAD, ERROR_BANNER_GLOBAL_TITLE } from "../shared/constants/error-banner-constants.js";
import { findHost, getHost } from "./error-host.js";

const activeBanners = new Map<string, HTMLElement>();

function bannerKey(message: string, stack: string | undefined): string {
    return `${message}::${stack ?? ""}`;
}

function pruneDetachedBanners(): void {
    for (const [key, el] of activeBanners) {
        if (!document.contains(el)) activeBanners.delete(key);
    }
}

export function clearAllBanners(): void {
    const host = findHost();
    if (host !== null) getHost(host).clear();
    activeBanners.clear();
}

export function paintBanner(message: string, stack: string | undefined): void {
    pruneDetachedBanners();
    const key = bannerKey(message, stack);
    if (activeBanners.has(key)) return;
    const host = findHost();
    if (host === null) return;
    const banner = errorBanner({
        message,
        stack,
        title: ERROR_BANNER_GLOBAL_TITLE,
        action: ERROR_BANNER_ACTION_RELOAD,
    });
    activeBanners.set(key, banner.el);
    getHost(host).addChild(banner);
}
