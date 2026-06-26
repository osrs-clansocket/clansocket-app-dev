import { ECDSASigValue } from "@peculiar/asn1-ecc";
import { AsnProp, AsnPropTypes, AsnIntegerArrayBufferConverter } from "@peculiar/asn1-schema";
AsnProp({ type: AsnPropTypes.Integer, converter: AsnIntegerArrayBufferConverter })(
    ECDSASigValue.prototype as object,
    "r",
);
AsnProp({ type: AsnPropTypes.Integer, converter: AsnIntegerArrayBufferConverter })(
    ECDSASigValue.prototype as object,
    "s",
);
import logger from "@clansocket/logger";
import express from "express";
import http from "http";
import https from "https";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { ensureCerts } from "./certs.js";
import { initializeDatabase, closeDatabase } from "./database/index.js";
import { runAiCleanup } from "./ai/lifecycle/boot-cleanup.js";
import { attachPluginApi, detachPluginApi, runPluginCleanup } from "./plugin-api/index.js";
import { attachStaticServe } from "./static-serve.js";
import { attachBootMiddleware } from "./boot-middleware.js";
import { mountedApis } from "./api-registry.js";
import { parseDecimal } from "./shared/parsers/decimal-parser.js";
import { seedAll } from "./boot-seed-all.js";
import { loadMaster } from "./boot-vault-master.js";
import "./api-loader.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_ROOT = path.join(__dirname, "..");
const REPO_ROOT = path.join(SERVER_ROOT, "..", "..");
dotenv.config({ path: path.join(REPO_ROOT, ".env") });
const dataDir = path.join(SERVER_ROOT, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const app = express();
app.disable("x-powered-by");
if (!process.env.SERVER_PORT) throw new Error("SERVER_PORT env var required");
if (!process.env.DASHBOARD_PORT) throw new Error("DASHBOARD_PORT env var required");
const PORT = parseDecimal(process.env.SERVER_PORT);
const DASHBOARD_URL = "https://localhost:" + process.env.DASHBOARD_PORT;
const DIST = path.join(REPO_ROOT, "dist");

if (process.env.BEHIND_PROXY === "1") app.set("trust proxy", 1);

attachBootMiddleware(app);

for (const [prefix, r] of mountedApis()) {
    if (prefix) app.use(prefix, r);
    else app.use(r);
}

attachStaticServe(app, DIST, DASHBOARD_URL);

function attachShutdownSignals(server: http.Server | https.Server): void {
    const shutdown = (): void => {
        detachPluginApi();
        closeDatabase();
        server.close();
    };
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
}

async function start(): Promise<void> {
    await initializeDatabase();
    runAiCleanup();
    runPluginCleanup();
    loadMaster();
    seedAll();
    const behindProxy = process.env.BEHIND_PROXY === "1";
    const server = behindProxy ? http.createServer(app) : https.createServer(await ensureCerts(), app);
    const scheme = behindProxy ? "http" : "https";
    server.listen(PORT, () => {
        logger.info(`Server running on ${scheme}://localhost:${PORT}`);
        attachPluginApi(server);
    });
    attachShutdownSignals(server);
}

start();
