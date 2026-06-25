export async function fetchIcon(slug: string): Promise<Blob> {
    const res = await fetch(`/api/clans/${encodeURIComponent(slug)}/icon?pristine=1`);
    if (!res.ok) throw new Error(`icon fetch ${res.status}`);
    return await res.blob();
}
