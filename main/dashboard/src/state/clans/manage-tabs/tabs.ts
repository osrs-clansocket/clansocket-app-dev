type ManageTabBuilder = (slug: string, subTab?: string | null) => HTMLElement;

interface TabMeta {
    key?: string;
    order: number;
}

const META_MODULES = import.meta.glob<TabMeta>("/main/dashboard/src/dom/pages/clans/manage/*/meta.ts", {
    eager: true,
    import: "default",
});
const LAZY_MODULES = import.meta.glob<{ build: ManageTabBuilder }>(
    "/main/dashboard/src/dom/pages/clans/manage/*/index.ts",
);

interface ResolvedTab {
    key: string;
    order: number;
    loader: () => Promise<{ build: ManageTabBuilder }>;
}

function folderFromPath(path: string): string {
    const parts = path.split("/");
    return parts[parts.length - 2]!;
}

const TABS: readonly ResolvedTab[] = Object.entries(META_MODULES)
    .map(([metaPath, meta]) => {
        const folder = folderFromPath(metaPath);
        const key = meta.key ?? folder;
        const implPath = metaPath.replace("/meta.ts", "/index.ts");
        const loader = LAZY_MODULES[implPath];
        if (!loader) throw new Error(`manage tab "${key}" missing loader at ${implPath}`);
        return { key, loader, order: meta.order };
    })
    .sort((a, b) => a.order - b.order);

export type { ManageTabBuilder };
export const TAB_KEYS: readonly string[] = TABS.map((t) => t.key);

const KEY_TO_LOADER = new Map(TABS.map((t) => [t.key, t.loader]));

export async function loadTabBuilder(key: string): Promise<ManageTabBuilder | null> {
    const loader = KEY_TO_LOADER.get(key);
    if (!loader) return null;
    return (await loader()).build;
}
