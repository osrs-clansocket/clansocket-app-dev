import fs from "node:fs";
const data = JSON.parse(fs.readFileSync(".lint-reports/eslint-server.json", "utf8"));
const ruleName = process.argv[2] || "lvi/max-lines-per-function";
const hits = [];
for (const f of data) {
    for (const m of f.messages || []) {
        if (m.ruleId === ruleName) {
            const short = f.filePath.split(/[\\\/]server[\\\/]src[\\\/]/).pop();
            const lines = parseLines(m.message);
            hits.push({ file: short, line: m.line, lines, msg: m.message.slice(0, 120) });
        }
    }
}
function parseLines(msg) {
    const m = /(\d+)\s+effective\s+lines/i.exec(msg);
    if (m) return parseInt(m[1], 10);
    return 0;
}
hits.sort((a, b) => a.lines - b.lines);
console.log("=== " + ruleName + " ASCENDING ===");
for (const h of hits) console.log(String(h.lines).padStart(4), "|", h.file + ":" + h.line);
