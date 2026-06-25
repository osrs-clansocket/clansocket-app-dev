import { spawnSync } from "node:child_process";

const PASSES = [
    {
        label: "sync:tokens",
        cmd: "node",
        args: ["scripts/build-scripts/build-token-corpus-script.mjs"],
    },
    {
        label: "prettier --write",
        cmd: "npx",
        args: ["prettier", "--config", "shared/config/.prettierrc", "--write", "main/**/*.{js,ts,json,css}"],
    },
    {
        label: "eslint --fix discord",
        cmd: "npx",
        args: ["eslint", "--fix", "--config", "shared/config/eslint.discord.config.js", "main/discord/src/**/*.ts"],
    },
    {
        label: "eslint --fix dashboard",
        cmd: "npx",
        args: ["eslint", "--fix", "--config", "shared/config/eslint.dashboard.config.js", "main/dashboard/src/**/*.ts"],
    },
    {
        label: "eslint --fix server",
        cmd: "npx",
        args: ["eslint", "--fix", "--config", "shared/config/eslint.server.config.js", "main/server/src/**/*.ts"],
    },
    {
        label: "eslint --fix CSS scopes",
        cmd: "npx",
        args: ["eslint", "--fix", "--config", "shared/config/eslint.dashboard.config.js", "main/dashboard/src/styles/**/*.css"],
    },
    {
        label: "stylelint --fix",
        cmd: "npx",
        args: ["stylelint", "--fix", "--config", "shared/config/.stylelintrc.json", "main/dashboard/src/styles/**/*.css"],
    },
];

const failures = [];
for (const pass of PASSES) {
    process.stdout.write(`[auto-fix] ${pass.label} ...\n`);
    const result = spawnSync(pass.cmd, pass.args, { shell: true, stdio: "inherit" });
    if (result.status !== 0) {
        failures.push({ label: pass.label, code: result.status });
        process.stdout.write(`[auto-fix] ${pass.label} exited ${result.status} — continuing.\n`);
    }
}

const clean = PASSES.length - failures.length;
process.stdout.write(`\n[auto-fix] complete. ${clean}/${PASSES.length} passes clean.\n`);
if (failures.length > 0) {
    process.stdout.write(`[auto-fix] passes with unfixable violations remaining (expected during cleanup grind):\n`);
    for (const f of failures) {
        process.stdout.write(`  - ${f.label} (exit ${f.code})\n`);
    }
}

process.exit(0);
