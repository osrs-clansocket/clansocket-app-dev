import logger from "@clansocket/logger";
import type { spawn } from "child_process";

export type DevServerProc = ReturnType<typeof spawn>;

export function bindProcessExit(server: DevServerProc): void {
    server.on("exit", (code) => {
        if (code !== null && code !== 0) {
            logger.error(`[dev] Server exited with code ${code}`);
            process.exit(code);
        }
    });
    const cleanup = (): void => {
        server.kill();
    };
    process.on("SIGTERM", cleanup);
    process.on("SIGINT", cleanup);
}
