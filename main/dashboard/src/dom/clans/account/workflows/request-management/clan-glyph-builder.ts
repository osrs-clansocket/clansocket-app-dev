import { clanAvatarInner, span, type Instance } from "../../../../factory";
import type { ClanSearchHit } from "../../../../../state/clans/clans-client/index.js";

export function buildClanGlyph(hit: ClanSearchHit, wrapClass: string, imgClass: string, glyphClass: string): Instance {
    const wrap = span({ classes: [wrapClass], context: null, meta: null });
    wrap.addChild(
        clanAvatarInner({
            imgClass,
            glyphClass,
            slug: hit.slug,
            iconKind: hit.iconKind,
            iconValue: hit.iconValue,
            context: null,
            meta: null,
        }),
    );
    return wrap;
}
