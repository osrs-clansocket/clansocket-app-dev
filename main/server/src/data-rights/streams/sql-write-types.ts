import type { DbWriteKind } from "./writes-stream.js";

export interface WriteSig {
    kind: DbWriteKind;
    table: string;
}
