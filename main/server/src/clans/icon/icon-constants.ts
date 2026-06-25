export const ICON_MIME_BY_EXT: Record<string, string> = {
    ".ico": "image/x-icon",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".jpg": "image/jpeg",
};
export const ICON_EXTS: readonly string[] = [".webp", ".png", ".jpg", ".svg", ".ico"];
export const ICON_PREFIX_PRISTINE = "icon.";
export const ICON_PREFIX_CUSTOMIZED = "icon-customized.";
export const ICON_TRANSFORM_SIDECAR = "icon-customized.transform.json";
