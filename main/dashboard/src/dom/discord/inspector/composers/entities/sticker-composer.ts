import {
    BTN_VARIANT_OUTLINE,
    button,
    div,
    INLINE_CONFIRM_HOST_CLASS,
    inlineConfirm,
    type Instance,
    baseProps,
} from "../../../../factory";
import { identityStore } from "../../../../../state/identity/stores/identity-store.js";
import {
    deleteServerSticker,
    updateServerSticker,
    type DiscordServerSticker,
} from "../../../../../state/discord/client.js";
import { DISCORD_INSPECTOR_SECTION_CLASS } from "../../../../../shared/constants/clan-manage-discord/route-constants.js";
import { editText, imagePreview, pairedMember, buildReadonlySection } from "../../builders/section-builder.js";

async function saveStickerPatch(
    sticker: DiscordServerSticker,
    patch: Partial<{ name: string; description: string | null; tags: string | null }>,
): Promise<void> {
    const session = identityStore.session$();
    if (session === null) return;
    const nextName = patch.name ?? sticker.name;
    if (nextName.length === 0) return;
    await updateServerSticker(sticker.guild_id, sticker.sticker_id, {
        userId: session.id,
        beforeName: sticker.name,
        name: nextName,
        description: patch.description !== undefined ? patch.description : sticker.description,
        tags: patch.tags !== undefined ? patch.tags : sticker.tags,
    });
}

async function confirmStickerDelete(host: Instance, sticker: DiscordServerSticker): Promise<void> {
    const ok = await inlineConfirm(host, {
        cancelLabel: "Cancel",
        confirmLabel: "Delete",
        danger: true,
        cancelContext: `keep server sticker ${sticker.name}`,
        confirmContext: `confirm deleting server sticker ${sticker.name}`,
    });
    if (!ok) return;
    const session = identityStore.session$();
    if (session === null) return;
    await deleteServerSticker(sticker.guild_id, sticker.sticker_id, {
        userId: session.id,
        targetName: sticker.name,
    });
}

const STICKER_FORMAT_LABELS: Record<number, string> = {
    1: "PNG",
    2: "APNG",
    3: "Lottie",
    4: "GIF",
};
const STICKER_FORMAT_UNKNOWN = "?";

function buildDeleteSection(sticker: DiscordServerSticker): Instance {
    const deleteHost = div(baseProps([INLINE_CONFIRM_HOST_CLASS]));
    const deleteBtn = button({
        classes: [],
        variant: BTN_VARIANT_OUTLINE,

        text: "Delete sticker",
        ariaLabel: `Delete server sticker ${sticker.name}`,
        context: `delete the ${sticker.name} server sticker`,
        meta: ["action"],
        onClick: () => void confirmStickerDelete(deleteHost, sticker),
    });
    deleteHost.addChild(deleteBtn);
    return div(baseProps([DISCORD_INSPECTOR_SECTION_CLASS]), [deleteHost]);
}

interface PatchArgs {
    label: string;
    value: string;
    sticker: DiscordServerSticker;
    key: "name" | "description" | "tags";
    allowEmpty: boolean;
}

function editTextPatch(args: PatchArgs): Instance {
    const { label, value, sticker, key, allowEmpty } = args;
    return editText(label, value, (next) => {
        const patched = computePatch(next, allowEmpty);
        void saveStickerPatch(sticker, { [key]: patched } as Partial<{
            name: string;
            description: string | null;
            tags: string | null;
        }>);
    });
}

function computePatch(next: string, allowEmpty: boolean): string | null {
    if (allowEmpty) return next;
    return next.length > 0 ? next : null;
}

function readonlySection(title: string, value: string): Instance {
    return buildReadonlySection({ title, value });
}

export function serverStickerSections(sticker: DiscordServerSticker): Instance[] {
    return [
        editTextPatch({ sticker, label: "Name", value: sticker.name, key: "name", allowEmpty: true }),
        editTextPatch({
            sticker,
            label: "Description",
            value: sticker.description ?? "",
            key: "description",
            allowEmpty: false,
        }),
        editTextPatch({ sticker, label: "Tags", value: sticker.tags ?? "", key: "tags", allowEmpty: false }),
        readonlySection("Sticker ID", sticker.sticker_id),
        readonlySection("Format", STICKER_FORMAT_LABELS[sticker.format_type] ?? STICKER_FORMAT_UNKNOWN),
        readonlySection("Available", sticker.available ? "yes" : "no"),
        imagePreview("Image URL", sticker.image_url),
        ...pairedMember("Uploaded by", sticker.guild_id, sticker.user_id),
        buildDeleteSection(sticker),
    ];
}
