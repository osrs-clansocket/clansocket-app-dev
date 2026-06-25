import type { BufferEntry } from "./audit-client-config.js";

const _buffer: BufferEntry[] = [];

export function getBuffer(): BufferEntry[] {
    return _buffer;
}
