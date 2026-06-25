export function sampleFromAlphabet(bytes: Buffer | Uint8Array, alphabet: string): string {
    const parts: string[] = [];
    for (const byte of bytes) parts.push(alphabet[byte % alphabet.length]!);
    return parts.join("");
}
