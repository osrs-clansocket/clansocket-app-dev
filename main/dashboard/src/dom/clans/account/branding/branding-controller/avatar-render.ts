import { clanAvatarInner, createInstance, type Instance } from "../../../../factory";

type AvatarIconKind = "builtin" | "image" | null;

export interface AvatarRenderArgs {
    avatarEl: HTMLElement;
    slug: string;
    iconKind: AvatarIconKind;
    iconValue: string | null;
    imageVersion: number;
    color: string;
}

const HOSTS = new WeakMap<HTMLElement, Instance>();

function getAvatarHost(el: HTMLElement): Instance {
    let host = HOSTS.get(el);
    if (host === undefined) {
        host = createInstance(el);
        HOSTS.set(el, host);
    }
    return host;
}

export function renderClanAvatar(args: AvatarRenderArgs): void {
    args.avatarEl.style.setProperty("--branding-accent", args.color);
    const inst = getAvatarHost(args.avatarEl);
    inst.clear();
    inst.addChild(
        clanAvatarInner({
            slug: args.slug,
            iconKind: args.iconKind,
            iconValue: args.iconValue,
            imageVersion: args.imageVersion,
            imgClass: "account__branding-avatar-img",
            glyphClass: "account__branding-avatar-glyph",
            context: null,
            meta: null,
        }),
    );
}
