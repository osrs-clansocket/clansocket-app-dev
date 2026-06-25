const BASE64_CHUNK = 0x8000;

export function bytesToBase64(bytes: Uint8Array): string {
    const parts: string[] = [];
    for (let i = 0; i < bytes.length; i += BASE64_CHUNK) {
        const end = Math.min(i + BASE64_CHUNK, bytes.length);
        const chunk = bytes.subarray(i, end);
        parts.push(String.fromCharCode.apply(null, Array.from(chunk)));
    }
    return btoa(parts.join(""));
}
