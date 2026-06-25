export function randomBytes(byteLength: number): Uint8Array {
    const buf = new Uint8Array(new ArrayBuffer(byteLength));
    crypto.getRandomValues(buf);
    return buf;
}
