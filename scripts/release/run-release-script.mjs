import { readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(__dirname, "..", "..");

const VALID_BUMPS = new Set(["patch", "minor", "major"]);
const SEMVER_PARTS = 3;

function bumpSemver(current, kind) {
    const parts = current.split(".").map((p) => Number(p));
    if (parts.length !== SEMVER_PARTS || parts.some((p) => !Number.isInteger(p) || p < 0)) {
        throw new Error("invalid semver: " + current);
    }
    const [major, minor, patch] = parts;
    if (kind === "patch") return major + "." + minor + "." + (patch + 1);
    if (kind === "minor") return major + "." + (minor + 1) + ".0";
    return major + 1 + ".0.0";
}

function main() {
    const bump = process.argv[2];
    if (!VALID_BUMPS.has(bump)) {
        process.stderr.write("usage: node scripts/release/run-release-script.mjs [patch|minor|major]\n");
        process.stderr.write("       (or: npm run release:patch / release:minor / release:major)\n");
        process.exit(2);
    }

    const pkgPath = resolve(APP_ROOT, "main", "electron", "package.json");
    const pkgText = readFileSync(pkgPath, "utf8");
    const pkg = JSON.parse(pkgText);
    const prevVersion = pkg.version;
    const nextVersion = bumpSemver(prevVersion, bump);

    pkg.version = nextVersion;
    const indentMatch = pkgText.match(/^(\s+)"name"/m);
    const indent = indentMatch ? indentMatch[1].length : 4;
    writeFileSync(pkgPath, JSON.stringify(pkg, null, indent) + "\n", "utf8");
    process.stdout.write("bumped: " + prevVersion + " -> " + nextVersion + "\n");

    process.stdout.write("\nbuilding electron release " + nextVersion + "...\n\n");
    const result = spawnSync("npm", ["run", "package:electron"], {
        stdio: "inherit",
        cwd: APP_ROOT,
        shell: true,
    });

    if (result.status !== 0) {
        process.stderr.write("\nbuild failed; reverting version bump\n");
        writeFileSync(pkgPath, pkgText, "utf8");
        process.exit(result.status ?? 1);
    }

    process.stdout.write("\nrelease " + nextVersion + " built. next steps:\n");
    process.stdout.write("  1. edit main/electron/CHANGELOG.md with release notes\n");
    process.stdout.write("  2. git add main/electron/package.json main/electron/CHANGELOG.md public/provide/\n");
    process.stdout.write('  3. git commit -m "electron release ' + nextVersion + '"\n');
    process.stdout.write("  4. git tag electron-v" + nextVersion + "\n");
    process.stdout.write("  5. npm run deploy:live\n");
    process.stdout.write("  6. git push && git push --tags\n");
}

main();
