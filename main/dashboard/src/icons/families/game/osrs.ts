import { defineIconFamily } from "../../registry";

const OSRS_PICKER_FOLDERS: readonly string[] = ["player_types", "hiscores", "pets"];
const SPRITE_PREFIX = "sprite_";
const UNDERSCORE = "_";

function resolveSpriteSrc(name: string): string | null {
    const rest = name.slice(SPRITE_PREFIX.length);
    const cut = rest.indexOf(UNDERSCORE);
    if (cut <= 0) return null;
    const category = rest.slice(0, cut);
    const file = rest.slice(cut + 1);
    return `/resources/osrs/game_${category}/${file}.webp`;
}

function resolveOsrsSrc(name: string): string | null {
    if (name.startsWith(SPRITE_PREFIX)) return resolveSpriteSrc(name);
    for (const folder of OSRS_PICKER_FOLDERS) {
        const prefix = `${folder}${UNDERSCORE}`;
        if (name.startsWith(prefix)) {
            const file = name.slice(prefix.length);
            return `/resources/osrs/icon_${folder}/${file}.webp`;
        }
    }
    return null;
}

defineIconFamily({
    prefix: "osrs",
    config: {
        baseClass: "",
        label: "OSRS Sprites",
        license: "Jagex",
        attribution: "Sprites © Jagex Ltd.",
        kind: "raster",
        resolveSrc: resolveOsrsSrc,
    },
    glyphLoader: async () => (await import("../../osrs.json")).default as Record<string, number>,
});
