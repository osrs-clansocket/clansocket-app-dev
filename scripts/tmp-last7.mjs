import { readFileSync } from "fs";
const r = JSON.parse(readFileSync(".lint-reports/eslint-dashboard.json"));
for (const f of r) {
    for (const m of f.messages) {
        if (!["lvi/mirror-pages", "lvi/no-mixed-concerns", "lvi/require-context-meta"].includes(m.ruleId)) continue;
        const p = f.filePath.split("clansocket-app").pop().split("\\").join("/");
        console.log(m.ruleId, p + ":" + m.line, (m.message || "").split("\n").slice(0, 2).join(" | ").slice(0, 200));
    }
}
