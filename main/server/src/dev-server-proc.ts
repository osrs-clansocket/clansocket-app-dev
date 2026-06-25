import logger from "@clansocket/logger";
import type { spawn } from "child_process";

export type DevServerProc = ReturnType<typeof spawn>;

export function buildServerCommand(serverScript: string): string {
    const quote = (a: string): string => {
        for (let i = 0; i < a.length; i++) {
            const c = a.charAt(i);
            if (c === " " || c === "\t") return `"${a}"`;
        }
        return a;
    };
    return ["npx", "tsx", "--watch", serverScript].map(quote).join(" ");
}

export function attachExitHandler(server: DevServerProc): void {
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
