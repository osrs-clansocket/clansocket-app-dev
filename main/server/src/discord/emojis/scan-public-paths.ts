import { existsSync, readdirSync, statSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { BaseRegistry } from "../../base/base-registry.js";

const PUBLIC_BASE = join(process.cwd(), "public");

const EMOJI_SUBDIRS = ["resources/osrs/emojis", "resources/osrs/anim_emojis", "resources/osrs/enlarged_emojis"];

function buildPathRegistry(): BaseRegistry<string, string> {
    const reg = new BaseRegistry<string, string>();
    for (const sub of EMOJI_SUBDIRS) {
        const dir = join(PUBLIC_BASE, sub);
        if (!existsSync(dir)) continue;
        for (const file of readdirSync(dir)) {
            const full = join(dir, file);
            if (!statSync(full).isFile()) continue;
            const name = basename(file, extname(file)).toLowerCase();
            if (!reg.has(name)) reg.register(name, `/${sub}/${file}`);
        }
    }
    return reg;
}

const PUBLIC_PATHS = buildPathRegistry();

export function lookupPublicPath(emojiName: string): string | null {
    return PUBLIC_PATHS.get(emojiName.toLowerCase());
}
