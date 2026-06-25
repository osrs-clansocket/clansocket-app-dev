import logger from "@clansocket/logger";
import { mkdir, readFile, writeFile, stat } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import selfsigned from "selfsigned";
import { mtimeCertExpired, opensslAvailable, opensslCertExpired } from "./certs-expiry.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CERT_DIR = path.join(__dirname, "..", "certs");
const KEY_PATH = path.join(CERT_DIR, "key.pem");
const CERT_PATH = path.join(CERT_DIR, "cert.pem");

async function pathExists(p: string): Promise<boolean> {
    try {
        await stat(p);
        return true;
    } catch {
        return false;
    }
}

async function certsValid(): Promise<boolean> {
    if (!(await pathExists(KEY_PATH)) || !(await pathExists(CERT_PATH))) return false;
    try {
        const certPem = await readFile(CERT_PATH, "utf-8");
        const keyPem = await readFile(KEY_PATH, "utf-8");
        if (!certPem.includes("BEGIN CERTIFICATE") || !keyPem.includes("PRIVATE KEY")) return false;
        if (opensslAvailable()) return !opensslCertExpired(CERT_PATH);
        return !(await mtimeCertExpired(CERT_PATH));
    } catch (err) {
        logger.debug(`[certs] certsValid read failed: ${(err as Error).message}`);
        return false;
    }
}

async function generate(): Promise<void> {
    const attrs = [{ name: "commonName", value: "localhost" }];
    const pems = await selfsigned.generate(attrs, {
        keySize: 2048,
        validity: 365,
        algorithm: "sha256",
        extensions: [
            {
                name: "subjectAltName",
                altNames: [
                    { type: 2, value: "localhost" },
                    { type: 7, ip: "127.0.0.1" },
                ],
            },
        ],
    } as Parameters<typeof selfsigned.generate>[1]);

    await writeFile(KEY_PATH, pems.private);
    await writeFile(CERT_PATH, pems.cert);
}

export async function ensureCerts(): Promise<{ key: Buffer; cert: Buffer }> {
    if (!(await pathExists(CERT_DIR))) await mkdir(CERT_DIR, { recursive: true });

    if (await certsValid()) {
        logger.info("[certs] Valid certificate found");
        return { key: await readFile(KEY_PATH), cert: await readFile(CERT_PATH) };
    }

    logger.info("[certs] Generating self-signed certificate...");
    await generate();
    logger.info("[certs] Certificate written to certs/");

    return { key: await readFile(KEY_PATH), cert: await readFile(CERT_PATH) };
}
