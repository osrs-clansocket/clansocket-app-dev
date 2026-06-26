import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";

const SURFACES = [
    { dir: "main/dashboard/src/dom/pages/account/ai-settings", paired: "tab.ts", folders: ["memory", "modes", "operation", "persona", "preferences"] },
    { dir: "main/dashboard/src/dom/pages/clans/manage", paired: "index.ts", folders: ["audit", "config", "discord", "identity", "plugin-data", "runewatch", "wise-old-man"] },
    { dir: "main/dashboard/src/dom/pages/clans/manage/discord/modes", paired: "mode.ts", folders: ["auto-hooks", "byo-bot", "channels", "emojis", "guild-settings", "members", "permissions", "roles", "server-emojis", "server-stickers"] },
];

let restored = 0;
for (const s of SURFACES) {
    for (const f of s.folders) {
        const pairedPath = join(s.dir, f, s.paired);
        const metaPath = join(s.dir, f, "meta.ts");
        if (!existsSync(pairedPath)) continue;
        const src = readFileSync(pairedPath, "utf8");
        const m = src.match(/\nexport const META = (\{[^}]+\});\n/);
        if (!m) continue;
        const metaLiteral = m[1];
        const cleaned = src.replace(/\nexport const META = \{[^}]+\};\n/, "");
        writeFileSync(pairedPath, cleaned);
        writeFileSync(metaPath, `export default ${metaLiteral};\n`);
        restored++;
        console.log(`restored: ${metaPath}`);
    }
}
console.log(`\n${restored} restored`);
