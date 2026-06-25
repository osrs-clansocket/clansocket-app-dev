export async function fetchThumbBlob(thumbnailUrl: string): Promise<Blob> {
    try {
        const r = await fetch(thumbnailUrl);
        return r.ok ? await r.blob() : new Blob([], { type: "image/png" });
    } catch {
        return new Blob([], { type: "image/png" });
    }
}
