import "../../../clans/account/varez-profile";
import type { Instance } from "../../../factory";
import { defineTab } from "./registry.js";

interface TabMeta {
    key?: string;
    label: string;
    order: number;
}

const META = import.meta.glob<TabMeta>("/main/dashboard/src/dom/pages/account/ai-settings/*/meta.ts", {
    eager: true,
    import: "default",
});
const LAZY = import.meta.glob<{ mount: (host: Instance) => void }>(
    "/main/dashboard/src/dom/pages/account/ai-settings/*/tab.ts",
);

function folderFromPath(path: string): string {
    const parts = path.split("/");
    return parts[parts.length - 2]!;
}

for (const [metaPath, meta] of Object.entries(META)) {
    const folder = folderFromPath(metaPath);
    const key = meta.key ?? folder;
    const implPath = metaPath.replace("/meta.ts", "/tab.ts");
    const loader = LAZY[implPath];
    if (!loader) throw new Error(`ai-settings tab "${key}" missing loader at ${implPath}`);
    defineTab({
        key,
        label: meta.label,
        order: meta.order,
        mount: (host) => {
            void loader().then((m) => m.mount(host));
        },
    });
}
