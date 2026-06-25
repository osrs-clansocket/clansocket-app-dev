import { spawn } from "child_process";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { resolve, dirname, relative } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const OUT_DIR = resolve(ROOT, ".lint-reports");

function ensureDir(p) {
    if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function runCapture(cmd, args, env = {}) {
    return new Promise((resolveFn) => {
        const child = spawn(cmd, args, {
            cwd: ROOT,
            shell: true,
            env: { ...process.env, ...env },
        });
        let stdout = "";
        let stderr = "";
        child.stdout.on("data", (d) => (stdout += d.toString()));
        child.stderr.on("data", (d) => (stderr += d.toString()));
        child.on("close", (code) => resolveFn({ code, stdout, stderr }));
    });
}

function writeLog(name, result) {
    const log = `# exit ${result.code}\n\n## STDOUT\n${result.stdout}\n\n## STDERR\n${result.stderr}\n`;
    writeFileSync(resolve(OUT_DIR, name), log, "utf-8");
    return result;
}

function parseEslintJson(jsonText) {
    try {
        const data = JSON.parse(jsonText);
        const rollup = {
            totalErrors: 0,
            totalWarnings: 0,
            byFile: {},
            byRule: {},
        };
        for (const fileEntry of data) {
            if (fileEntry.errorCount === 0 && fileEntry.warningCount === 0) continue;
            const rel = relative(ROOT, fileEntry.filePath).split("\\").join("/");
            rollup.byFile[rel] = rollup.byFile[rel] ?? { errors: 0, warnings: 0, rules: {} };
            rollup.byFile[rel].errors += fileEntry.errorCount;
            rollup.byFile[rel].warnings += fileEntry.warningCount;
            rollup.totalErrors += fileEntry.errorCount;
            rollup.totalWarnings += fileEntry.warningCount;
            for (const msg of fileEntry.messages) {
                const rule = msg.ruleId ?? "(no-rule)";
                rollup.byFile[rel].rules[rule] = (rollup.byFile[rel].rules[rule] ?? 0) + 1;
                rollup.byRule[rule] = (rollup.byRule[rule] ?? 0) + 1;
            }
        }
        return rollup;
    } catch (err) {
        return { error: String(err), totalErrors: 0, totalWarnings: 0, byFile: {}, byRule: {} };
    }
}

function parseStylelintJson(jsonText) {
    try {
        const data = JSON.parse(jsonText);
        const rollup = { totalErrors: 0, byFile: {}, byRule: {} };
        for (const file of data) {
            if (file.warnings.length === 0) continue;
            const rel = relative(ROOT, file.source).split("\\").join("/");
            rollup.byFile[rel] = rollup.byFile[rel] ?? { count: 0, rules: {} };
            rollup.byFile[rel].count += file.warnings.length;
            rollup.totalErrors += file.warnings.length;
            for (const w of file.warnings) {
                const rule = w.rule ?? "(no-rule)";
                rollup.byFile[rel].rules[rule] = (rollup.byFile[rel].rules[rule] ?? 0) + 1;
                rollup.byRule[rule] = (rollup.byRule[rule] ?? 0) + 1;
            }
        }
        return rollup;
    } catch (err) {
        return { error: String(err), totalErrors: 0, byFile: {}, byRule: {} };
    }
}

function parseTscOutput(text) {
    const rollup = { totalErrors: 0, byFile: {} };
    const lines = text.split("\n");
    for (const raw of lines) {
        const line = raw.trim();
        if (line.length === 0) continue;
        if (!line.includes(": error TS")) continue;
        const parenIdx = line.indexOf("(");
        if (parenIdx < 0) continue;
        const filePart = line.slice(0, parenIdx);
        const rel = filePart.split("\\").join("/");
        rollup.byFile[rel] = (rollup.byFile[rel] ?? 0) + 1;
        rollup.totalErrors += 1;
    }
    return rollup;
}

function fmtRollupTable(byFile) {
    const entries = Object.entries(byFile).sort((a, b) => {
        const aErr = a[1].errors ?? a[1].count ?? a[1];
        const bErr = b[1].errors ?? b[1].count ?? b[1];
        return bErr - aErr;
    });
    const rows = [];
    for (const [path, info] of entries) {
        if (typeof info === "number") {
            rows.push(`| ${path} | ${info} | — |`);
            continue;
        }
        const count = info.errors ?? info.count ?? 0;
        const rules = Object.keys(info.rules ?? {}).sort().join(", ");
        rows.push(`| ${path} | ${count} | ${rules} |`);
    }
    return rows;
}

function fmtRuleHistogram(byRule) {
    const entries = Object.entries(byRule).sort((a, b) => b[1] - a[1]);
    return entries.map(([rule, count]) => `- \`${rule}\` × ${count}`);
}

function safeParseJson(text, fallback) {
    try {
        return JSON.parse(text);
    } catch {
        return fallback;
    }
}

async function main() {
    ensureDir(OUT_DIR);

    // auto-fix runs FIRST — eslint --fix + stylelint --fix + prettier --write
    // deterministically clear all autofixable rules (lvi/no-comments,
    // lvi/no-console, @stylistic/*, etc.) before the survey passes report on
    // what's left. mandates per workspace policy: any tsc/build/lint/verify
    // check auto-fixes first.
    console.log("[lint-audit] auto-fix ...");
    const autoFixRes = await runCapture("npm", ["run", "auto-fix"]);
    writeLog("auto-fix.log", autoFixRes);

    // sync:tokens MUST run before any eslint pass — refreshes the token-corpus
    // that `lvi/no-mixed-concerns` reads. stale corpus → wrong verdicts.
    // auto-fix already ran sync:tokens as its first step but we re-run here
    // to keep the orchestrator's sync-tokens.log artifact populated for
    // resolve-report and other downstream consumers that read it.
    console.log("[lint-audit] sync tokens ...");
    const syncTokensRes = await runCapture("node", ["scripts/build-scripts/build-token-corpus-script.mjs"]);
    writeLog("sync-tokens.log", syncTokensRes);

    console.log("[lint-audit] eslint discord ...");
    const eslintDiscordJsonPath = resolve(OUT_DIR, "eslint-discord.json");
    const discordRes = await runCapture("npx", [
        "eslint",
        "--config",
        "shared/config/eslint.discord.config.js",
        "main/discord/src/**/*.ts",
        "--format",
        "json",
        "-o",
        eslintDiscordJsonPath,
    ]);
    writeLog("eslint-discord.log", discordRes);
    const discordJson = existsSync(eslintDiscordJsonPath) ? readFileSync(eslintDiscordJsonPath, "utf-8") : "[]";
    const discordRollup = parseEslintJson(discordJson);

    console.log("[lint-audit] eslint dashboard ...");
    const eslintDashJsonPath = resolve(OUT_DIR, "eslint-dashboard.json");
    const dashRes = await runCapture("npx", [
        "eslint",
        "--config",
        "shared/config/eslint.dashboard.config.js",
        "main/dashboard/src/**/*.ts",
        "--format",
        "json",
        "-o",
        eslintDashJsonPath,
    ]);
    writeLog("eslint-dashboard.log", dashRes);
    const dashJson = existsSync(eslintDashJsonPath) ? readFileSync(eslintDashJsonPath, "utf-8") : "[]";
    const dashRollup = parseEslintJson(dashJson);

    console.log("[lint-audit] eslint server ...");
    const eslintSrvJsonPath = resolve(OUT_DIR, "eslint-server.json");
    const srvRes = await runCapture("npx", [
        "eslint",
        "--config",
        "shared/config/eslint.server.config.js",
        "main/server/src/**/*.ts",
        "--format",
        "json",
        "-o",
        eslintSrvJsonPath,
    ]);
    writeLog("eslint-server.log", srvRes);
    const srvJson = existsSync(eslintSrvJsonPath) ? readFileSync(eslintSrvJsonPath, "utf-8") : "[]";
    const srvRollup = parseEslintJson(srvJson);

    console.log("[lint-audit] stylelint ...");
    const stylelintJsonPath = resolve(OUT_DIR, "stylelint.json");
    const cssRes = await runCapture("npx", [
        "stylelint",
        "--config",
        "shared/config/.stylelintrc.json",
        "--ignore-path",
        "shared/config/.stylelintignore",
        "main/dashboard/src/styles/**/*.css",
        "--formatter",
        "json",
        "-o",
        stylelintJsonPath,
    ]);
    writeLog("stylelint.log", cssRes);
    const cssJson = existsSync(stylelintJsonPath) ? readFileSync(stylelintJsonPath, "utf-8") : "[]";
    const cssRollup = parseStylelintJson(cssJson);

    console.log("[lint-audit] css scopes ...");
    const cssScopesJsonPath = resolve(OUT_DIR, "css-scopes.json");
    const cssScopesRes = await runCapture("npx", [
        "eslint",
        "--config",
        "shared/config/eslint.dashboard.config.js",
        "main/dashboard/src/styles/**/*.css",
        "--format",
        "json",
        "-o",
        cssScopesJsonPath,
    ]);
    writeLog("css-scopes.log", cssScopesRes);
    const cssScopesJson = existsSync(cssScopesJsonPath) ? readFileSync(cssScopesJsonPath, "utf-8") : "[]";
    const cssScopesRollup = parseEslintJson(cssScopesJson);

    console.log("[lint-audit] knip ...");
    const knipRes = await runCapture("npx", ["knip", "--config", "shared/config/knip.json", "--reporter", "json"]);
    const knipJsonPath = resolve(OUT_DIR, "knip.json");
    writeFileSync(knipJsonPath, knipRes.stdout || "{}", "utf-8");
    writeLog("knip.log", { code: knipRes.code, stdout: "<written to knip.json>", stderr: knipRes.stderr });
    const knipData = safeParseJson(knipRes.stdout, { issues: [] });
    const knipIssues = knipData.issues || [];
    const sumKnipCategory = (key) => knipIssues.reduce((sum, issue) => sum + (issue[key] || []).length, 0);
    const knipCounts = {
        unusedFiles: sumKnipCategory("files"),
        unusedDependencies: sumKnipCategory("dependencies"),
        unusedDevDependencies: sumKnipCategory("devDependencies"),
        unusedExports: sumKnipCategory("exports"),
        unusedTypes: sumKnipCategory("types"),
        unusedEnumMembers: sumKnipCategory("enumMembers"),
        unusedNamespaceMembers: sumKnipCategory("namespaceMembers"),
        unresolvedImports: sumKnipCategory("unresolved"),
        unlistedImports: sumKnipCategory("unlisted"),
        unusedBinaries: sumKnipCategory("binaries"),
        unusedOptionalPeerDependencies: sumKnipCategory("optionalPeerDependencies"),
        duplicates: sumKnipCategory("duplicates"),
    };

    console.log("[lint-audit] dep-cruiser ...");
    const depCruiseRes = await runCapture("npx", [
        "depcruise",
        "main",
        "shared",
        "--config",
        "shared/config/.dependency-cruiser.cjs",
        "--output-type",
        "json",
    ]);
    const depCruiseJsonPath = resolve(OUT_DIR, "dep-cruise.json");
    writeFileSync(depCruiseJsonPath, depCruiseRes.stdout || "{}", "utf-8");
    writeLog("dep-cruise.log", { code: depCruiseRes.code, stdout: "<written to dep-cruise.json>", stderr: depCruiseRes.stderr });
    const depCruiseData = safeParseJson(depCruiseRes.stdout, { summary: { error: 0, warn: 0, info: 0, violations: [] } });
    const depCruiseCounts = {
        errors: depCruiseData.summary?.error ?? 0,
        warnings: depCruiseData.summary?.warn ?? 0,
        info: depCruiseData.summary?.info ?? 0,
        violations: (depCruiseData.summary?.violations || []).length,
    };

    console.log("[lint-audit] cross-file dup check ...");
    const dupRes = await runCapture("node", ["scripts/audit/audit-cross-file-duplication-script.mjs"]);
    writeLog("dup-check.log", dupRes);

    console.log("[lint-audit] jscpd ...");
    const jscpdRes = await runCapture("npx", ["jscpd", "--config", "shared/config/.jscpd.json"]);
    writeLog("jscpd.log", jscpdRes);
    const jscpdReportPath = resolve(OUT_DIR, "jscpd-report", "jscpd-report.json");
    const jscpdData = existsSync(jscpdReportPath) ? safeParseJson(readFileSync(jscpdReportPath, "utf-8"), {}) : {};
    const jscpdCounts = {
        duplicateGroups: (jscpdData.duplicates || []).length,
        clones: jscpdData.statistics?.total?.clones ?? 0,
        duplicatedLines: jscpdData.statistics?.total?.duplicatedLines ?? 0,
        percentage: jscpdData.statistics?.total?.percentage ?? 0,
    };

    console.log("[lint-audit] sqlfluff ...");
    const sqlfluffRes = await runCapture("python", [
        "-m",
        "sqlfluff",
        "lint",
        "--config",
        "shared/config/.sqlfluff",
        "main/server/src/database/schemas",
    ]);
    writeLog("sqlfluff.log", sqlfluffRes);

    console.log("[lint-audit] schema doctrine + reachability + overlap ...");
    const schemaDoctrineRes = await runCapture("node", ["scripts/audit/audit-schema-doctrine-script.mjs"]);
    writeLog("schema-doctrine.log", schemaDoctrineRes);
    const schemaAuditJsonPath = resolve(OUT_DIR, "schema-audit.json");
    const schemaAuditData = existsSync(schemaAuditJsonPath)
        ? JSON.parse(readFileSync(schemaAuditJsonPath, "utf-8"))
        : null;
    const reachabilityData = schemaAuditData
        ? {
              orphan_columns: schemaAuditData.reachability.totalOrphans,
              orphan_tables: schemaAuditData.reachability.tablesMissing,
              schema_tables: schemaAuditData.schema_tables,
              schema_columns: schemaAuditData.reachability.totalCols,
          }
        : { orphan_columns: 0, orphan_tables: [], schema_tables: 0, schema_columns: 0 };
    const reachabilityRes = schemaDoctrineRes;

    console.log("[lint-audit] verify prompts ...");
    const promptsRes = await runCapture("npx", ["tsx", "scripts/audit/audit-prompt-dupes-script.mjs"]);
    writeLog("verify-prompts.log", promptsRes);

    console.log("[lint-audit] tsc discord ...");
    const tscDiscordRes = await runCapture("npx", ["tsc", "-p", "main/discord/tsconfig.json", "--noEmit"]);
    writeLog("tsc-discord.log", tscDiscordRes);
    const tscDiscordRollup = parseTscOutput(tscDiscordRes.stdout + tscDiscordRes.stderr);

    console.log("[lint-audit] tsc server ...");
    const tscSrvRes = await runCapture("npx", ["tsc", "-p", "main/server/tsconfig.json", "--noEmit"]);
    writeLog("tsc-server.log", tscSrvRes);
    const tscSrvRollup = parseTscOutput(tscSrvRes.stdout + tscSrvRes.stderr);

    console.log("[lint-audit] tsc dashboard ...");
    const tscDashRes = await runCapture("npx", ["tsc", "-p", "main/dashboard/tsconfig.json", "--noEmit"]);
    writeLog("tsc-dashboard.log", tscDashRes);
    const tscDashRollup = parseTscOutput(tscDashRes.stdout + tscDashRes.stderr);

    console.log("[lint-audit] vite build ...");
    const viteRes = await runCapture(
        "npx",
        ["vite", "build", "--config", "main/dashboard/vite.config.ts"],
    );
    writeLog("vite-build.log", viteRes);

    console.log("[lint-audit] verify fonts ...");
    const fontsRes = await runCapture("node", ["scripts/build-scripts/verify-fonts-script.mjs"]);
    writeLog("verify-fonts.log", fontsRes);

    const summary = {
        syncTokens: { exitCode: syncTokensRes.code },
        eslint: {
            discord: { errors: discordRollup.totalErrors, warnings: discordRollup.totalWarnings, files: Object.keys(discordRollup.byFile).length, byRule: discordRollup.byRule },
            dashboard: { errors: dashRollup.totalErrors, warnings: dashRollup.totalWarnings, files: Object.keys(dashRollup.byFile).length, byRule: dashRollup.byRule },
            server: { errors: srvRollup.totalErrors, warnings: srvRollup.totalWarnings, files: Object.keys(srvRollup.byFile).length, byRule: srvRollup.byRule },
            cssScopes: { errors: cssScopesRollup.totalErrors, warnings: cssScopesRollup.totalWarnings, files: Object.keys(cssScopesRollup.byFile).length, byRule: cssScopesRollup.byRule },
        },
        stylelint: { errors: cssRollup.totalErrors, files: Object.keys(cssRollup.byFile).length, byRule: cssRollup.byRule },
        knip: { exitCode: knipRes.code, ...knipCounts },
        depCruiser: { exitCode: depCruiseRes.code, ...depCruiseCounts },
        dupCheck: { exitCode: dupRes.code },
        jscpd: { exitCode: jscpdRes.code, ...jscpdCounts },
        sqlfluff: { exitCode: sqlfluffRes.code },
        schemaDoctrine: { exitCode: schemaDoctrineRes.code },
        schemaReachability: {
            exitCode: reachabilityRes.code,
            orphanColumns: reachabilityData.orphan_columns,
            orphanTables: reachabilityData.orphan_tables.length,
            schemaTables: reachabilityData.schema_tables,
            schemaColumns: reachabilityData.schema_columns,
        },
        verifyPrompts: { exitCode: promptsRes.code },
        tsc: {
            discord: { errors: tscDiscordRollup.totalErrors, files: Object.keys(tscDiscordRollup.byFile).length },
            server: { errors: tscSrvRollup.totalErrors, files: Object.keys(tscSrvRollup.byFile).length },
            dashboard: { errors: tscDashRollup.totalErrors, files: Object.keys(tscDashRollup.byFile).length },
        },
        viteBuild: { exitCode: viteRes.code },
        verifyFonts: { exitCode: fontsRes.code },
    };

    writeFileSync(resolve(OUT_DIR, "summary.json"), JSON.stringify(summary, null, 2), "utf-8");

    const md = [];
    md.push("# lint-audit summary");
    md.push("");
    md.push("ran via `node scripts/lint/run-lint-script.mjs`. each section is the rollup for one verify-related tool.");
    md.push("full per-tool stdout/stderr in `.lint-reports/<tool>.log`. machine-readable per-eslint-tool data in `.lint-reports/<tool>.json`.");
    md.push("");
    md.push("## totals");
    md.push("");
    md.push(`| tool | errors | warnings | distinct files |`);
    md.push(`| --- | --- | --- | --- |`);
    md.push(`| eslint:discord | ${summary.eslint.discord.errors} | ${summary.eslint.discord.warnings} | ${summary.eslint.discord.files} |`);
    md.push(`| eslint:dashboard | ${summary.eslint.dashboard.errors} | ${summary.eslint.dashboard.warnings} | ${summary.eslint.dashboard.files} |`);
    md.push(`| eslint:server | ${summary.eslint.server.errors} | ${summary.eslint.server.warnings} | ${summary.eslint.server.files} |`);
    md.push(`| eslint:css-scopes | ${summary.eslint.cssScopes.errors} | ${summary.eslint.cssScopes.warnings} | ${summary.eslint.cssScopes.files} |`);
    md.push(`| stylelint | ${summary.stylelint.errors} | — | ${summary.stylelint.files} |`);
    md.push(`| knip | ${summary.knip.unusedExports} unused exports | ${summary.knip.unusedDependencies + summary.knip.unusedDevDependencies} unused deps | ${summary.knip.unusedFiles} unused files |`);
    md.push(`| dep-cruise | ${summary.depCruiser.errors} | ${summary.depCruiser.warnings} | — |`);
    md.push(`| jscpd | ${summary.jscpd.clones} clones | — | ${summary.jscpd.duplicatedLines} dup lines (${summary.jscpd.percentage}%) |`);
    md.push(`| tsc:discord | ${summary.tsc.discord.errors} | — | ${summary.tsc.discord.files} |`);
    md.push(`| tsc:server | ${summary.tsc.server.errors} | — | ${summary.tsc.server.files} |`);
    md.push(`| tsc:dashboard | ${summary.tsc.dashboard.errors} | — | ${summary.tsc.dashboard.files} |`);
    md.push(`| schema-reachability | ${summary.schemaReachability.orphanColumns} orphan cols | ${summary.schemaReachability.orphanTables} orphan tables | ${summary.schemaReachability.schemaTables} tables / ${summary.schemaReachability.schemaColumns} cols |`);
    md.push(`| sync:tokens exit | ${summary.syncTokens.exitCode} | — | — |`);
    md.push(`| dup-check exit | ${summary.dupCheck.exitCode} | — | — |`);
    md.push(`| sqlfluff exit | ${summary.sqlfluff.exitCode} | — | — |`);
    md.push(`| schema-doctrine exit | ${summary.schemaDoctrine.exitCode} | — | — |`);
    md.push(`| verify-prompts exit | ${summary.verifyPrompts.exitCode} | — | — |`);
    md.push(`| vite-build exit | ${summary.viteBuild.exitCode} | — | — |`);
    md.push(`| verify-fonts exit | ${summary.verifyFonts.exitCode} | — | — |`);
    md.push("");

    function appendSection(title, rollup) {
        md.push(`## ${title}`);
        md.push("");
        if (Object.keys(rollup.byRule).length > 0) {
            md.push("### by rule");
            md.push("");
            md.push(...fmtRuleHistogram(rollup.byRule));
            md.push("");
        }
        if (Object.keys(rollup.byFile).length > 0) {
            md.push("### by file");
            md.push("");
            md.push(`| file | count | rules |`);
            md.push(`| --- | --- | --- |`);
            md.push(...fmtRollupTable(rollup.byFile));
            md.push("");
        }
    }

    appendSection("eslint:discord", discordRollup);
    appendSection("eslint:dashboard", dashRollup);
    appendSection("eslint:server", srvRollup);
    appendSection("eslint:css-scopes", cssScopesRollup);
    appendSection("stylelint", cssRollup);

    md.push("## tsc:discord");
    md.push("");
    md.push(`| file | error count |`);
    md.push(`| --- | --- |`);
    md.push(...fmtRollupTable(tscDiscordRollup.byFile));
    md.push("");

    md.push("## tsc:server");
    md.push("");
    md.push(`| file | error count |`);
    md.push(`| --- | --- |`);
    md.push(...fmtRollupTable(tscSrvRollup.byFile));
    md.push("");

    md.push("## tsc:dashboard");
    md.push("");
    md.push(`| file | error count |`);
    md.push(`| --- | --- |`);
    md.push(...fmtRollupTable(tscDashRollup.byFile));
    md.push("");

    md.push("## knip");
    md.push("");
    md.push(`unused — files: ${summary.knip.unusedFiles}, exports: ${summary.knip.unusedExports}, types: ${summary.knip.unusedTypes}, deps: ${summary.knip.unusedDependencies}, devDeps: ${summary.knip.unusedDevDependencies}, enum members: ${summary.knip.unusedEnumMembers}, duplicates: ${summary.knip.duplicates}. full output in \`.lint-reports/knip.{json,log}\`.`);
    md.push("");

    md.push("## dep-cruiser");
    md.push("");
    md.push(`${summary.depCruiser.errors} errors, ${summary.depCruiser.warnings} warnings, ${summary.depCruiser.info} info. full output in \`.lint-reports/dep-cruise.{json,log}\`.`);
    md.push("");

    md.push("## jscpd");
    md.push("");
    md.push(`${summary.jscpd.clones} clones across ${summary.jscpd.duplicateGroups} duplicate groups, ${summary.jscpd.duplicatedLines} duplicated lines (${summary.jscpd.percentage}%). full output in \`.lint-reports/jscpd-report/\`.`);
    md.push("");

    md.push("## sync-tokens");
    md.push("");
    md.push(`exit code ${summary.syncTokens.exitCode}. full output in \`.lint-reports/sync-tokens.log\`.`);
    md.push("");

    md.push("## dup-check");
    md.push("");
    md.push(`exit code ${summary.dupCheck.exitCode}. full output in \`.lint-reports/dup-check.log\`.`);
    md.push("");

    md.push("## sqlfluff");
    md.push("");
    md.push(`exit code ${summary.sqlfluff.exitCode}. full output in \`.lint-reports/sqlfluff.log\`.`);
    md.push("");

    md.push("## schema-doctrine");
    md.push("");
    md.push(`exit code ${summary.schemaDoctrine.exitCode}. full output in \`.lint-reports/schema-doctrine.log\`.`);
    md.push("");

    md.push("## schema-reachability");
    md.push("");
    md.push(`${summary.schemaReachability.orphanColumns} orphan columns across ${summary.schemaReachability.orphanTables} fully-orphan tables. exit code always 0 (informational). full output in \`.lint-reports/schema-reachability.{json,log}\`.`);
    md.push("");

    md.push("## verify-prompts");
    md.push("");
    md.push(`exit code ${summary.verifyPrompts.exitCode}. full output in \`.lint-reports/verify-prompts.log\`.`);
    md.push("");

    md.push("## vite-build");
    md.push("");
    md.push(`exit code ${summary.viteBuild.exitCode}. full output in \`.lint-reports/vite-build.log\`.`);
    md.push("");

    md.push("## verify-fonts");
    md.push("");
    md.push(`exit code ${summary.verifyFonts.exitCode}. full output in \`.lint-reports/verify-fonts.log\`.`);
    md.push("");

    writeFileSync(resolve(OUT_DIR, "summary.md"), md.join("\n"), "utf-8");

    console.log("");
    console.log("[lint-audit] complete. reports in .lint-reports/");
    console.log(`  sync:tokens         exit ${summary.syncTokens.exitCode}`);
    console.log(`  eslint:discord      ${summary.eslint.discord.errors} errors across ${summary.eslint.discord.files} files`);
    console.log(`  eslint:dashboard    ${summary.eslint.dashboard.errors} errors across ${summary.eslint.dashboard.files} files`);
    console.log(`  eslint:server       ${summary.eslint.server.errors} errors across ${summary.eslint.server.files} files`);
    console.log(`  eslint:scopes       ${summary.eslint.cssScopes.errors} errors across ${summary.eslint.cssScopes.files} files`);
    console.log(`  stylelint           ${summary.stylelint.errors} errors across ${summary.stylelint.files} files`);
    console.log(`  knip                ${summary.knip.unusedFiles} unused files, ${summary.knip.unusedExports} unused exports, ${summary.knip.unusedDependencies + summary.knip.unusedDevDependencies} unused deps`);
    console.log(`  dep-cruise          ${summary.depCruiser.errors} errors, ${summary.depCruiser.warnings} warnings`);
    console.log(`  dup-check           exit ${summary.dupCheck.exitCode}`);
    console.log(`  jscpd               ${summary.jscpd.clones} clones, ${summary.jscpd.duplicatedLines} dup lines`);
    console.log(`  sqlfluff            exit ${summary.sqlfluff.exitCode}`);
    console.log(`  schema-doctrine     exit ${summary.schemaDoctrine.exitCode}`);
    console.log(`  schema-reachability ${summary.schemaReachability.orphanColumns} orphan cols, ${summary.schemaReachability.orphanTables} orphan tables`);
    console.log(`  verify-prompts      exit ${summary.verifyPrompts.exitCode}`);
    console.log(`  tsc:discord         ${summary.tsc.discord.errors} errors across ${summary.tsc.discord.files} files`);
    console.log(`  tsc:server          ${summary.tsc.server.errors} errors across ${summary.tsc.server.files} files`);
    console.log(`  tsc:dashboard       ${summary.tsc.dashboard.errors} errors across ${summary.tsc.dashboard.files} files`);
    console.log(`  vite-build          exit ${summary.viteBuild.exitCode}`);
    console.log(`  verify-fonts        exit ${summary.verifyFonts.exitCode}`);
}

main().catch((err) => {
    console.error("[lint-audit] failed:", err);
    process.exit(1);
});
