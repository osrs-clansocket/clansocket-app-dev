import { panel, paragraph, type Instance, textProps } from "../../../../factory";
import { DISCORD_PLACEHOLDER_HINT_CLASS } from "../../../../../shared/constants/clan-manage-discord/route-constants.js";
import type { ModeContext } from "./registry";

export type { ModeContext };

type ModeBuilder = (ctx: ModeContext) => Instance;

interface ModeMeta {
    key?: string;
    label: string;
    order: number;
}

const META_MODULES = import.meta.glob<ModeMeta>("/main/dashboard/src/dom/pages/clans/manage/discord/modes/*/meta.ts", {
    eager: true,
    import: "default",
});
const LAZY_MODULES = import.meta.glob<{ build: ModeBuilder }>(
    "/main/dashboard/src/dom/pages/clans/manage/discord/modes/*/mode.ts",
);

interface ResolvedMode {
    key: string;
    label: string;
    order: number;
    loader: () => Promise<{ build: ModeBuilder }>;
}

function folderFromPath(path: string): string {
    const parts = path.split("/");
    return parts[parts.length - 2]!;
}

const MODES: readonly ResolvedMode[] = Object.entries(META_MODULES)
    .map(([metaPath, meta]) => {
        const folder = folderFromPath(metaPath);
        const key = meta.key ?? folder;
        const implPath = metaPath.replace("/meta.ts", "/mode.ts");
        const loader = LAZY_MODULES[implPath];
        if (!loader) throw new Error(`discord mode "${key}" missing loader at ${implPath}`);
        return { key, loader, label: meta.label, order: meta.order };
    })
    .sort((a, b) => a.order - b.order);

export interface DiscordModeDef {
    key: string;
    label: string;
    order: number;
}

export function discordModeDefs(): readonly DiscordModeDef[] {
    return MODES.map((m) => ({ key: m.key, label: m.label, order: m.order }));
}

function labelForKey(key: string): string {
    const def = MODES.find((m) => m.key === key);
    return def?.label ?? key;
}

const KEY_TO_LOADER = new Map(MODES.map((m) => [m.key, m.loader]));

export function modeContent(ctx: ModeContext, key: string): Instance {
    const loader = KEY_TO_LOADER.get(key);
    if (!loader) {
        return panel({ context: null, meta: null }, [
            paragraph(textProps([DISCORD_PLACEHOLDER_HINT_CLASS], `Unknown discord mode: ${key}`)),
        ]);
    }
    const loading = panel({ context: null, meta: null }, [
        paragraph(textProps([DISCORD_PLACEHOLDER_HINT_CLASS], `Loading ${labelForKey(key)}…`)),
    ]);
    void loader().then((mod) => {
        if (!loading.el.parentElement) return;
        loading.el.replaceWith(mod.build(ctx).el);
    });
    return loading;
}
