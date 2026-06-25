export function asBytes(view: Float32Array | Uint32Array): Uint8Array {
    return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
}

export function alignBuffer(input: ArrayBuffer | Uint8Array): ArrayBuffer {
    if (input instanceof Uint8Array) {
        const src = input.buffer;
        if (src instanceof ArrayBuffer) {
            return src.slice(input.byteOffset, input.byteOffset + input.byteLength);
        }
        const copy = new ArrayBuffer(input.byteLength);
        new Uint8Array(copy).set(input);
        return copy;
    }
    return input;
}
