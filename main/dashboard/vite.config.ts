import { defineConfig, loadEnv } from "vite";
import { resolve } from "path";
import fs from "fs";
import { compression } from "vite-plugin-compression2";
import { sri } from "vite-plugin-sri3";
import iconsSubsetPlugin from "./vite-icons-subset-plugin.mjs";

const certDir = resolve(__dirname, "..", "server", "certs");
const keyPath = resolve(certDir, "key.pem");
const certPath = resolve(certDir, "cert.pem");

const httpsOpts =
    fs.existsSync(keyPath) && fs.existsSync(certPath)
        ? { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }
        : true;

export default defineConfig(({ mode, command }) => {
    const env = loadEnv(mode, resolve(__dirname, "..", ".."), "");
    if (!env.DASHBOARD_PORT) throw new Error("DASHBOARD_PORT env var required");
    if (!env.SERVER_PORT) throw new Error("SERVER_PORT env var required");
    const DASHBOARD_PORT = parseInt(env.DASHBOARD_PORT, 10);
    const PROXY_TARGET = "https://localhost:" + env.SERVER_PORT;

    // SKIP_PUBLIC=1 disables the public-dir copy step at BUILD only. The public
    // tree contains ~110k OSRS world-map tile webps that take significant time to
    // copy + clean on Windows (rmSync on a previous dist/resources can hit
    // ENOTEMPTY when killed builds leave file locks). For iterative code
    // changes that don't touch /public, skipping the copy is a clean speedup.
    // Full builds (and any build where /public assets need to be in dist/)
    // run without the flag. The command guard keeps `vite serve` serving public/
    // unconditionally so dev fonts/favicon resolve even when the flag is in .env.
    const skipPublic = command === "build" && (env.SKIP_PUBLIC === "1" || env.SKIP_PUBLIC === "true");

    return {
        root: resolve(__dirname, "..", ".."),
        publicDir: skipPublic ? false : resolve(__dirname, "..", "..", "public"),
        cacheDir: resolve(__dirname, "..", "..", ".cache", "vite-dashboard"),
        build: {
            outDir: resolve(__dirname, "..", "..", "dist"),
            emptyOutDir: true,
            target: "esnext",
            cssMinify: "lightningcss",
            modulePreload: { polyfill: false },
            rollupOptions: {
                input: resolve(__dirname, "..", "..", "index.html"),
                output: {
                    manualChunks(id) {
                        // Vendor splits — small set of explicit lazy chunks.
                        if (id.includes("node_modules/marked")) return "vendor-marked";
                        if (id.includes("prismjs/components/")) return "vendor-prism-langs";
                        if (id.endsWith("ai/prism-setup.ts")) return "prism-setup";

                        // Heavy libs used by lazy routes — RETURN UNDEFINED so Vite auto-splits
                        // them with their consumer route chunks rather than hauling them all
                        // into a single eager vendor mega-chunk. Each named lib here is a
                        // verified dashboard import that's >50 KB and only used by 1-2 lazy
                        // routes (charting pages, voxlab, image-processing flows).
                        if (id.includes("node_modules/chart.js")) return undefined;
                        if (id.includes("node_modules/chartjs-")) return undefined;
                        if (id.includes("node_modules/date-fns")) return undefined;
                        // three + three-mesh-bvh are voxlab/clan-model-icon only; route-chunk them.
                        if (id.includes("node_modules/three/")) return undefined;
                        if (id.includes("node_modules/three-mesh-bvh")) return undefined;
                        if (id.includes("node_modules/upng-js")) return undefined;
                        if (id.includes("node_modules/wawoff2")) return undefined;
                        if (id.includes("node_modules/svg-pathdata")) return undefined;
                        if (id.includes("node_modules/dompurify")) return undefined;

                        // Everything else from node_modules goes into a single vendor chunk
                        // — small libs that benefit from being co-located for cache reuse.
                        if (id.includes("node_modules")) return "vendor";
                    },
                    chunkFileNames: "assets/[name]-[hash].js",
                    entryFileNames: "assets/[name]-[hash].js",
                    assetFileNames: "assets/[name]-[hash][extname]",
                },
                onwarn(warning, defaultHandler) {
                    if (typeof warning.message === "string" && warning.message.includes("didn't resolve at build time"))
                        return;
                    defaultHandler(warning);
                },
            },
            reportCompressedSize: false,
            chunkSizeWarningLimit: 200,
        },
        resolve: {
            alias: {
                "@": resolve(__dirname, "src"),
                path: resolve(__dirname, "src/stubs/empty-path.ts"),
            },
        },
        plugins: [
            iconsSubsetPlugin(),
            sri(),
            compression({ algorithms: ["brotliCompress"], exclude: [/\.(png|jpg|gif|woff2?)$/], threshold: 256 }),
        ],
        server: {
            https: httpsOpts,
            port: DASHBOARD_PORT,
            fs: {
                strict: true,
                deny: [
                    "**/main/server/data/**",
                    "**/main/server/certs/**",
                    "**/main/server/src/**",
                    "**/main/discord/**",
                    "**/.env",
                    "**/.env.*",
                    "**/*.db",
                    "**/*.db-journal",
                    "**/*.db-wal",
                    "**/*.db-shm",
                    "**/*.pem",
                    "**/*.key",
                    "**/.git/**",
                    "**/ecosystem.config.*",
                    "**/package-lock.json",
                    "**/.gitignore",
                    "**/.gitattributes",
                    "**/.npmrc",
                    "**/CLAUDE.md",
                ],
            },
            watch: {
                ignored: [
                    "**/main/server/data/**",
                    "**/main/server/certs/**",
                    "**/.cache/**",
                    "**/dist/**",
                    "**/.lint-reports/**",
                    "**/.lint-cleanup/**",
                    "**/node_modules/**",
                    "**/public/resources/osrs/**",
                ],
            },
            proxy: {
                "/api": {
                    target: PROXY_TARGET,
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
        optimizeDeps: {
            include: ["marked", "prismjs"],
        },
    };
});
