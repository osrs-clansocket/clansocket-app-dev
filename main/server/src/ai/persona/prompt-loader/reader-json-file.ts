import { readFileSync } from "fs";

export function readJson<T>(filePath: string): T {
    return JSON.parse(readFileSync(filePath, "utf-8"));
}
