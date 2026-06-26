export async function handleLogoUpload(file: File): Promise<void> {
    const { uploadSiteImage } = await import("../site/site-client.js");
    const ok = await uploadSiteImage(file);
    if (ok) window.location.reload();
}
