interface NavigatorWithGpu {
    gpu?: { requestAdapter(): Promise<unknown> };
}

let cachedAvailability: boolean | null = null;
let pendingProbe: Promise<boolean> | null = null;

export function webgpuAvailable(): Promise<boolean> {
    if (cachedAvailability !== null) return Promise.resolve(cachedAvailability);
    if (pendingProbe !== null) return pendingProbe;
    const nav = navigator as NavigatorWithGpu;
    pendingProbe = (async () => {
        if (!nav.gpu) return false;
        try {
            const adapter = await nav.gpu.requestAdapter();
            return adapter !== null;
        } catch {
            return false;
        }
    })().then((avail) => {
        cachedAvailability = avail;
        pendingProbe = null;
        return avail;
    });
    return pendingProbe;
}

export function webgpuApiPresent(): boolean {
    return Boolean((navigator as NavigatorWithGpu).gpu);
}
