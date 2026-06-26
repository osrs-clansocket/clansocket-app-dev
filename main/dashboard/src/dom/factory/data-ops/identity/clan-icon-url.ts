export function defaultThumbUrl(slug: string): string {
    return `/api/clans/${encodeURIComponent(slug)}/icon`;
}

export function defaultThumbSrc(baseUrl: string, imageVersion?: number): string {
    if (imageVersion === undefined) return baseUrl;
    const sep = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${sep}v=${imageVersion}`;
}
