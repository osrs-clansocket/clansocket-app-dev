import { uploadEnvelope, uploadSiteImage } from "../site/site-client.js";

function isJsonFile(file: File): boolean {
    return file.type === "application/json" || file.name.toLowerCase().endsWith(".json");
}

export async function handleLogoUpload(file: File): Promise<void> {
    const ok = isJsonFile(file) ? await uploadEnvelope(file) : await uploadSiteImage(file);
    if (ok) window.location.reload();
}
