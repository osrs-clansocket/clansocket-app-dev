export function passphraseBytes(passphrase: string): BufferSource {
    const normalized = passphrase.trim().normalize("NFC");
    return new TextEncoder().encode(normalized) as unknown as BufferSource;
}
