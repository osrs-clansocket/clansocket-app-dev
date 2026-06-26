import type { ContainerCause, ContainerItem } from "./container-types.js";
import type { ContainerChangeCtx } from "./container-changes-types.js";

export interface ContainerConfig {
    table: string;
    cols: string[];
    build: (ctx: ContainerChangeCtx, c: ContainerItem, cause: ContainerCause) => void;
}

export function containerCfg(table: string, cols: string[], build: ContainerConfig["build"]): ContainerConfig {
    return { table, cols, build };
}
