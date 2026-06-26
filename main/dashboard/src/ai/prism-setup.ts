type PrismApi = typeof import("prismjs");

let prismReady: PrismApi | null = null;
let prismLoading: Promise<PrismApi> | null = null;

async function bootstrap(): Promise<PrismApi> {
    const mod = await import("prismjs");
    const _Prism = (mod as unknown as { default: PrismApi }).default;
    (globalThis as typeof globalThis & { Prism: PrismApi }).Prism = _Prism;
    await Promise.all([
        import("prismjs/components/prism-javascript"),
        import("prismjs/components/prism-typescript"),
        import("prismjs/components/prism-json"),
        import("prismjs/components/prism-bash"),
        import("prismjs/components/prism-sql"),
        import("prismjs/components/prism-markdown"),
    ]);
    prismReady = _Prism;
    return _Prism;
}

export function loadPrism(): Promise<PrismApi> {
    if (prismLoading) return prismLoading;
    prismLoading = bootstrap();
    return prismLoading;
}

export function prismOrNull(): PrismApi | null {
    return prismReady;
}

void loadPrism();
