import {
    BTN_VARIANT_OUTLINE,
    button,
    derived,
    div,
    INLINE_CONFIRM_HOST_CLASS,
    inlineConfirm,
    type Instance,
    baseProps,
} from "../../../../factory";
import { identityStore } from "../../../../../state/identity/stores/identity-store.js";
import { deleteServerEmoji, updateServerEmoji, type DiscordServerEmoji } from "../../../../../state/discord/client.js";
import { guildDataVersion, roleNameOr } from "../../../../../state/discord/guild-state-cache.js";
import { DISCORD_INSPECTOR_SECTION_CLASS } from "../../../../../shared/constants/clan-manage-discord/route-constants.js";
import { editText, imagePreview, pairedMember, buildReadonlySection } from "../../builders/section-builder.js";

async function saveEmojiRename(emoji: DiscordServerEmoji, nextName: string): Promise<void> {
    const session = identityStore.session$();
    if (session === null) return;
    if (nextName.length === 0 || nextName === emoji.name) return;
    await updateServerEmoji(emoji.guild_id, emoji.emoji_id, {
        userId: session.id,
        beforeName: emoji.name,
        name: nextName,
        roleIds: emoji.role_ids,
    });
}

async function confirmEmojiDelete(host: Instance, emoji: DiscordServerEmoji): Promise<void> {
    const ok = await inlineConfirm(host, {
        cancelLabel: "Cancel",
        confirmLabel: "Delete",
        danger: true,
        cancelContext: `keep server emoji :${emoji.name}:`,
        confirmContext: `confirm deleting server emoji :${emoji.name}:`,
    });
    if (!ok) return;
    const session = identityStore.session$();
    if (session === null) return;
    await deleteServerEmoji(emoji.guild_id, emoji.emoji_id, {
        userId: session.id,
        targetName: emoji.name,
    });
}

function roleRestrictionDerived(emoji: DiscordServerEmoji): () => string {
    return () => {
        guildDataVersion();
        if (emoji.role_ids.length === 0) return "none — usable by everyone";
        return emoji.role_ids.map((rid) => roleNameOr(emoji.guild_id, rid, rid)).join(", ");
    };
}

function buildDeleteSection(emoji: DiscordServerEmoji): Instance {
    const deleteHost = div(baseProps([INLINE_CONFIRM_HOST_CLASS]));
    const deleteBtn = button({
        classes: [],
        variant: BTN_VARIANT_OUTLINE,
        
        text: "Delete emoji",
        ariaLabel: `Delete server emoji ${emoji.name}`,
        context: `delete the ${emoji.name} server emoji`,
        meta: ["action"],
        onClick: () => void confirmEmojiDelete(deleteHost, emoji),
    });
    deleteHost.addChild(deleteBtn);
    return div(baseProps([DISCORD_INSPECTOR_SECTION_CLASS]), [deleteHost]);
}

export function serverEmojiSections(emoji: DiscordServerEmoji): Instance[] {
    const syntax = emoji.animated ? `<a:${emoji.name}:${emoji.emoji_id}>` : `<:${emoji.name}:${emoji.emoji_id}>`;
    return [
        editText("Name", emoji.name, (next) => void saveEmojiRename(emoji, next)),
        buildReadonlySection({ title: "Emoji ID", value: emoji.emoji_id }),
        buildReadonlySection({ title: "Animated", value: emoji.animated ? "yes" : "no" }),
        buildReadonlySection({ title: "Available", value: emoji.available ? "yes" : "no" }),
        buildReadonlySection({ title: "Managed", value: emoji.managed ? "yes" : "no" }),
        buildReadonlySection({ title: "Role restrictions", value: derived(roleRestrictionDerived(emoji)) }),
        buildReadonlySection({ title: "Discord syntax", value: syntax }),
        imagePreview("Image URL", emoji.image_url),
        ...pairedMember("Uploaded by", emoji.guild_id, emoji.user_id),
        buildDeleteSection(emoji),
    ];
}
