import logger from "@clansocket/logger";
import { stat } from "fs/promises";
import { execSync } from "child_process";
import { MS_PER_DAY } from "./shared/time.js";

const NOT_AFTER_KEY = "notAfter=";
const CERT_MAX_AGE_DAYS = 300;

export function opensslCertExpired(certPath: string): boolean {
    const result = execSync(`openssl x509 -enddate -noout -in "${certPath}"`, { encoding: "utf-8" });
    const keyIdx = result.indexOf(NOT_AFTER_KEY);
    if (keyIdx === -1) return false;
    let endIdx = result.indexOf("\n", keyIdx);
    if (endIdx === -1) endIdx = result.length;
    const dateStr = result.slice(keyIdx + NOT_AFTER_KEY.length, endIdx).trim();
    return new Date(dateStr).getTime() < Date.now();
}

export async function mtimeCertExpired(certPath: string): Promise<boolean> {
    const info = await stat(certPath);
    const ageDays = (Date.now() - info.mtimeMs) / MS_PER_DAY;
    return ageDays > CERT_MAX_AGE_DAYS;
}

export function opensslAvailable(): boolean {
    try {
        execSync("openssl version", { stdio: "ignore" });
        return true;
    } catch (err) {
        logger.debug(`[certs] openssl unavailable: ${(err as Error).message}`);
        return false;
    }
}
