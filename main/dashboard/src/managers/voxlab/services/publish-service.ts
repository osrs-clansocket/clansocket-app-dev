import { router } from "../../router/index.js";
import { modalService } from "./modal-service.js";
import type { PublishPayload, VoxlabEditor } from "../app/voxlab-editor.js";
import { publishVoxlab } from "../../../state/clans/clans-client/branding.js";
import { SITE_VOXLAB_PUBLISH_URL } from "../../../state/site/site-client.js";

async function verifyPublished(url: string): Promise<boolean> {
    try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return false;
        const env = (await res.json()) as { mesh?: unknown } | null;
        return Boolean(env?.mesh);
    } catch {
        return false;
    }
}

async function runPublishFlow(
    editor: VoxlabEditor,
    upload: () => Promise<unknown>,
    recordUrl: string,
    destination: string,
): Promise<void> {
    const result = await upload();
    if (result === null) {
        await modalService.alert("Publish failed — the server didn't accept the voxlab envelope.");
        return;
    }
    if (!(await verifyPublished(recordUrl))) {
        await modalService.alert("Publish couldn't be verified — the published model could not be read back.");
        return;
    }
    editor.unmount();
    router.navigate(destination);
}

export function handlePublish(slug: string, payload: PublishPayload, editor: VoxlabEditor): Promise<void> {
    return runPublishFlow(
        editor,
        () => publishVoxlab(slug, payload),
        `/api/clans/${encodeURIComponent(slug)}/icon-record`,
        `/clans/${slug}/manage/identity`,
    );
}

export function handleSitePublish(payload: PublishPayload, editor: VoxlabEditor): Promise<void> {
    return runPublishFlow(
        editor,
        () => publishVoxlab("__site__", payload, SITE_VOXLAB_PUBLISH_URL),
        SITE_VOXLAB_PUBLISH_URL,
        "/",
    );
}
