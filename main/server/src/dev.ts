import logger from "@clansocket/logger";
import { spawn } from "child_process";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { ensureCerts } from "./certs.js";
import { bindProcessExit } from "./dev-server-proc.js";
import { buildServerCommand } from "./builder-server-command.js";
import { parseDecimal } from "./shared/parsers/decimal-parser.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_ROOT = path.join(__dirname, "..");
const REPO_ROOT = path.join(SERVER_ROOT, "..", "..");
dotenv.config({ path: path.join(REPO_ROOT, ".env") });
if (!process.env.SERVER_PORT) throw new Error("SERVER_PORT env var required");
const PORT = parseDecimal(process.env.SERVER_PORT);

const WAIT_PROBE_TIMEOUT_MS = 500;
const WAIT_PROBE_INTERVAL_MS = 300;
const WAIT_DEFAULT_ATTEMPTS = 90;

async function waitForServer(url: string, maxAttempts = WAIT_DEFAULT_ATTEMPTS): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            await new Promise<void>((resolve, reject) => {
                const req = https.get(url, { rejectUnauthorized: false }, (res) => {
                    res.resume();
                    resolve();
                });
                req.on("error", reject);
                req.setTimeout(WAIT_PROBE_TIMEOUT_MS, () => {
                    req.destroy();
                    reject(new Error("timeout"));
                });
            });
            return;
        } catch (err) {
            logger.debug(`[dev] probe attempt ${i + 1}/${maxAttempts} failed: ${(err as Error).message}`);
            await new Promise((r) => setTimeout(r, WAIT_PROBE_INTERVAL_MS));
        }
    }
    throw new Error(`Server not ready at ${url} after ${maxAttempts} attempts`);
}

async function main(): Promise<void> {
    logger.info("[dev] Ensuring certificates...");
    await ensureCerts();
    logger.info("[dev] Starting server...");
    const serverScript = path.join(__dirname, "index.ts");
    const server = spawn(buildServerCommand(serverScript), {
        stdio: "inherit",
        shell: true,
        cwd: SERVER_ROOT,
        env: { ...process.env, NODE_ENV: "development" },
    });
    bindProcessExit(server);
    logger.info("[dev] Waiting for server...");
    await waitForServer(`https://localhost:${PORT}/`);
    logger.info("[dev] Server ready");
}

main();
