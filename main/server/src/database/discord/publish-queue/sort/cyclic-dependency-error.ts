export class CyclicDependencyError extends Error {
    constructor() {
        super("Cyclic dependency in draft session — cannot topologically sort");
        this.name = "CyclicDependencyError";
    }
}
