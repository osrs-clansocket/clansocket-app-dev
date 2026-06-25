export abstract class BaseManager {
    abstract load(): Promise<void>;

    reconcile?(): Promise<void>;

    shutdown?(): Promise<void>;
}
