export interface DispatcherSpec {
    readonly kind: string;
}

export abstract class BaseDispatcher implements DispatcherSpec {
    public abstract readonly kind: string;
}
