/**
 * LVI/no-sync-io-handler — synchronous fs.* calls inside async functions block the event loop.
 * Use the promise version (fs/promises) or hoist to module init.
 */
const { getModuleForFile } = require("../resolve-paths.cjs");
const { build4DReport, shortFile, getContext, trace } = require("./report-builder.cjs");

const SYNC_FNS = new Set([
    "readFileSync", "writeFileSync", "appendFileSync", "existsSync", "statSync", "lstatSync",
    "mkdirSync", "rmdirSync", "rmSync", "unlinkSync", "renameSync", "copyFileSync", "readdirSync",
    "accessSync", "chmodSync", "chownSync", "truncateSync", "realpathSync",
]);

function isSyncFsCall(node) {
    if (node.callee.type === "Identifier") return SYNC_FNS.has(node.callee.name);
    if (node.callee.type === "MemberExpression" && node.callee.property.type === "Identifier") {
        return SYNC_FNS.has(node.callee.property.name);
    }
    return false;
}

function enclosingAsync(node) {
    let p = node.parent;
    while (p) {
        if (p.type === "FunctionDeclaration" || p.type === "FunctionExpression" || p.type === "ArrowFunctionExpression") {
            return p.async ? p : null;
        }
        p = p.parent;
    }
    return null;
}

module.exports = {
    meta: { type: "problem", docs: { description: "Sync fs in async fn blocks the event loop" }, schema: [], messages: { report: "{{ report }}" } },
    create(context) {
        const raw = (context.filename || context.getFilename()).replace(/\\/g, "/");
        if (raw.includes("/scripts/")) return {};
        const mod = getModuleForFile(raw);
        const file = shortFile(raw);
        return {
            CallExpression(node) {
                if (!isSyncFsCall(node)) return;
                const asyncFn = enclosingAsync(node);
                if (!asyncFn) return;
                const t = trace(node, raw, mod);
                const ctx = getContext(node);
                context.report({ node, messageId: "report", data: { report: build4DReport({
                    rule: "no-sync-io-handler",
                    narrative: `${file}:${node.loc.start.line} performs a sync fs call inside an async function (${ctx}). Sync I/O blocks the Node event loop — every other in-flight request stalls until this returns. The 'async' keyword promised non-blocking; sync fs breaks that contract.`,
                    graph: {
                        X: `${file}:${node.loc.start.line} — sync fs call inside async function`,
                        Y: `during the syscall NO other request is served; tail latency spikes proportional to file size + disk speed`,
                        Z: `Async Functions Must Not Block — the runtime cannot multiplex around sync I/O`,
                        W: `under load, single-digit slow fs calls cascade into request queue buildup; p99 latency explodes`,
                    },
                    remediation: `Use fs/promises async equivalents: \`await fsp.readFile(...)\`. If the file is read-once at boot, hoist to module init (top-level await + import-time read). Never call *Sync inside an async request path.`,
                    trace: t,
                }) } });
            },
        };
    },
};
