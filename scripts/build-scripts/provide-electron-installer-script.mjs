import { rmSync, renameSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(__dirname, "..", "..");

const pkgPath = resolve(APP_ROOT, "main", "electron", "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
const version = pkg.version;
const productName = pkg.build && pkg.build.productName ? pkg.build.productName : "ClanSocket";

const SITE_ORIGIN = "https://clansocket.com";
const PROVIDE_URL_PREFIX = SITE_ORIGIN + "/provide/";
const SIGNED_MARKER_PATH = resolve(APP_ROOT, "desktop-dist", ".signpath-signed");
const SIGNED = existsSync(SIGNED_MARKER_PATH);

function pad2(n) {
    return n < 10 ? "0" + n : String(n);
}

const now = new Date();
const month = pad2(now.getMonth() + 1);
const day = pad2(now.getDate());
const year = pad2(now.getFullYear() % 100);
const dateStr = month + day + year;

const SRC_DIR = resolve(APP_ROOT, "desktop-dist");
const DEST_DIR = resolve(APP_ROOT, "public", "provide");

const ARTIFACTS = [
    {
        src: productName + " Setup " + version + ".exe",
        dest: "clansocket-" + version + "-" + dateStr + ".exe",
        latest: "clansocket-latest.exe",
        platform: "win",
    },
    {
        src: productName + "-" + version + "-linux.tar.gz",
        dest: "clansocket-" + version + "-" + dateStr + "-linux.tar.gz",
        latest: "clansocket-latest-linux.tar.gz",
        platform: "linux",
    },
];

if (!existsSync(DEST_DIR)) {
    mkdirSync(DEST_DIR, { recursive: true });
}

function sha256OfFile(path) {
    const hash = createHash("sha256");
    hash.update(readFileSync(path));
    return hash.digest("hex");
}

function writeSha256Sidecar(path) {
    const hash = sha256OfFile(path);
    const sidecar = path + ".sha256";
    writeFileSync(sidecar, hash + "  " + basename(path) + "\n", "utf8");
    return hash;
}

let moved = 0;
const manifestPlatforms = {};

for (const artifact of ARTIFACTS) {
    const src = resolve(SRC_DIR, artifact.src);
    const dest = resolve(DEST_DIR, artifact.dest);
    const latest = resolve(DEST_DIR, artifact.latest);
    if (!existsSync(src)) {
        process.stdout.write("skip (not built): " + artifact.src + "\n");
        continue;
    }
    if (existsSync(dest)) rmSync(dest, { force: true });
    renameSync(src, dest);
    process.stdout.write("provided -> " + dest + "\n");
    if (existsSync(latest)) rmSync(latest, { force: true });
    cpSync(dest, latest);
    process.stdout.write("alias    -> " + latest + "\n");
    const sha256 = writeSha256Sidecar(latest);
    process.stdout.write("sha256   -> " + latest + ".sha256\n");
    manifestPlatforms[artifact.platform] = {
        filename: artifact.latest,
        downloadUrl: PROVIDE_URL_PREFIX + artifact.latest,
        sha256,
        size: statSync(latest).size,
        signed: artifact.platform === "win" ? SIGNED : false,
    };
    moved++;
}

if (moved === 0) {
    process.stderr.write("no installer artifacts found in " + SRC_DIR + "\n");
    process.exit(1);
}

const manifest = {
    version,
    releasedAt: now.toISOString(),
    platforms: manifestPlatforms,
};

const manifestPath = resolve(DEST_DIR, "latest.json");
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
process.stdout.write("manifest -> " + manifestPath + "\n");
