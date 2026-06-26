import { readFileSync } from "fs";
const j = JSON.parse(readFileSync(".lint-reports/eslint-server.json"));
const byFile = {};
const bySig = {};
for (const f of j) {
    for (const m of f.messages) {
        if (m.ruleId !== "lvi/no-cross-file-duplication") continue;
        const p = f.filePath.split("clansocket-app").pop().split("\\").join("/");
        byFile[p] = (byFile[p] || 0) + 1;
        const lines = (m.message || "").split("\n");
        const narrative = lines.find((l) => l.includes("data:") || l.includes("literal:") || l.includes("Apply")) || lines[0] || "";
        const sig = narrative.trim().slice(0, 100);
        bySig[sig] = (bySig[sig] || 0) + 1;
    }
}
console.log("=== by file ===");
for (const [f, c] of Object.entries(byFile).sort((a, b) => b[1] - a[1])) console.log(c, f);
console.log("\n=== by sig (top 30) ===");
const sigs = Object.entries(bySig).sort((a, b) => b[1] - a[1]);
for (const [s, c] of sigs.slice(0, 30)) console.log(c, s);
console.log(`\ntotal sigs: ${sigs.length}`);
