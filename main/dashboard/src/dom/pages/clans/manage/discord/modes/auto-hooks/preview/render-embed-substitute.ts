import { image, type Instance } from "../../../../../../../factory";

export function substitute(template: string, sampleTokens: Record<string, string>): string {
    let result = template;
    for (const [token, value] of Object.entries(sampleTokens)) {
        result = result.split(token).join(value);
    }
    return result;
}

export function maybeImage(url: string, alt: string, styleFn: (el: HTMLElement) => void): Instance | null {
    if (url.length === 0) return null;
    const img = image({ alt, src: url, classes: [], context: null, meta: null });
    styleFn(img.el);
    return img;
}
